import {createReadStream, existsSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const [projectsPage, contactPage] = await Promise.all([
  client.fetch(`*[_id == "page-projects-and-affiliations"][0]{projectCards}`),
  client.fetch(`*[_id == "page-contact"][0]{contactImage, contactFormHeading, contactRecipientEmail}`),
])

const projectCards = await Promise.all((projectsPage?.projectCards || []).map(async (card) => {
  const image = card.image || (card.imageUrl ? await imageReference(card.imageUrl, card.title) : undefined)
  const contentAction = card.contentAction || (card.linkUrl ? "link" : card.details ? "details" : "none")
  const cardWithoutLegacyImage = {...card}
  delete cardWithoutLegacyImage.imageUrl
  return {...cardWithoutLegacyImage, ...(image ? {image} : {}), contentAction}
}))

const defaultContactImage = contactPage?.contactImage || await imageReference("/images/art/violin-stock-soft.png", "Violin against a soft neutral background")
await client.transaction()
  .patch("page-projects-and-affiliations", (patch) => patch.set({projectCards}))
  .patch("page-contact", (patch) => patch.set({
    contactImage: defaultContactImage,
    contactFormHeading: contactPage?.contactFormHeading || "Send a note",
    contactRecipientEmail: contactPage?.contactRecipientEmail || "marika.basagoitia@gmail.com",
  }))
  .commit()

console.log(`Migrated ${projectCards.filter((card) => card.image).length} project images and seeded the Contact form image and delivery settings.`)

async function imageReference(source, alt) {
  if (source.startsWith("/")) {
    const filePath = path.join(projectRoot, "public", source)
    if (!existsSync(filePath)) throw new Error(`Missing local image: ${source}`)
    const asset = await client.assets.upload("image", createReadStream(filePath), {filename: path.basename(filePath)})
    return {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt}
  }

  const response = await fetch(source)
  if (!response.ok) throw new Error(`Could not download ${source}`)
  const filename = new URL(source).pathname.split("/").pop() || "project-image"
  const asset = await client.assets.upload("image", Buffer.from(await response.arrayBuffer()), {filename})
  return {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt}
}
