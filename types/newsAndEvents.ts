import type {SanityImage} from "@/types/page"

export type NewsItem = {
  _id: string
  title: string
  publishedAt: string
  description: string
  image?: SanityImage
  linkUrl?: string
  expiresAt?: string
}

export type HighlightedEvent = {
  _id: string
  title: string
  startsAt: string
  description: string
  location?: string
  image?: SanityImage
  linkUrl?: string
  expiresAt?: string
}
