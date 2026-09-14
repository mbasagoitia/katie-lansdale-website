import {NextResponse} from "next/server"
import {supabaseAdmin} from "@/lib/supabase/server"
import {getBearerToken, getStudioUser, isSameOrigin} from "@/lib/sanity/studio-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UploadKind = "preview" | "full"
type MediaType = "audio" | "video"

const buckets: Record<UploadKind, Record<MediaType, string>> = {
  preview: {audio: "audio-previews", video: "video-previews"},
  full: {audio: "audio-full", video: "video-full"},
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({error: "Invalid request origin."}, {status: 403})
  const token = getBearerToken(request)
  if (!token || !(await getStudioUser(token))) return NextResponse.json({error: "Sign in to Sanity Studio before uploading media."}, {status: 401})

  const payload = await request.json().catch(() => null) as {fileName?: string; contentType?: string; kind?: UploadKind} | null
  const mediaType = payload?.contentType?.startsWith("audio/") ? "audio" : payload?.contentType?.startsWith("video/") ? "video" : null
  if (!payload?.fileName || !payload.kind || !mediaType || !(payload.kind in buckets)) return NextResponse.json({error: "An audio or video file is required."}, {status: 400})

  const extension = fileExtension(payload.fileName, mediaType)
  const bucket = buckets[payload.kind][mediaType]
  const path = `recordings/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extension}`
  const {data, error} = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data?.token) return NextResponse.json({error: error?.message || "Could not create an upload URL."}, {status: 500})

  return NextResponse.json({bucket, path: data.path, token: data.token})
}

function fileExtension(fileName: string, mediaType: MediaType): string {
  const extension = fileName.split(".").pop()?.toLocaleLowerCase()
  return extension && /^[a-z0-9]{1,10}$/.test(extension) ? extension : mediaType === "audio" ? "mp3" : "mp4"
}
