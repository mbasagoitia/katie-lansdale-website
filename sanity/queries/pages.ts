import {groq} from "next-sanity"

export const pageByIdQuery = groq`
  *[_id == $id][0]{
    _id,
    title,
    excerpt,
    heroImage,
    content[]{
      ...,
      _type == "image" => {..., asset->{_id, url, metadata {dimensions}}}
    },
    gallery[]{_key, alt, asset->{_id, url, metadata {dimensions}}},
    quotes[]{_key, quote, attribution},
    featuredIn[]{_key, name, url, image{alt, asset->{_id, url, metadata {dimensions}}}},
    trioMembers[]{_key, name, instrument},
    trioStatement,
    trioQuote,
    trioQuoteAttribution,
    trioHighlight{title, description, image{alt, asset->{_id, url, metadata {dimensions}}}, linkLabel, linkUrl},
    trioNews,
    trioRecordings[]{_key, title, subtitle, coverArt{alt, asset->{_id, url, metadata {dimensions}}}, url, youtubeUrl},
    trioEvents[]{_key, date, title, venue, location, url},
    trioWebsiteUrl,
    seoTitle,
    seoDescription
  }
`

export const siteSettingsQuery = groq`
  *[_id == "site-settings"][0]{siteTitle, tagline, copyright}
`
