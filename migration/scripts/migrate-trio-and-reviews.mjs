import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const [home, trio, pressKit] = await Promise.all([
  client.fetch(`*[_id == "page-home"][0]{quotes[]{_key, quote, attribution}}`),
  client.fetch(`*[_id == "page-lions-gate-trio"][0]{trioNewsItems, trioNewsHeading, trioNews, trioNewsImage, trioNewsLink, trioRecordings, trioAboutLabel, trioAboutHeading, trioHighlightLabel, trioNewsLabel, trioListenLabel, trioListenHeading, trioListenLinkLabel, trioEventsLabel, trioEventsHeading, trioEventsLinkLabel, trioCtaText, trioCtaLinkLabel}`),
  client.fetch(`*[_id == "page-photos-press-kit"][0]{selectedReviews, pressKitContactLabel, pressKitContactHeading, pressKitContactLinkLabel, pressKitContactDescription}`),
])

const quotes = home?.quotes || []
const sourceKeys = quotes.map((quote) => quote._key)
const existingReviews = await client.fetch(`*[_type == "review" && sourceKey in $sourceKeys]{_id, sourceKey}`, {sourceKeys})
const reviewIdBySourceKey = new Map(existingReviews.map((review) => [review.sourceKey, review._id]))

for (const quote of quotes) {
  if (reviewIdBySourceKey.has(quote._key)) continue
  const review = await client.create({_type: "review", quote: quote.quote, attribution: quote.attribution || "", sourceKey: quote._key})
  reviewIdBySourceKey.set(quote._key, review._id)
}

const reference = (sourceKey) => ({_key: `review-${sourceKey}`, _type: "reference", _ref: reviewIdBySourceKey.get(sourceKey)})
const reviewOrder = quotes.slice().reverse().flatMap((quote) => reviewIdBySourceKey.has(quote._key) ? [reference(quote._key)] : [])
const selectedKeys = ["cleveland-plain-dealer-bold", "berliner-morgenpost-soloist", "raleigh-durham-spectator-bach"]
const selectedReviews = selectedKeys.flatMap((key) => reviewIdBySourceKey.has(key) ? [reference(key)] : [])

const oldNewsDescription = (trio?.trioNews || [])
  .filter((block) => block?._type === "block")
  .map((block) => (block.children || []).map((child) => child.text || "").join(""))
  .filter(Boolean)
  .join("\n\n")
const migratedNews = trio?.trioNewsItems?.length ? trio.trioNewsItems : [{
  _key: "lumieres-news",
  title: trio?.trioNewsHeading || "Recently released: Lumières",
  description: oldNewsDescription || "Lumières features music by Fauré, Saariaho, Höller, Iannotta, and Bertrand. The album is available on Spotify, Apple Music, Amazon Music, and through Editions Hortus.",
  ...(trio?.trioNewsImage ? {image: trio.trioNewsImage} : {}),
  ...(trio?.trioNewsLink ? {linkUrl: trio.trioNewsLink} : {}),
  linkLabel: "Learn more",
}]

const recordings = (trio?.trioRecordings || []).map((recording) => {
  if (recording.composer || recording.albumName || !recording.subtitle) return recording
  const [composer, ...albumParts] = recording.subtitle.split(" · ")
  return {...recording, composer, ...(albumParts.length ? {albumName: albumParts.join(" · ")} : {})}
})

await client.transaction()
  .patch("page-reviews", (patch) => patch.set({reviews: reviewOrder}))
  .patch("page-photos-press-kit", (patch) => patch.set({
    selectedReviews: pressKit?.selectedReviews?.length === 3 ? pressKit.selectedReviews : selectedReviews,
    pressKitContactLabel: pressKit?.pressKitContactLabel || "For presenters & media",
    pressKitContactHeading: pressKit?.pressKitContactHeading || "Get in touch",
    pressKitContactLinkLabel: pressKit?.pressKitContactLinkLabel || "Contact",
    pressKitContactDescription: pressKit?.pressKitContactDescription || "For booking, interview requests, additional materials, or permission to use press images, please get in touch.",
  }))
  .patch("page-lions-gate-trio", (patch) => patch.set({
    trioNewsItems: migratedNews,
    trioRecordings: recordings,
    trioAboutLabel: trio?.trioAboutLabel || "The Trio",
    trioAboutHeading: trio?.trioAboutHeading || "A shared musical life",
    trioHighlightLabel: trio?.trioHighlightLabel || "Current highlight",
    trioNewsLabel: trio?.trioNewsLabel || "News",
    trioListenLabel: trio?.trioListenLabel || "Listen",
    trioListenHeading: trio?.trioListenHeading || "Selected recordings",
    trioListenLinkLabel: trio?.trioListenLinkLabel || "Full discography",
    trioEventsLabel: trio?.trioEventsLabel || "On stage",
    trioEventsHeading: trio?.trioEventsHeading || "Upcoming performances",
    trioEventsLinkLabel: trio?.trioEventsLinkLabel || "Full calendar",
    trioCtaText: trio?.trioCtaText || "For complete concert information, recordings, and news, visit the Lions Gate Trio official website.",
    trioCtaLinkLabel: trio?.trioCtaLinkLabel || "Visit LionsGateTrio.org",
  }))
  .commit()

console.log(`Created ${reviewIdBySourceKey.size - existingReviews.length} reviews, ordered ${reviewOrder.length} reviews, and selected ${selectedReviews.length} press-kit reviews.`)
