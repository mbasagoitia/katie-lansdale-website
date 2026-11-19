import {createClient} from "@sanity/client"
import {aboutPageSeed} from "../../sanity/content/aboutPageSeed.ts"

const requiredEnvironment = ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_WRITE_TOKEN"]
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key])

if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
})

const documents = await client.fetch(`*[_id in ["page-about", "drafts.page-about"]]{_id}`)

if (!documents.length) {
  throw new Error("The About page has not been created in Sanity yet.")
}

await Promise.all(documents.map(({_id}) => client.patch(_id).set({
  aboutTagline: aboutPageSeed.excerpt,
  aboutIntroduction: aboutPageSeed.introduction,
  aboutBiographySections: aboutPageSeed.biographySections,
}).unset(["content"]).commit()))

console.log(`Updated ${documents.length} About page document${documents.length === 1 ? "" : "s"}.`)
