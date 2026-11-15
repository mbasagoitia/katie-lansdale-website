import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const bachProduct = await client.fetch(`*[_type == "product" && slug.current == "j-s-bach-sonatas-and-partitas-for-solo-violin"][0]{_id, album->{_id}, recordings[]->{_id, title, movementNumber, work->{_id, title}}}`)
if (!bachProduct?.album?._id) throw new Error("Could not find the existing Bach album product.")
if (bachProduct.recordings.length !== 28) throw new Error(`Expected 28 Bach tracks, found ${bachProduct.recordings.length}.`)

const discProducts = [
  {title: "Bach Sonatas and Partitas — Disc 1", slug: "bach-sonatas-and-partitas-disc-1", recordings: bachProduct.recordings.slice(0, 12)},
  {title: "Bach Sonatas and Partitas — Disc 2", slug: "bach-sonatas-and-partitas-disc-2", recordings: bachProduct.recordings.slice(12)},
]

const trackProducts = bachProduct.recordings.map((recording, index) => ({
  title: `${recording.work.title} — ${recording.movementNumber ? `${romanNumeral(recording.movementNumber)}. ` : ""}${recording.title}`,
  slug: `bach-track-${String(index + 1).padStart(2, "0")}`,
  recordings: [recording],
}))

const workProducts = [...bachProduct.recordings.reduce((groups, recording) => {
  if (!recording.work?._id) return groups
  const group = groups.get(recording.work._id) || {work: recording.work, recordings: []}
  group.recordings.push(recording)
  groups.set(recording.work._id, group)
  return groups
}, new Map()).values()]
  .filter(({recordings}) => recordings.length > 1)
  .map(({work, recordings}) => ({
    title: work.title,
    slug: `bach-piece-${slugify(work.title)}`,
    work: work._id,
    recordings,
  }))

const allSlugs = [...discProducts, ...trackProducts, ...workProducts].map((product) => product.slug)
const existingProducts = await client.fetch(`*[_type == "product" && slug.current in $slugs]{_id, "slug": slug.current}`, {slugs: allSlugs})
const existingBySlug = new Map(existingProducts.map((product) => [product.slug, product._id]))

async function upsertProduct({title, slug, recordings, price, deliveryTypes, shortDescription, productKind, album, work}) {
  const fields = {
    title,
    shortDescription,
    price,
    slug: {_type: "slug", current: slug},
    productKind,
    type: deliveryTypes[0],
    deliveryTypes,
    availableForPurchase: true,
    ...(album ? {album: {_type: "reference", _ref: album}} : {}),
    ...(work ? {work: {_type: "reference", _ref: work}} : {}),
    recordings: recordings.map((recording) => ({_key: crypto.randomUUID(), _type: "reference", _ref: recording._id})),
  }
  const existingId = existingBySlug.get(slug)
  if (existingId) {
    const patch = client.patch(existingId).set(fields)
    if (!shortDescription) patch.unset(["shortDescription"])
    return patch.commit()
  }
  return client.create({_type: "product", ...fields})
}

for (const disc of discProducts) {
  await upsertProduct({...disc, price: 12, deliveryTypes: ["digitalDownload"], productKind: "album", album: bachProduct.album._id})
}

for (const track of trackProducts) {
  await upsertProduct({...track, price: 0.99, deliveryTypes: ["digitalDownload"], productKind: "recording", shortDescription: "Digital track download."})
}

for (const work of workProducts) {
  await upsertProduct({...work, price: Number((work.recordings.length * 0.99).toFixed(2)), deliveryTypes: ["digitalDownload"], productKind: "work", shortDescription: `Digital download of all ${work.recordings.length} tracks in this piece.`})
}

const videoProducts = await client.fetch(`*[_type == "product" && count(recordings) == 1 && recordings[0]->mediaType == "video"]{_id}`)
const unlistedPhysicalProducts = await client.fetch(`*[_type == "product" && "physicalCD" in deliveryTypes]{_id}`)
const projectsPage = await client.fetch(`*[_id == "page-projects-and-affiliations"][0]{projectCards}`)
if (!projectsPage?.projectCards?.some((card) => card._key === "music-for-1000-children")) throw new Error("Could not find the Music for 1,000 Children project card.")
const projectCards = projectsPage.projectCards.map((card) => card._key === "music-for-1000-children"
  ? {...card, imageUrl: "/images/projects-affiliations/music-1000-children.jpg"}
  : card,
)
const transaction = client.transaction()
  .patch(bachProduct._id, (patch) => patch.set({availableForPurchase: false}))
  .patch("page-projects-and-affiliations", (patch) => patch.set({projectCards}))

for (const product of videoProducts) transaction.patch(product._id, (patch) => patch.set({price: 0.99}))
for (const product of unlistedPhysicalProducts) transaction.patch(product._id, (patch) => patch.set({availableForPurchase: false}))
await transaction.commit()

console.log(`Updated the project card, listed ${discProducts.length} Bach digital albums, ${workProducts.length} complete-piece products, and ${trackProducts.length} track products; unlisted ${unlistedPhysicalProducts.length} physical products; and repriced ${videoProducts.length} video products.`)

function romanNumeral(value) {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][value] || String(value)
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
