import {groq} from "next-sanity"

export const pageByIdQuery = groq`
  *[_id == $id][0]{
    _id,
    title,
    excerpt,
    heroImage,
    aboutIntroduction,
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
    trioNewsHeading,
    trioNewsImage{alt, asset->{_id, url, metadata {dimensions}}},
    trioNewsLink,
    trioRecordings[]{_key, title, subtitle, coverArt{alt, asset->{_id, url, metadata {dimensions}}}, coverArtUrl, url, audioUrl, youtubeUrl},
    trioEvents[]{_key, date, title, venue, location, url},
    trioWebsiteUrl,
    projectCards[]{_key, title, category, description, imageUrl, linkUrl, linkLabel},
    seoTitle,
    seoDescription
  }
`

export const siteSettingsQuery = groq`
  *[_id == "site-settings"][0]{siteTitle, tagline, copyright, seoTitle, seoDescription, backgroundImage{alt, asset->{_id, url, metadata {dimensions}}}}
`
