import {createClient} from "@sanity/client"
import {pressKitShortBioPlaceholder} from "../../sanity/content/pressKitSeed.ts"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

await client.patch("page-photos-press-kit").set({pressKitShortBio: pressKitShortBioPlaceholder}).commit()
console.log("Updated the Photos & Press Kit short biography.")
