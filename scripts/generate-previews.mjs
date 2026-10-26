#!/usr/bin/env node

import {access, mkdir, readFile} from "node:fs/promises"
import {constants as fsConstants} from "node:fs"
import {dirname, isAbsolute, resolve} from "node:path"
import {spawn} from "node:child_process"

const HELP = `
Create faded 30-second previews locally with FFmpeg.

Usage:
  npm run generate:previews -- --manifest ./preview-manifest.json

Options:
  --manifest <file>      JSON manifest describing the source files (required)
  --output-dir <folder>  Override the manifest outputDirectory
  --dry-run              Validate and print planned output without creating files
  --help                 Show this message

Install FFmpeg once on macOS:
  brew install ffmpeg
`

const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP.trim())
  process.exit(0)
}

const manifestFlag = args.indexOf("--manifest")
const outputFlag = args.indexOf("--output-dir")
const dryRun = args.includes("--dry-run")
const manifestPath = manifestFlag >= 0 ? args[manifestFlag + 1] : undefined
const outputOverride = outputFlag >= 0 ? args[outputFlag + 1] : undefined

if (!manifestPath || (manifestFlag >= 0 && !manifestPath) || (outputFlag >= 0 && !outputOverride)) {
  fail("A manifest is required. Run with --help for an example.")
}

const absoluteManifestPath = resolve(manifestPath)
const manifestDirectory = dirname(absoluteManifestPath)
const manifest = await readJson(absoluteManifestPath)
if (!Array.isArray(manifest.items) || manifest.items.length === 0) fail("The manifest must include at least one item.")

const defaults = manifest.defaults || {}
const defaultDuration = validPositive(defaults.durationSeconds, 30, "defaults.durationSeconds")
const defaultFade = validPositive(defaults.fadeSeconds, 1, "defaults.fadeSeconds")
const configuredOutput = outputOverride || manifest.outputDirectory || "./tmp/generated-previews"
const outputDirectory = resolve(manifestDirectory, configuredOutput)

await ensureProgram("ffmpeg")
await ensureProgram("ffprobe")
if (!dryRun) await mkdir(outputDirectory, {recursive: true})

const seenIds = new Set()
const results = []
for (const [index, item] of manifest.items.entries()) {
  try {
    const id = requiredId(item?.id, index)
    if (seenIds.has(id)) throw new Error(`Duplicate id \"${id}\".`)
    seenIds.add(id)
    const input = requiredInput(item?.input, index)
    const startSeconds = validNonNegative(item?.startSeconds, 0, `items[${index}].startSeconds`)
    const requestedDuration = validPositive(item?.durationSeconds, defaultDuration, `items[${index}].durationSeconds`)
    const requestedFade = validPositive(item?.fadeSeconds, defaultFade, `items[${index}].fadeSeconds`)
    await access(input, fsConstants.R_OK)

    if (dryRun) {
      console.log(`Would generate ${id} from ${input}`)
      results.push({id, status: "planned"})
      continue
    }

    const media = await probe(input)
    const remaining = media.duration - startSeconds
    if (remaining <= 0) throw new Error(`startSeconds (${startSeconds}) is after the end of the source.`)
    const duration = Math.min(requestedDuration, remaining)
    const fade = Math.min(requestedFade, duration / 2)
    const extension = media.hasVideo ? "mp4" : "mp3"
    const output = resolve(outputDirectory, `${id}.${extension}`)
    await render({input, output, startSeconds, duration, fade, hasVideo: media.hasVideo, hasAudio: media.hasAudio})
    console.log(`Created ${output}`)
    results.push({id, status: "created", output})
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`Could not create preview for item ${index + 1}: ${message}`)
    results.push({id: item?.id || `item-${index + 1}`, status: "failed", message})
  }
}

const failed = results.filter((result) => result.status === "failed")
console.log(`\n${results.length - failed.length}/${results.length} preview${results.length === 1 ? "" : "s"} ${dryRun ? "validated" : "created"}.`)
if (failed.length) process.exit(1)

async function probe(input) {
  const {stdout} = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", input])
  const metadata = JSON.parse(stdout)
  const duration = Number.parseFloat(metadata.format?.duration)
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("The source does not have a readable duration.")
  const streams = metadata.streams || []
  const hasVideo = streams.some((stream) => stream.codec_type === "video")
  const hasAudio = streams.some((stream) => stream.codec_type === "audio")
  if (!hasVideo && !hasAudio) throw new Error("The source does not contain an audio or video stream.")
  return {duration, hasVideo, hasAudio}
}

async function render({input, output, startSeconds, duration, fade, hasVideo, hasAudio}) {
  const fadeStart = Math.max(0, duration - fade)
  const audioFilter = `afade=t=in:st=0:d=${fade},afade=t=out:st=${fadeStart}:d=${fade}`
  const args = ["-y", "-i", input, "-ss", String(startSeconds), "-t", String(duration)]
  if (!hasVideo) {
    args.push("-map", "0:a:0", "-vn", "-af", audioFilter, "-c:a", "libmp3lame", "-b:a", "192k", output)
  } else {
    const videoFilter = `fade=t=in:st=0:d=${fade},fade=t=out:st=${fadeStart}:d=${fade}`
    args.push("-map", "0:v:0", "-map", "0:a:0?", "-vf", videoFilter, "-c:v", "libx264", "-pix_fmt", "yuv420p")
    if (hasAudio) args.push("-af", audioFilter, "-c:a", "aac")
    args.push("-movflags", "+faststart", output)
  }
  await run("ffmpeg", args, {inheritStderr: true})
}

function run(command, commandArgs, {inheritStderr = false} = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, commandArgs, {stdio: ["ignore", "pipe", inheritStderr ? "inherit" : "pipe"]})
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => { stdout += chunk })
    if (!inheritStderr) child.stderr.on("data", (chunk) => { stderr += chunk })
    child.on("error", rejectRun)
    child.on("close", (code) => code === 0 ? resolveRun({stdout, stderr}) : rejectRun(new Error(`${command} failed${stderr ? `: ${stderr.trim()}` : ""}`)))
  })
}

async function ensureProgram(program) {
  try { await run(program, ["-version"]) }
  catch { fail(`\`${program}\` is not installed. On macOS, run: brew install ffmpeg`) }
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")) }
  catch (error) { fail(`Could not read ${file}: ${error instanceof Error ? error.message : "invalid JSON"}`) }
}

function requiredId(value, index) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_-]*$/i.test(value)) throw new Error(`items[${index}].id must use letters, numbers, hyphens, or underscores.`)
  return value
}

function requiredInput(value, index) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`items[${index}].input is required.`)
  return isAbsolute(value) ? value : resolve(manifestDirectory, value)
}

function validPositive(value, fallback, label) {
  if (value === undefined) return fallback
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive number.`)
  return value
}

function validNonNegative(value, fallback, label) {
  if (value === undefined) return fallback
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`${label} must be zero or a positive number.`)
  return value
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
