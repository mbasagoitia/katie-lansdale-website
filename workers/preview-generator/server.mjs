import {createServer} from "node:http"
import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises"
import {tmpdir} from "node:os"
import {join} from "node:path"
import {timingSafeEqual} from "node:crypto"
import {execFile} from "node:child_process"
import {promisify} from "node:util"

const execFileAsync = promisify(execFile)
const port = Number(process.env.PORT || 8080)
const supabaseUrl = required("SUPABASE_URL").replace(/\/$/, "")
const serviceKey = required("SUPABASE_SECRET_KEY")
const sharedSecret = required("PREVIEW_WORKER_SHARED_SECRET")
const previewSeconds = 30
let processing = false

const server = createServer((request, response) => {
  void handle(request, response)
})

server.listen(port, "0.0.0.0", () => {
  console.info(`Preview worker listening on ${port}`)
  void processNextJob()
})

const poller = setInterval(() => void processNextJob(), 15_000)

process.on("SIGTERM", () => {
  clearInterval(poller)
  server.close(() => process.exit(0))
})

async function handle(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`)
  if (request.method === "GET" && url.pathname === "/health") return sendJson(response, 200, {ok: true})
  if (request.method === "POST" && /^\/jobs\/[0-9a-f-]+$/i.test(url.pathname)) {
    if (!hasValidSecret(request.headers.authorization)) return sendJson(response, 401, {error: "Unauthorized"})
    const id = url.pathname.split("/").at(-1)
    void processJob(id)
    return sendJson(response, 202, {id, status: "queued"})
  }
  return sendJson(response, 404, {error: "Not found"})
}

async function processNextJob() {
  if (processing) return
  processing = true
  try {
    const jobs = await databaseRequest("preview_jobs?select=id&status=eq.queued&order=created_at.asc&limit=1")
    if (jobs[0]?.id) await processJob(jobs[0].id)
  } catch (error) {
    console.error("Could not poll preview jobs", error instanceof Error ? error.message : error)
  } finally {
    processing = false
  }
}

async function processJob(id) {
  const claimed = await claimJob(id)
  if (!claimed) return

  let directory
  try {
    directory = await mkdtemp(join(tmpdir(), "preview-job-"))
    const inputPath = join(directory, claimed.media_type === "audio" ? "source.audio" : "source.video")
    const outputPath = join(directory, claimed.media_type === "audio" ? "preview.mp3" : "preview.mp4")
    await downloadObject(claimed.full_bucket, claimed.full_path, inputPath)

    const mediaInfo = await probeMedia(inputPath)
    await createPreview({inputPath, outputPath, mediaType: claimed.media_type, ...mediaInfo})

    const previewPath = `recordings/${new Date().getUTCFullYear()}/${id}.${claimed.media_type === "audio" ? "mp3" : "mp4"}`
    await uploadObject(claimed.preview_bucket, previewPath, outputPath, claimed.media_type === "audio" ? "audio/mpeg" : "video/mp4")
    await updateJob(id, {status: "completed", preview_path: previewPath, error: null})
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1_000) : "Preview generation failed."
    console.error(`Preview job ${id} failed`, message)
    await updateJob(id, {status: "failed", error: message}).catch((updateError) => console.error("Could not record job failure", updateError))
  } finally {
    if (directory) await rm(directory, {recursive: true, force: true})
  }
}

async function claimJob(id) {
  const jobs = await databaseRequest(`preview_jobs?id=eq.${encodeURIComponent(id)}&status=eq.queued`, {
    method: "PATCH",
    headers: {Prefer: "return=representation"},
    body: JSON.stringify({status: "processing", updated_at: new Date().toISOString(), error: null}),
  })
  return jobs[0] || null
}

async function updateJob(id, values) {
  await databaseRequest(`preview_jobs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({...values, updated_at: new Date().toISOString()}),
  })
}

async function databaseRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  if (!response.ok) throw new Error(`Supabase database request failed (${response.status}): ${await response.text()}`)
  return response.status === 204 ? [] : response.json()
}

async function downloadObject(bucket, path, outputPath) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(path)}`, {headers: storageHeaders()})
  if (!response.ok) throw new Error(`Could not download full recording (${response.status}).`)
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))
}

async function uploadObject(bucket, path, inputPath, contentType) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: {...storageHeaders(), "Content-Type": contentType, "x-upsert": "true"},
    body: await readFile(inputPath),
  })
  if (!response.ok) throw new Error(`Could not upload preview (${response.status}): ${await response.text()}`)
}

function storageHeaders() {
  return {apikey: serviceKey, Authorization: `Bearer ${serviceKey}`}
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/")
}

async function probeMedia(inputPath) {
  const {stdout} = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", inputPath])
  const metadata = JSON.parse(stdout)
  const duration = Number.parseFloat(metadata.format?.duration)
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("The uploaded file does not contain readable media duration.")
  return {duration: Math.min(duration, previewSeconds), hasAudio: metadata.streams?.some((stream) => stream.codec_type === "audio") || false}
}

async function createPreview({inputPath, outputPath, mediaType, duration, hasAudio}) {
  const fadeDuration = Math.min(1, duration / 2)
  const fadeStart = Math.max(0, duration - fadeDuration)
  const audioFilter = `afade=t=in:st=0:d=${fadeDuration},afade=t=out:st=${fadeStart}:d=${fadeDuration}`
  const args = ["-y", "-i", inputPath, "-t", String(duration)]
  if (mediaType === "audio") args.push("-af", audioFilter, "-c:a", "libmp3lame", "-b:a", "192k", outputPath)
  else {
    const videoFilter = `fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${fadeStart}:d=${fadeDuration}`
    args.push("-vf", videoFilter, "-c:v", "libx264", "-pix_fmt", "yuv420p")
    if (hasAudio) args.push("-af", audioFilter, "-c:a", "aac")
    args.push("-movflags", "+faststart", outputPath)
  }
  await execFileAsync("ffmpeg", args, {maxBuffer: 10 * 1024 * 1024})
}

function hasValidSecret(header) {
  const token = header?.replace(/^Bearer\s+/i, "")
  if (!token) return false
  const received = Buffer.from(token)
  const expected = Buffer.from(sharedSecret)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be set.`)
  return value
}

function sendJson(response, status, body) {
  response.writeHead(status, {"Content-Type": "application/json"})
  response.end(JSON.stringify(body))
}
