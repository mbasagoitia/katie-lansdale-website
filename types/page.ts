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

export type CmsPage = {
  _id: string
  title?: string
  excerpt?: string
  heroImage?: SanityImage
  content?: TypedObject[]
  gallery?: Array<SanityImage & {_key: string}>
  quotes?: PageQuote[]
  featuredIn?: FeaturedInItem[]
  seoTitle?: string
  seoDescription?: string
}

export type SiteSettings = {
  siteTitle?: string
  tagline?: string
  copyright?: string
}
import type {TypedObject} from "@portabletext/types"
