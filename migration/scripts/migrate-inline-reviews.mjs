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

const [reviewPages, pressKitPages, reviewDocuments] = await Promise.all([
  rawClient.fetch(`*[_id in ["page-reviews", "drafts.page-reviews"]]{_id, reviews}`),
  rawClient.fetch(`*[_id in ["page-photos-press-kit", "drafts.page-photos-press-kit"]]{_id, selectedReviews}`),
  rawClient.fetch(`*[_type == "review" && !(_id in path("drafts.**"))]{_id, quote, attribution}`),
])

const reviewById = new Map(reviewDocuments.map((review) => [review._id, review]))
const keyByReviewId = new Map()
const transaction = client.transaction()

for (const page of reviewPages) {
  const reviews = inlineReviews(page.reviews)
  transaction.patch(page._id, (patch) => patch.set({reviews}))
}

for (const page of pressKitPages) {
  const selectedReviews = inlineSelectedReviews(page.selectedReviews)
  transaction.patch(page._id, (patch) => patch.set({selectedReviews}))
}

if (reviewPages.length || pressKitPages.length) await transaction.commit()
console.log(`Converted ${reviewPages.length} Reviews page documents and ${pressKitPages.length} Photos & Press Kit page documents.`)

function inlineReviews(current) {
  if (Array.isArray(current) && current.some((item) => !item?._ref)) {
    for (const item of current) if (item?._key && item?._sourceReviewId) keyByReviewId.set(item._sourceReviewId, item._key)
    return current
  }

  const orderedIds = (current || []).map((item) => item?._ref).filter(Boolean)
  const source = [
    ...orderedIds.map((id) => reviewById.get(id)).filter(Boolean),
    ...reviewDocuments.filter((review) => !orderedIds.includes(review._id)),
  ]
  const sourceKeyById = new Map((current || []).filter((item) => item?._ref).map((item) => [item._ref, item._key]))
  return source.map((review) => {
    const key = sourceKeyById.get(review._id) || randomUUID()
    keyByReviewId.set(review._id, key)
    return {_key: key, quote: review.quote, attribution: review.attribution}
  })
}

function inlineSelectedReviews(current) {
  if (!Array.isArray(current) || !current.length || typeof current[0] === "string") return current || []
  return current.flatMap((item) => {
    const key = item?._ref ? keyByReviewId.get(item._ref) : undefined
    return key ? [key] : []
  })
}
