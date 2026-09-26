export type SanityImage = {
  _type?: "image"
  alt?: string
  asset?: unknown
}

export type PageQuote = {
  _key: string
  quote: string
  attribution?: string
}

export type FeaturedInItem = {
  _key: string
  name: string
  url?: string
  image?: SanityImage
}

export type TrioMember = {
  _key: string
  name: string
  instrument: string
}

export type TrioHighlight = {
  title?: string
  description?: string
  image?: SanityImage
  linkLabel?: string
  linkUrl?: string
}

export type TrioRecording = {
  _key: string
  title: string
  subtitle?: string
  coverArt?: SanityImage
  url?: string
  youtubeUrl?: string
}

export type TrioEvent = {
  _key: string
  date: string
  title: string
  venue?: string
  location?: string
  url?: string
}

export type CmsPage = {
  _id: string
  title?: string
  excerpt?: string
  heroImage?: SanityImage
  content?: TypedObject[]
  gallery?: Array<SanityImage & {_key: string}>
  quotes?: PageQuote[]
  featuredIn?: FeaturedInItem[]
  trioMembers?: TrioMember[]
  trioStatement?: string
  trioQuote?: string
  trioQuoteAttribution?: string
  trioHighlight?: TrioHighlight
  trioRecordings?: TrioRecording[]
  trioEvents?: TrioEvent[]
  trioWebsiteUrl?: string
  seoTitle?: string
  seoDescription?: string
}

export type SiteSettings = {
  siteTitle?: string
  tagline?: string
  copyright?: string
}
import type {TypedObject} from "@portabletext/types"
