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

export type AboutBiographySection = {
  _key: string
  heading: string
  content: string
}

export type TrioNewsItem = {
  _key: string
  title: string
  description?: string
  image?: SanityImage
  linkUrl?: string
  linkLabel?: string
}

export type TrioRecording = {
  _key: string
  title: string
  composer?: string
  albumName?: string
  coverArt?: SanityImage
  audioFile?: {asset?: {url?: string}}
}

export type TrioEvent = {
  _key: string
  date: string
  title: string
  venue?: string
  location?: string
  description?: string
  image?: SanityImage
  imageUrl?: string
  imageAlt?: string
  url?: string
}

export type ProjectCard = {
  _key: string
  title: string
  category?: string
  description?: string
  image?: SanityImage
  details?: string
  contentAction?: "details" | "link" | "none"
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

export type CmsReview = {
  _key: string
  quote: string
  attribution: string
}

export type ProductReference = {
  _key: string
  _ref: string
}

export type CmsPage = {
  _id: string
  title?: string
  aboutTagline?: string
  excerpt?: string
  heroImage?: SanityImage
  aboutIntroduction?: TypedObject[]
  aboutBiographySections?: AboutBiographySection[]
  content?: TypedObject[]
  gallery?: Array<SanityImage & {_key: string}>
  quotes?: PageQuote[]
  featuredIn?: FeaturedInItem[]
  trioMembers?: TrioMember[]
  trioAboutLabel?: string
  trioAboutHeading?: string
  trioStatement?: string
  trioNewsLabel?: string
  trioNewsItems?: TrioNewsItem[]
  trioNews?: TypedObject[]
  trioNewsHeading?: string
  trioNewsImage?: SanityImage
  trioNewsLink?: string
  trioRecordings?: TrioRecording[]
  trioEvents?: TrioEvent[]
  trioWebsiteUrl?: string
  trioListenLabel?: string
  trioListenHeading?: string
  trioListenLinkLabel?: string
  trioEventsLabel?: string
  trioEventsHeading?: string
  trioEventsLinkLabel?: string
  trioCtaText?: string
  trioCtaLinkLabel?: string
  projectCards?: ProjectCard[]
  donationOptions?: DonationOption[]
  contactImage?: SanityImage
  contactFormHeading?: string
  publications?: PublicationEntry[]
  presentations?: PresentationEntry[]
  honors?: HonorEntry[]
  pressKitShortBio?: string
  pressKitLongBio?: TypedObject[]
  pressKitPhotos?: PressPhoto[]
  reviews?: CmsReview[]
  selectedReviews?: CmsReview[]
  pressKitContactLabel?: string
  pressKitContactHeading?: string
  pressKitContactLinkLabel?: string
  pressKitContactDescription?: string
  watchListenAlbums?: ProductReference[]
  watchListenSingles?: ProductReference[]
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
