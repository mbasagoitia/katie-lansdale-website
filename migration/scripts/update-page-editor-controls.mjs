import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const [home, products] = await Promise.all([
  client.fetch(`*[_id == "page-home"][0]{gallery}`),
  client.fetch(`*[_type == "product" && availableForPurchase == true]{_id, title, productKind, recordings[]->{mediaType}}`),
])

const homeGallery = (home?.gallery || []).map((image, index) => ({
  ...image,
  alt: index === 0 ? "headshot" : index === 1 ? "headshot with violin" : image.alt,
}))

const productRef = (product) => ({
  _key: `watch-listen-${product._id}`,
  _type: "reference",
  _ref: product._id,
})

const albums = products
  .filter((product) => product.productKind === "album")
  .sort((a, b) => a.title.localeCompare(b.title))
  .map(productRef)

const singles = products
  .filter((product) => product.productKind !== "album" && product.recordings?.length === 1 && product.recordings[0]?.mediaType === "video")
  .sort((a, b) => {
    const position = (title) => title === "Toccata and Fugue" ? 0 : title === "Cleopatra" ? 1 : 2
    return position(a.title) - position(b.title) || a.title.localeCompare(b.title)
  })
  .map(productRef)

await client.transaction()
  .patch("page-home", (patch) => patch.set({gallery: homeGallery}))
  .patch("page-watch-listen", (patch) => patch.set({watchListenAlbums: albums, watchListenSingles: singles}))
  .commit()

console.log(`Updated ${homeGallery.length} homepage image descriptions and set the Watch / Listen order for ${albums.length} albums and ${singles.length} singles.`)
