import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const [page, news, events] = await Promise.all([
  client.fetch(`*[_id == "page-news-and-events"][0]{newsItems, highlightedEvents}`),
  client.fetch(`*[_type == "newsItem"] | order(publishedAt desc){_id}`),
  client.fetch(`*[_type == "highlightedEvent"] | order(startDate asc, title asc){_id}`),
])

const references = (items, prefix) => items.map((item) => ({_key: `${prefix}-${item._id}`, _type: "reference", _ref: item._id}))
await client.patch("page-news-and-events").set({
  newsItems: page?.newsItems?.length ? page.newsItems : references(news, "news"),
  highlightedEvents: page?.highlightedEvents?.length ? page.highlightedEvents : references(events, "event"),
}).commit()

console.log(`Seeded display order for ${news.length} news items and ${events.length} highlighted events.`)
