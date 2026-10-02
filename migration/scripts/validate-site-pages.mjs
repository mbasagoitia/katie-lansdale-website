import {createClient} from "@sanity/client"
import {sitePageSeeds} from "../../sanity/content/sitePageSeeds.ts"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  useCdn: false,
})
const ids = sitePageSeeds.map((page) => page.id)
const pages = await client.fetch("*[_id in $ids]{_id, title, excerpt, content, aboutIntroduction, heroImage, gallery, quotes, featuredIn, trioMembers, trioRecordings}", {ids})
const settings = await client.fetch("*[_id == 'site-settings'][0]{backgroundImage}")
const pagesById = new Map(pages.map((page) => [page._id, page]))
const missing = sitePageSeeds.filter((seed) => !pagesById.has(seed.id)).map((seed) => seed.id)
const incomplete = sitePageSeeds.flatMap((seed) => {
  const page = pagesById.get(seed.id)
  if (!page?.title) return [seed.id]
  if (seed.content && !page.content?.length) return [seed.id]
  if (seed.aboutIntroduction && !page.aboutIntroduction?.length) return [seed.id]
  if (seed.heroImage && !page.heroImage?.asset) return [seed.id]
  if (seed.gallery && page.gallery?.length !== seed.gallery.length) return [seed.id]
  if (seed.gallery && page.gallery.some((image) => !image._key)) return [seed.id]
  if (seed.quotes && page.quotes?.length !== seed.quotes.length) return [seed.id]
  if (seed.featuredIn && page.featuredIn?.length !== seed.featuredIn.length) return [seed.id]
  if (seed.trioMembers && page.trioMembers?.length !== seed.trioMembers.length) return [seed.id]
  if (seed.trioRecordings && page.trioRecordings?.length !== seed.trioRecordings.length) return [seed.id]
  return []
})

if (missing.length || incomplete.length || !settings?.backgroundImage?.asset) {
  throw new Error(`Validation failed. Missing: ${missing.join(", ") || "none"}. Incomplete: ${incomplete.join(", ") || "none"}. Global background: ${settings?.backgroundImage?.asset ? "present" : "missing"}.`)
}

console.log(`Validated ${pages.length} page documents, all expected content and image references, and the global background image.`)
