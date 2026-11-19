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
  rawClient.fetch(`*[_type == "newsItem"]{_id, title, publishedAt, date, time, description, image, linkUrl, doNotExpire, expirationMode, expirationAt, expirationDate, expiresAt}`),
  rawClient.fetch(`*[_type == "highlightedEvent"]{_id, title, startsAt, startDate, startTime, endDate, dateDisplay, description, location, image, linkUrl, doNotExpire, expirationMode, expirationAt, expirationDate, expiresAt}`),
])

const transaction = client.transaction()

for (const page of pages) {
  transaction.patch(page._id, (patch) => patch.set({
    newsItems: (page.newsItems || []).map((item) => hasNewsDate(item) ? toNewsItem(item) : normalizeExpiration(item)),
    highlightedEvents: (page.highlightedEvents || []).map((item) => hasEventDate(item) ? toEventItem(item) : normalizeExpiration(item)),
  }))
}

for (const item of newsDocuments) {
  if (!hasNewsDate(item)) continue
  const next = toNewsItem(item)
  transaction.patch(item._id, (patch) => patch.set(documentFields(next)).unset(["publishedAt", "expiresAt", "expirationDate", "doNotExpire"]))
}

for (const item of eventDocuments) {
  if (!hasEventDate(item)) continue
  const next = toEventItem(item)
  transaction.patch(item._id, (patch) => patch.set(documentFields(next)).unset(["startsAt", "expiresAt", "expirationDate", "doNotExpire"]))
}

await transaction.commit()
console.log(`Updated ${pages.length} News & Events page documents, ${newsDocuments.length} news documents, and ${eventDocuments.length} highlighted-event documents.`)

function toNewsItem(item) {
  const fallback = dateAndTime(item.publishedAt)
  const date = item.date || fallback.date
  const expirationMode = item.doNotExpire || item.expirationMode === "never" ? "never" : "expire"
  return compact({
    _key: item._key,
    _type: item._type,
    title: item.title,
    date,
    time: item.time || fallback.time,
    description: item.description,
    image: item.image,
    linkUrl: item.linkUrl,
    expirationMode,
    expirationAt: expirationMode === "never" ? undefined : expirationAt(item.expirationAt || item.expiresAt || item.expirationDate, date),
  })
}

function toEventItem(item) {
  const startDate = item.startDate || dateAndTime(item.startsAt).date
  const expirationMode = item.doNotExpire || item.expirationMode === "never" ? "never" : "expire"
  return compact({
    _key: item._key,
    _type: item._type,
    title: item.title,
    startDate,
    startTime: item.startTime || dateAndTime(item.startsAt).time,
    endDate: item.endDate,
    dateDisplay: item.dateDisplay,
    description: item.description,
    location: item.location,
    image: item.image,
    linkUrl: item.linkUrl,
    expirationMode,
    expirationAt: expirationMode === "never" ? undefined : expirationAt(item.expirationAt || item.expiresAt || item.expirationDate, item.endDate || startDate),
  })
}

function dateAndTime(value) {
  if (!value) return {}
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return {}
  const parts = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(date)
  const part = (type) => parts.find((value) => value.type === type)?.value
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", hour: "numeric", minute: "2-digit"}).format(date).replace(":00 ", " "),
  }
}

function hasNewsDate(item) {
  return Boolean(item?.date || item?.publishedAt)
}

function hasEventDate(item) {
  return Boolean(item?.startDate || item?.startsAt)
}

function normalizeExpiration(item) {
  const {doNotExpire, expirationMode, expirationDate, ...fields} = item
  const nextMode = doNotExpire || expirationMode === "never" ? "never" : "expire"
  return {...fields, expirationMode: nextMode, ...(fields.expirationAt || !expirationDate ? {} : {expirationAt: expirationAt(expirationDate)})}
}

function expirationAt(value, fallbackDate) {
  if (value?.includes("T")) return value
  return tenPmEasternIso(value || fallbackDate)
}

function tenPmEasternIso(date) {
  const [year, month, day] = date.split("-").map(Number)
  const dateAtTenPmUtc = new Date(Date.UTC(year, month - 1, day, 22))
  const zoneName = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", timeZoneName: "shortOffset"})
    .formatToParts(dateAtTenPmUtc)
    .find((part) => part.type === "timeZoneName")?.value || "GMT-05:00"
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(zoneName)
  if (!match) return `${date}T22:00:00-05:00`
  return `${date}T22:00:00${match[1]}${match[2].padStart(2, "0")}:${match[3] || "00"}`
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

function documentFields(value) {
  const fields = {...value}
  delete fields._key
  delete fields._type
  return fields
}
