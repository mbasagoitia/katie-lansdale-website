import {NextResponse} from "next/server"
import {supabaseAdmin} from "@/lib/supabase/server"
import {getBearerToken, getStudioUser, isSameOrigin} from "@/lib/sanity/studio-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  if (!isSameOrigin(request)) return NextResponse.json({error: "Invalid request origin."}, {status: 403})
  const token = getBearerToken(request)
  if (!token || !(await getStudioUser(token))) return NextResponse.json({error: "Sign in to Sanity Studio to view this preview."}, {status: 401})

  const {id} = await context.params
  if (!isUuid(id)) return NextResponse.json({error: "Invalid preview job."}, {status: 400})
  const {data: job, error} = await supabaseAdmin
    .from("preview_jobs")
    .select("id, status, preview_path, error")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({error: error.message}, {status: 500})
  if (!job) return NextResponse.json({error: "Preview job not found."}, {status: 404})
  return NextResponse.json(job)
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
