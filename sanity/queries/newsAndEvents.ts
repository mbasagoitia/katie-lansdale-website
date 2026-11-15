import {defineQuery, groq} from "next-sanity"

const imageProjection = "image{alt, asset->{_id, url, metadata {dimensions}}}"

export const newsItemsQuery = defineQuery(groq`
  *[_type == "newsItem"] | order(publishedAt desc) {
    _id, title, publishedAt, description, linkUrl, expiresAt, ${imageProjection}
  }
`)

export const highlightedEventsQuery = defineQuery(groq`
  *[_type == "highlightedEvent"] | order(startsAt asc) {
    _id, title, startsAt, description, location, linkUrl, expiresAt, ${imageProjection}
  }
`)
