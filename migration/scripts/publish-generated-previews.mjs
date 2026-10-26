import {createReadStream} from "node:fs"
import {readFile, stat} from "node:fs/promises"
import {resolve} from "node:path"
import {createClient as createSanityClient} from "@sanity/client"
import * as tus from "tus-js-client"

const root = process.cwd()
const previewsDirectory = resolve(root, "tmp/generated-previews")
const videosDirectory = "/Users/marika.basagoitia/Documents/Marika Docs/Lansdale Website/Media/Videos"
const previewYear = "2026"
const dryRun = process.argv.includes("--dry-run")
const toccataOnly = process.argv.includes("--toccata-only")

for (const name of ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_WRITE_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"]) {
  if (!process.env[name]) throw new Error(`Missing ${name}.`)
}

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

const tracks = [
  ["bach-sonata-2-grave", "Sonata No. 2 in A minor", 1],
  ["bach-sonata-2-fuga", "Sonata No. 2 in A minor", 2],
  ["bach-sonata-2-andante", "Sonata No. 2 in A minor", 3],
  ["bach-sonata-2-allegro", "Sonata No. 2 in A minor", 4],
  ["bach-partita-1-allemande-double", "Partita No. 1 in B minor", 1],
  ["bach-partita-1-corrente-double", "Partita No. 1 in B minor", 2],
  ["bach-partita-1-sarabande-double", "Partita No. 1 in B minor", 3],
  ["bach-partita-1-tempo-di-borea-double", "Partita No. 1 in B minor", 4],
  ["bach-sonata-3-adagio", "Sonata No. 3 in C major", 1],
  ["bach-sonata-3-fuga", "Sonata No. 3 in C major", 2],
  ["bach-sonata-3-largo", "Sonata No. 3 in C major", 3],
  ["bach-sonata-3-allegro-assai", "Sonata No. 3 in C major", 4],
  ["bach-partita-2-allemanda", "Partita No. 2 in D minor", 1],
  ["bach-partita-2-corrente", "Partita No. 2 in D minor", 2],
  ["bach-partita-2-sarabanda", "Partita No. 2 in D minor", 3],
  ["bach-partita-2-giga", "Partita No. 2 in D minor", 4],
  ["bach-partita-2-ciaccona", "Partita No. 2 in D minor", 5],
  ["bach-sonata-1-adagio", "Sonata No. 1 in G minor", 1],
  ["bach-sonata-1-fuga", "Sonata No. 1 in G minor", 2],
  ["bach-sonata-1-siciliana", "Sonata No. 1 in G minor", 3],
  ["bach-sonata-1-presto", "Sonata No. 1 in G minor", 4],
  ["bach-partita-3-preludio", "Partita No. 3 in E major", 1],
  ["bach-partita-3-loure", "Partita No. 3 in E major", 2],
  ["bach-partita-3-gavotte-en-rondeau", "Partita No. 3 in E major", 3],
  ["bach-partita-3-menuet-1", "Partita No. 3 in E major", 4],
  ["bach-partita-3-menuet-2", "Partita No. 3 in E major", 5],
  ["bach-partita-3-bourree", "Partita No. 3 in E major", 6],
  ["bach-partita-3-gigue", "Partita No. 3 in E major", 7],
]

const recordings = await sanity.fetch(`*[_type == "recording"]{_id, title, movementNumber, work->{_id, title}}`)
const resolvedTracks = tracks.map(([id, workTitle, movementNumber]) => {
  const matches = recordings.filter((recording) => recording.work?.title === workTitle && recording.movementNumber === movementNumber)
  if (matches.length !== 1) throw new Error(`Expected exactly one recording for ${workTitle}, movement ${movementNumber}; found ${matches.length}.`)
  return {id, recording: matches[0]}
})

const bachAlbum = await sanity.fetch(`*[_type == "album" && title == $title][0]{_id}`, {title: "J.S. Bach: Sonatas and Partitas for Solo Violin"})
if (!bachAlbum?._id) throw new Error("Could not find the Bach album.")
const bachProduct = await sanity.fetch(`*[_type == "product" && album._ref == $albumId][0]{_id}`, {albumId: bachAlbum._id})
if (!bachProduct?._id) throw new Error("Could not find the Bach album product.")

if (!toccataOnly) {
  for (const {id, recording} of resolvedTracks) {
    const filename = `${id}.mp3`
    const localPath = resolve(previewsDirectory, filename)
    const storagePath = `recordings/${previewYear}/generated-previews/${filename}`
    await upload("audio-previews", storagePath, localPath, "audio/mpeg")
    if (!dryRun) await sanity.patch(recording._id).set({mediaType: "audio", previewAudio: storagePath}).commit()
  }

  const orderedReferences = resolvedTracks.map(({recording}) => ({_key: crypto.randomUUID(), _type: "reference", _ref: recording._id}))
  if (!dryRun) {
    await sanity.patch(bachAlbum._id).set({recordings: orderedReferences}).commit()
    await sanity.patch(bachProduct._id).set({recordings: orderedReferences.map((reference) => ({...reference, _key: crypto.randomUUID()}))}).commit()
  }
}

if (!toccataOnly) {
  const cleopatra = recordings.find((recording) => recording.work?.title === "Cleopatra" && recording.title === "Cleopatra")
  if (!cleopatra) throw new Error("Could not find the Cleopatra recording.")
  await upload("video-previews", `recordings/${previewYear}/generated-previews/say-cleopatra.mp4`, resolve(previewsDirectory, "say-cleopatra.mp4"), "video/mp4")
  if (!dryRun) await sanity.patch(cleopatra._id).set({mediaType: "video", previewVideo: `recordings/${previewYear}/generated-previews/say-cleopatra.mp4`, previewPoster: "/images/video-previews/say-cleopatra.png"}).commit()
}

const toccataWork = await sanity.fetch(`*[_type == "work" && title == $title][0]{_id}`, {title: "Toccata and Fugue"})
if (!toccataWork?._id) throw new Error("Could not find the Toccata and Fugue work.")
const toccataPreviewPath = `recordings/${previewYear}/generated-previews/bach-toccata-fugue.mp4`
const toccataFullPath = `recordings/${previewYear}/bach-toccata-fugue.mp4`
await upload("video-previews", toccataPreviewPath, resolve(previewsDirectory, "bach-toccata-fugue.mp4"), "video/mp4")
const existingToccata = recordings.find((recording) => recording.work?._id === toccataWork._id)
let toccataRecordingId = existingToccata?._id
if (!dryRun) {
  if (existingToccata) {
    await sanity.patch(existingToccata._id).set({mediaType: "video", previewVideo: toccataPreviewPath, previewPoster: "/images/video-previews/bach-toccata-fugue.png"}).commit()
  } else {
    const created = await sanity.create({
      _type: "recording",
      title: "Toccata and Fugue",
      artist: "Katie Lansdale",
      work: {_type: "reference", _ref: toccataWork._id},
      mediaType: "video",
      previewVideo: toccataPreviewPath,
      previewPoster: "/images/video-previews/bach-toccata-fugue.png",
    })
    toccataRecordingId = created._id
  }
}
await upload("video-full", toccataFullPath, resolve(videosDirectory, "bach-toccata-fugue.mp4"), "video/mp4")
if (!dryRun && toccataRecordingId) {
  await sanity.patch(toccataRecordingId).set({fullVideo: toccataFullPath}).commit()
  const existingProduct = await sanity.fetch(`*[_type == "product" && productKind == "recording" && references($recordingId)][0]{_id}`, {recordingId: toccataRecordingId})
  const productFields = {
    title: "Toccata and Fugue",
    price: 10,
    slug: {_type: "slug", current: "toccata-and-fugue"},
    productKind: "recording",
    type: "digitalDownload",
    deliveryTypes: ["digitalDownload"],
    availableForPurchase: true,
    recordings: [{_key: crypto.randomUUID(), _type: "reference", _ref: toccataRecordingId}],
  }
  if (existingProduct?._id) await sanity.patch(existingProduct._id).set(productFields).commit()
  else await sanity.create({_type: "product", ...productFields})
}

const partitaOne = await sanity.fetch(`*[_type == "work" && title == $title][0]{_id, movements}`, {title: "Partita No. 1 in B minor"})
if (partitaOne?._id && !dryRun) {
  const titleCaseDouble = (title) => title?.replace(/-double\b/gi, "-Double")
  const partitaRecordings = recordings.filter((recording) => recording.work?._id === partitaOne._id)
  await Promise.all([
    sanity.patch(partitaOne._id).set({movements: partitaOne.movements?.map((movement) => ({...movement, title: titleCaseDouble(movement.title)}))}).commit(),
    ...partitaRecordings.map((recording) => sanity.patch(recording._id).set({title: titleCaseDouble(recording.title)}).commit()),
  ])
}

console.log(`${dryRun ? "Validated" : "Published"} ${toccataOnly ? "the Bach Toccata and Fugue video" : `${resolvedTracks.length} Bach previews, Cleopatra's preview, and the Bach Toccata and Fugue video`}.`)

async function upload(bucket, storagePath, localPath, contentType) {
  const {size} = await stat(localPath)
  if (dryRun) {
    console.log(`Would upload ${localPath} to ${bucket}/${storagePath}`)
    return
  }
  if (size > 6 * 1024 * 1024) return uploadResumable(bucket, storagePath, localPath, contentType)
  const file = await readFile(localPath)
  let lastError = "Unknown upload error"
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(storagePath)}`, {
        method: "POST",
        headers: {
          apikey: supabaseSecretKey,
          Authorization: `Bearer ${supabaseSecretKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: file,
      })
      if (response.ok) return
      lastError = `Storage returned ${response.status}: ${await response.text()}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network upload failed"
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000))
  }
  throw new Error(`Could not upload ${localPath}: ${lastError}`)
}

async function uploadResumable(bucket, storagePath, localPath, contentType) {
  const storageHost = new URL(supabaseUrl).hostname.replace(/\.supabase\.co$/, ".storage.supabase.co")
  const endpoint = `https://${storageHost}/storage/v1/upload/resumable`
  return new Promise((resolveUpload, rejectUpload) => {
    let lastPercent = -1
    const upload = new tus.Upload(createReadStream(localPath), {
      endpoint,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      headers: {authorization: `Bearer ${supabaseSecretKey}`, apikey: supabaseSecretKey, "x-upsert": "true"},
      metadata: {bucketName: bucket, objectName: storagePath, contentType, cacheControl: "3600"},
      removeFingerprintOnSuccess: true,
      uploadDataDuringCreation: true,
      onError: (error) => rejectUpload(error),
      onProgress: (uploaded, total) => {
        const percent = Math.floor((uploaded / total) * 100)
        if (percent >= lastPercent + 10 || percent === 100) {
          lastPercent = percent
          console.log(`Uploading ${storagePath}: ${percent}%`)
        }
      },
      onSuccess: resolveUpload,
    })
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0])
      upload.start()
    }).catch(rejectUpload)
  })
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/")
}
