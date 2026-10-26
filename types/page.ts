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
  coverArtUrl?: string
  url?: string
  audioUrl?: string
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

export type ProjectCard = {
  _key: string
  title: string
  category?: string
  description?: string
  details?: string
  imageUrl?: string
  imagePosition?: string
  linkUrl?: string
  linkLabel?: string
}

export type DonationOption = {
  _key: string
  title: string
  organization?: string
  description?: string
  donationUrl?: string
  linkLabel?: string
  qrCode?: SanityImage
}

export type PublicationEntry = {
  _key: string
  title: string
  publication?: string
  date?: string
  subtitle?: string
  collaborators?: string
  description?: string
}

export type PresentationEntry = {
  _key: string
  title: string
  event?: string
  date?: string
  description?: string
}

export type HonorEntry = {
  _key: string
  title: string
  organization?: string
  date?: string
  description?: string
}

export type PressPhoto = {
  _key: string
  image?: SanityImage
  label?: string
}

export type CmsPage = {
  _id: string
  title?: string
  excerpt?: string
  heroImage?: SanityImage
  aboutIntroduction?: TypedObject[]
  content?: TypedObject[]
  gallery?: Array<SanityImage & {_key: string}>
  quotes?: PageQuote[]
  featuredIn?: FeaturedInItem[]
  trioMembers?: TrioMember[]
  trioStatement?: string
  trioQuote?: string
  trioQuoteAttribution?: string
  trioHighlight?: TrioHighlight
  trioNews?: TypedObject[]
  trioNewsHeading?: string
  trioNewsImage?: SanityImage
  trioNewsLink?: string
  trioRecordings?: TrioRecording[]
  trioEvents?: TrioEvent[]
  trioWebsiteUrl?: string
  projectCards?: ProjectCard[]
  donationOptions?: DonationOption[]
  publications?: PublicationEntry[]
  presentations?: PresentationEntry[]
  honors?: HonorEntry[]
  pressKitShortBio?: string
  pressKitLongBio?: TypedObject[]
  pressKitPhotos?: PressPhoto[]
  seoTitle?: string
  seoDescription?: string
}

export type SiteSettings = {
  siteTitle?: string
  tagline?: string
  copyright?: string
  seoTitle?: string
  seoDescription?: string
  backgroundImage?: SanityImage
}
import type {TypedObject} from "@portabletext/types"
