import {createClient} from "@sanity/client"
import {sitePageSeeds} from "../../sanity/content/sitePageSeeds.ts"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const transaction = client.transaction()
for (const page of sitePageSeeds) {
  if (page.seoTitle || page.seoDescription) transaction.patch(page.id, (patch) => patch.set({seoTitle: page.seoTitle, seoDescription: page.seoDescription}))
}

await transaction.commit()
console.log(`Updated SEO overrides for ${sitePageSeeds.filter((page) => page.seoTitle || page.seoDescription).length} pages.`)
