import {supabase} from "./client"

export type RecordingMediaKind = "preview" | "full"
export type RecordingMediaType = "audio" | "video"
export type UploadedRecordingMedia = {mediaType: RecordingMediaType; path: string; duration?: string}

export async function uploadRecordingMedia(file: File, kind: RecordingMediaKind, sanityToken?: string): Promise<UploadedRecordingMedia> {
  const mediaType = inferMediaType(file)
  if (!sanityToken) throw new Error("Your Sanity session is unavailable. Reload Studio and sign in again.")
  const signedUpload = await requestSignedUpload(file, kind, sanityToken)
  const [duration, upload] = await Promise.all([
    readDuration(file, mediaType),
    supabase.storage.from(signedUpload.bucket).uploadToSignedUrl(signedUpload.path, signedUpload.token, file, {contentType: file.type || undefined}),
  ])
  if (upload.error) throw new Error(upload.error.message)
  return {mediaType, path: upload.data.path, duration}
}

async function requestSignedUpload(file: File, kind: RecordingMediaKind, sanityToken: string): Promise<{bucket: string; path: string; token: string}> {
  const response = await fetch("/api/media-upload-url", {
    method: "POST",
    headers: {"Content-Type": "application/json", Authorization: `Bearer ${sanityToken}`},
    body: JSON.stringify({fileName: file.name, contentType: file.type, kind}),
  })
  const body: {bucket?: string; path?: string; token?: string; error?: string} = await response.json()
  if (!response.ok || !body.bucket || !body.path || !body.token) throw new Error(body.error || "Could not authorize this upload.")
  return {bucket: body.bucket, path: body.path, token: body.token}
}

function inferMediaType(file: File): RecordingMediaType {
  if (file.type.startsWith("audio/")) return "audio"
  if (file.type.startsWith("video/")) return "video"
  throw new Error("Choose an audio or video file.")
}

async function readDuration(file: File, mediaType: RecordingMediaType): Promise<string | undefined> {
  const source = URL.createObjectURL(file)
  const media = document.createElement(mediaType)
  media.preload = "metadata"
  media.src = source
  try {
    const seconds = await new Promise<number | undefined>((resolve) => {
      const cleanup = () => { media.removeEventListener("loadedmetadata", loaded); media.removeEventListener("error", failed) }
      const loaded = () => { cleanup(); resolve(Number.isFinite(media.duration) ? media.duration : undefined) }
      const failed = () => { cleanup(); resolve(undefined) }
      media.addEventListener("loadedmetadata", loaded)
      media.addEventListener("error", failed)
    })
    return seconds === undefined ? undefined : formatDuration(seconds)
  } finally { URL.revokeObjectURL(source) }
}

function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remainingSeconds = rounded % 60
  const secondsText = remainingSeconds.toString().padStart(2, "0")
  return hours ? `${hours}:${minutes.toString().padStart(2, "0")}:${secondsText}` : `${minutes}:${secondsText}`
}
