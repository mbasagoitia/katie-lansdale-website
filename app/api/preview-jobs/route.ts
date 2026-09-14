import {NextResponse} from "next/server"
import {supabaseAdmin} from "@/lib/supabase/server"
import {getBearerToken, getStudioUser, isSameOrigin} from "@/lib/sanity/studio-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type MediaType = "audio" | "video"

const fullBuckets: Record<MediaType, string> = {
  audio: "audio-full",
  video: "video-full",
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({error: "Invalid request origin."}, {status: 403})

  const token = getBearerToken(request)
  const user = token ? await getStudioUser(token) : null
  if (!user) return NextResponse.json({error: "Sign in to Sanity Studio before generating a preview."}, {status: 401})

  const payload = await request.json().catch(() => null) as {fullPath?: string; mediaType?: MediaType} | null
  if (!payload?.fullPath || !payload.mediaType || !(payload.mediaType in fullBuckets) || !isStoragePath(payload.fullPath)) {
    return NextResponse.json({error: "A valid full recording is required."}, {status: 400})
  }

  const previewBucket = payload.mediaType === "audio" ? "audio-previews" : "video-previews"
  const {data: job, error} = await supabaseAdmin
    .from("preview_jobs")
    .insert({
      status: "queued",
      full_bucket: fullBuckets[payload.mediaType],
      full_path: payload.fullPath,
      media_type: payload.mediaType,
      preview_bucket: previewBucket,
      requested_by: user.id || null,
    })
    .select("id, status")
    .single()

  if (error || !job) return NextResponse.json({error: error?.message || "Could not queue the preview."}, {status: 500})

  const workerUrl = process.env.PREVIEW_WORKER_URL
  const workerSecret = process.env.PREVIEW_WORKER_SHARED_SECRET
  if (!workerUrl || !workerSecret) {
    await supabaseAdmin.from("preview_jobs").update({status: "failed", error: "Preview worker is not configured."}).eq("id", job.id)
    return NextResponse.json({error: "Preview generation has not been configured yet."}, {status: 503})
  }

  try {
    const response = await fetch(new URL(`/jobs/${job.id}`, workerUrl), {
      method: "POST",
      headers: {Authorization: `Bearer ${workerSecret}`},
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`Worker returned ${response.status}`)
  } catch {
    // The job remains queued. The worker's queue poller will retry it shortly.
  }

  return NextResponse.json({id: job.id, status: "queued"}, {status: 202})
}

function isStoragePath(path: string): boolean {
  return /^recordings\/\d{4}\/[0-9a-f-]+\.[a-z0-9]{1,10}$/i.test(path)
}
