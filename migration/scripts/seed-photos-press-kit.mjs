import {createClient} from "@sanity/client"
import {createReadStream, existsSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {pressKitLongBio, pressKitShortBioPlaceholder, pressPhotoSeeds} from "../../sanity/content/pressKitSeed.ts"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

async function uploadPressPhotos() {
  return Promise.all(pressPhotoSeeds.map(async (photo) => {
    const sourcePath = path.join(projectRoot, photo.sourcePath)
    if (!existsSync(sourcePath)) throw new Error(`Missing local image: ${photo.sourcePath}`)
    const asset = await client.assets.upload("image", createReadStream(sourcePath), {filename: path.basename(sourcePath)})
    return {
      _key: photo.key,
      _type: "object",
      label: photo.label,
      image: {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt: photo.alt},
    }
  }))
}

const pressKitPhotos = await uploadPressPhotos()
await client.patch("page-photos-press-kit").set({
  title: "Photos & Press Kit",
  excerpt: "Approved images and press materials for presenters, media, and collaborators.",
  seoTitle: "Photos & Press Kit | Katie Lansdale",
  seoDescription: "Press photos, biography materials, reviews, and contact information for violinist Katie Lansdale.",
  pressKitShortBio: pressKitShortBioPlaceholder,
  pressKitLongBio,
  pressKitPhotos,
}).commit()

const mediaDocuments = await client.fetch("*[_id in [\"page-media\", \"drafts.page-media\"]]._id")
if (mediaDocuments.length) await Promise.all(mediaDocuments.map((id) => client.delete(id)))

console.log("Updated Photos & Press Kit and removed the unused Media page.")
