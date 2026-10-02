import {createClient} from "@sanity/client"
import {createReadStream, existsSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const settings = await client.fetch("*[_id == 'site-settings'][0]{siteTitle, tagline, copyright, seoTitle, seoDescription, backgroundImage}")
let backgroundImage = settings?.backgroundImage

if (!backgroundImage?.asset) {
  const backgroundPath = path.join(projectRoot, "public/images/art/rock-art.png")
  if (!existsSync(backgroundPath)) throw new Error("Missing public/images/art/rock-art.png")
  const asset = await client.assets.upload("image", createReadStream(backgroundPath), {filename: "katie-lansdale-rock-art-background.png"})
  backgroundImage = {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt: "Rock art texture"}
}

const home = await client.fetch("*[_id == 'page-home'][0]{gallery}")
const gallery = (home?.gallery || []).map((image, index) => ({
  ...image,
  _key: image._key || `home-gallery-${index + 1}`,
  alt: index === 0 ? "Headshot of Katie Lansdale" : image.alt || "Katie Lansdale",
}))

await client.transaction()
  .createIfNotExists({_id: "site-settings", _type: "siteSettings", title: "Global Settings"})
  .patch("site-settings", (patch) => patch.set({
    siteTitle: settings?.siteTitle || "Katie Lansdale",
    tagline: settings?.tagline || "Violinist",
    copyright: settings?.copyright || "© 2026 Katie Lansdale. All rights reserved.",
    seoTitle: settings?.seoTitle || "Katie Lansdale | Violinist",
    seoDescription: settings?.seoDescription || "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
    backgroundImage,
  }))
  .patch("page-home", (patch) => patch.set({
    excerpt: "Official website of internationally acclaimed violinist Katie Lansdale—soloist, chamber musician, educator, and artistic leader.",
    seoTitle: "Katie Lansdale | Violinist",
    seoDescription: "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
    gallery,
  }).unset(["heroImage", "content"]))
  .commit()

console.log("Applied global background and homepage CMS defaults.")
