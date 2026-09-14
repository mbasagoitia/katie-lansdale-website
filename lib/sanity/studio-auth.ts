import "server-only"
import {projectId} from "@/sanity/env"

export type StudioUser = {
  id?: string
  displayName?: string
}

export async function getStudioUser(token: string): Promise<StudioUser | null> {
  const response = await fetch(`https://${projectId}.api.sanity.io/v2026-07-24/users/me`, {
    headers: {Authorization: `Bearer ${token}`},
    cache: "no-store",
  })
  if (!response.ok) return null
  return response.json() as Promise<StudioUser>
}

export function getBearerToken(request: Request): string | null {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  return !origin || origin === new URL(request.url).origin
}
