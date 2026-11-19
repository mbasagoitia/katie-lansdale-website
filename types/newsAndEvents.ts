import type {SanityImage} from "@/types/page"

export type NewsItem = {
  _key: string
  title: string
  date: string
  time?: string
  description: string
  image?: SanityImage
  linkUrl?: string
  expirationMode?: "expire" | "never"
  expirationAt?: string
}

export type HighlightedEvent = {
  _key: string
  title: string
  startDate: string
  startTime?: string
  endDate?: string
  dateDisplay?: string
  description: string
  location?: string
  image?: SanityImage
  linkUrl?: string
  expirationMode?: "expire" | "never"
  expirationAt?: string
}
