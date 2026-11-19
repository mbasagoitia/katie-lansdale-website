import {randomUUID} from "node:crypto"
import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const rawClient = client.withConfig({perspective: "raw"})
const [pages, newsDocuments, eventDocuments] = await Promise.all([
  rawClient.fetch(`*[_id in ["page-news-and-events", "drafts.page-news-and-events"]]{_id, newsItems, highlightedEvents}`),
  client.fetch(`*[_type == "newsItem" && !(_id in path("drafts.**"))] | order(publishedAt desc){_id, title, publishedAt, description, image, linkUrl, expiresAt}`),
  client.fetch(`*[_type == "highlightedEvent" && !(_id in path("drafts.**"))] | order(startDate asc, title asc){_id, title, startDate, startTime, endDate, dateDisplay, description, location, image, linkUrl, expirationMode, expiresAt, startsAt}`),
])

const newsById = new Map(newsDocuments.map((item) => [item._id, item]))
const eventsById = new Map(eventDocuments.map((item) => [item._id, item]))
const transaction = client.transaction()

for (const page of pages) {
  const newsItems = migrateItems(page.newsItems, newsDocuments, newsById, toNewsItem)
  const highlightedEvents = migrateItems(page.highlightedEvents, eventDocuments, eventsById, toEventItem)
  transaction.patch(page._id, (patch) => patch.set({newsItems, highlightedEvents}))
}

if (pages.length) await transaction.commit()
console.log(`Converted News & Events to inline forms on ${pages.length} page document${pages.length === 1 ? "" : "s"}.`)

function migrateItems(currentItems, allItems, byId, toInlineItem) {
  if (Array.isArray(currentItems) && currentItems.some((item) => !item?._ref)) return currentItems

  const orderedIds = Array.isArray(currentItems) ? currentItems.map((item) => item?._ref).filter(Boolean) : []
  const sourceItems = [
    ...orderedIds.map((id) => byId.get(id)).filter(Boolean),
    ...allItems.filter((item) => !orderedIds.includes(item._id)),
  ]
  const keyById = new Map((currentItems || []).filter((item) => item?._ref).map((item) => [item._ref, item._key]))
  return sourceItems.map((item) => toInlineItem(item, keyById.get(item._id) || randomUUID()))
}

function toNewsItem(item, key) {
  return {
    _key: key,
    title: item.title,
    publishedAt: item.publishedAt,
    description: item.description,
    ...(item.image ? {image: item.image} : {}),
    ...(item.linkUrl ? {linkUrl: item.linkUrl} : {}),
    ...(item.expiresAt ? {expiresAt: item.expiresAt} : {}),
  }
}

function toEventItem(item, key) {
  const startDate = item.startDate || item.startsAt?.slice(0, 10)
  if (!startDate) throw new Error(`Highlighted event “${item.title}” is missing a start date.`)
  return {
    _key: key,
    title: item.title,
    startDate,
    ...(item.startTime ? {startTime: item.startTime} : {}),
    ...(item.endDate ? {endDate: item.endDate} : {}),
    ...(item.dateDisplay ? {dateDisplay: item.dateDisplay} : {}),
    description: item.description,
    ...(item.location ? {location: item.location} : {}),
    ...(item.image ? {image: item.image} : {}),
    ...(item.linkUrl ? {linkUrl: item.linkUrl} : {}),
    expirationMode: item.expirationMode || "eventEnd",
    ...(item.expiresAt ? {expiresAt: item.expiresAt} : {}),
  }
}
