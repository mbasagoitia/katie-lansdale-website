import {createClient} from "@sanity/client"
import {createReadStream, existsSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {sitePageSeeds} from "../../sanity/content/sitePageSeeds.ts"

const isDryRun = process.argv.includes("--dry-run")
const overwrite = process.argv.includes("--overwrite")
const refreshHomeGallery = process.argv.includes("--refresh-home-gallery")
const requiredEnvironment = ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET"]
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key])

if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`)
}

if (!isDryRun && !process.env.SANITY_API_WRITE_TOKEN) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN. Create a Sanity token with Editor access, add it to .env.local, then rerun this command.")
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const ids = sitePageSeeds.map((page) => page.id)
const existingPages = isDryRun ? [] : await client.fetch("*[_id in $ids || _id in $draftIds]{_id, title, excerpt, content, aboutIntroduction, heroImage, gallery, quotes, featuredIn, trioMembers, trioStatement, trioQuote, trioRecordings, projectCards}", {
  ids,
  draftIds: ids.map((id) => `drafts.${id}`),
})
const existingById = new Map(existingPages.map((page) => [page._id.replace(/^drafts\./, ""), page]))
const assetCache = new Map()

function hasEditorialContent(page) {
  if (!page) return false
  return ["excerpt", "content", "aboutIntroduction", "heroImage", "gallery", "quotes", "featuredIn", "trioMembers", "trioStatement", "trioQuote", "trioRecordings"].some((field) => {
    const value = page[field]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
}

async function imageReference(image) {
  const cached = assetCache.get(image.sourcePath)
  if (cached) return cached

  const absolutePath = path.join(projectRoot, image.sourcePath)
  if (!existsSync(absolutePath)) throw new Error(`Missing local image: ${image.sourcePath}`)
  const asset = await client.assets.upload("image", createReadStream(absolutePath), {filename: path.basename(absolutePath)})
  const reference = {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt: image.alt}
  assetCache.set(image.sourcePath, reference)
  return reference
}

async function documentForSeed(seed) {
  const document = {_id: seed.id, _type: "page", title: seed.title}
  for (const field of ["excerpt", "seoTitle", "seoDescription", "content", "aboutIntroduction", "quotes", "trioMembers", "trioStatement", "trioQuote", "trioQuoteAttribution", "trioRecordings", "trioWebsiteUrl", "projectCards"]) {
    if (seed[field] !== undefined) document[field] = seed[field]
  }
  if (seed.heroImage) document.heroImage = await imageReference(seed.heroImage)
  if (seed.gallery) document.gallery = await Promise.all(seed.gallery.map(async (image, index) => ({...(await imageReference(image)), _key: `home-gallery-${index + 1}`})))
  if (seed.featuredIn) document.featuredIn = await Promise.all(seed.featuredIn.map(async (item) => ({...item, image: await imageReference(item.image)})))
  return document
}

const results = {created: [], skipped: [], planned: []}

for (const seed of sitePageSeeds) {
  const existing = existingById.get(seed.id)

  if (refreshHomeGallery && seed.id === "page-home" && seed.gallery?.length) {
    if (isDryRun) {
      results.planned.push(seed.id)
    } else if (existing) {
      const gallery = await Promise.all(seed.gallery.map(async (image, index) => ({...(await imageReference(image)), _key: `home-gallery-${index + 1}`})))
      await client.patch(existing._id).set({gallery}).commit()
      results.created.push(seed.id)
    }
    continue
  }

  if (!overwrite && existing && seed.projectCards?.length && !existing.projectCards?.length) {
    if (isDryRun) {
      results.planned.push(seed.id)
    } else {
      await client.patch(existing._id).set({projectCards: seed.projectCards}).commit()
      results.created.push(seed.id)
    }
    continue
  }

  if (!overwrite && hasEditorialContent(existing)) {
    results.skipped.push(seed.id)
    continue
  }

  if (isDryRun) {
    results.planned.push(seed.id)
    continue
  }

  const document = await documentForSeed(seed)
  await client.createOrReplace(document)
  results.created.push(seed.id)
}

console.table([
  {status: isDryRun ? "would seed" : "seeded", count: (isDryRun ? results.planned : results.created).length, pages: (isDryRun ? results.planned : results.created).join(", ") || "—"},
  {status: "preserved existing", count: results.skipped.length, pages: results.skipped.join(", ") || "—"},
])
