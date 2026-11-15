import {defineQuery, groq} from "next-sanity"

const imageProjection = "image{alt, asset->{_id, url, metadata {dimensions}}}"

export const newsItemsQuery = defineQuery(groq`
  *[_type == "newsItem"] | order(publishedAt desc) {
    _id, title, publishedAt, description, linkUrl, expiresAt, ${imageProjection}
  }
`)

export const highlightedEventsQuery = defineQuery(groq`
  *[_type == "highlightedEvent"] | order(startDate asc, title asc) {
    _id, title, startDate, startTime, endDate, dateDisplay, startsAt, description, location, linkUrl, expirationMode, expiresAt, ${imageProjection}
  }
`)

export const newsEventsOrderQuery = defineQuery(groq`
  *[_id == "page-news-and-events"][0]{
    "newsIds": newsItems[]._ref,
    "eventIds": highlightedEvents[]._ref
  }
`)
