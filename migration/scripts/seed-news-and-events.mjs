import {createReadStream} from "node:fs"
import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const imageAsset = await getLionsGateImage()
const calendarUrl = "https://lionsgatetrio.org/calendar"
const events = [
  {title: "Soundwaves Concert: Lions Gate Trio", startsAt: "2027-02-20T14:00:00-05:00", startDate: "2027-02-20", startTime: "2 PM", expirationMode: "eventEnd", description: "The library’s trio-in-residence presents an exquisite pairing of a beloved masterpiece and a forgotten treasure, followed by light refreshments and time with the musicians.", location: "Memorial Room, Fairfield Public Library · Fairfield, CT"},
  {title: "Guilford Free Library Performance", startsAt: "2027-02-21T13:00:00-05:00", startDate: "2027-02-21", startTime: "1 PM", expirationMode: "eventEnd", description: "Katie joins Darrett Adkins and Florence Millet for an afternoon performance with the Lions Gate Trio.", location: "Guilford Free Library · Guilford, CT"},
  {title: "Hartt Spring Residency", startsAt: "2027-02-21T18:00:00-05:00", startDate: "2027-02-21", startTime: "6 PM", expirationMode: "eventEnd", description: "An evening with the Lions Gate Trio at The Hartt School. Program details will be announced soon.", location: "Lincoln Theater, University of Hartford · West Hartford, CT"},
]

for (const event of events) {
  const existing = await client.fetch(`*[_type == "highlightedEvent" && title == $title][0]{_id}`, {title: event.title})
  const fields = {...event, linkUrl: calendarUrl, image: {_type: "image", asset: {_type: "reference", _ref: imageAsset._id}, alt: "The Lions Gate Trio"}}
  if (existing?._id) await client.patch(existing._id).set(fields).commit()
  else await client.create({_type: "highlightedEvent", ...fields})
}

console.log(`Created or updated ${events.length} highlighted events. No news stories were added.`)

async function getLionsGateImage() {
  const filename = "lions-gate-trio.webp"
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`, {filename})
  if (existing?._id) return existing
  return client.assets.upload("image", createReadStream("public/images/lions-gate-trio.webp"), {filename})
}
