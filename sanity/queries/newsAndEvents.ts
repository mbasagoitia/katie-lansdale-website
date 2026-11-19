import {defineQuery, groq} from "next-sanity"

const imageProjection = "image{alt, asset->{_id, url, metadata {dimensions}}}"

export const newsAndEventsQuery = defineQuery(groq`
  *[_id == "page-news-and-events"][0] {
    newsItems[] {
      _key, title, date, time, description, linkUrl, doNotExpire, expirationDate, ${imageProjection}
    },
    highlightedEvents[] {
      _key, title, startDate, startTime, endDate, dateDisplay, description, location, linkUrl, doNotExpire, expirationDate, ${imageProjection}
    }
  }
`)
