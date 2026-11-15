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
const trioDefaults = {
  title: "Lions Gate Trio",
  excerpt: "A long-standing musical partnership shaped by curiosity, generosity, and the joy of chamber music.",
  trioMembers: [
    {_key: "katie", name: "Katie Lansdale", instrument: "Violin"},
    {_key: "darrett", name: "Darrett Adkins", instrument: "Cello"},
    {_key: "florence", name: "Florence Millet", instrument: "Piano"},
  ],
  trioAboutLabel: "The Trio",
  trioAboutHeading: "A shared musical life",
  trioStatement: "For over three decades, Katie Lansdale has performed with the internationally acclaimed Lions Gate Trio. Together with cellist Darrett Adkins and pianist Florence Millet, she brings the piano-trio repertoire to life through performances, recordings, residencies, and educational work in the United States and Europe.",
  trioNewsLabel: "News",
  trioListenLabel: "Listen",
  trioListenHeading: "Selected recordings",
  trioListenLinkLabel: "Full discography",
  trioEventsLabel: "On stage",
  trioEventsHeading: "Upcoming performances",
  trioEventsLinkLabel: "Full calendar",
  trioWebsiteUrl: "https://lionsgatetrio.org/",
  trioCtaText: "For complete concert information, recordings, and news, visit the Lions Gate Trio official website.",
  trioCtaLinkLabel: "Visit LionsGateTrio.org",
}

const defaultRecordings = [
  {
    _key: "ravel-finale",
    title: "Piano Trio in A minor — IV. Finale: Animé",
    composer: "Maurice Ravel",
    albumName: "Ravel, Ives & Clarke: Piano Trios",
  },
  {
    _key: "theater-of-the-ear",
    title: "Theater of the Ear — III. On That Day",
    composer: "Tamar Diesendruck",
    albumName: "Theater of the Ear",
  },
  {
    _key: "schumann-mit-innigem-ausdruck",
    title: "Piano Trio No. 2 — II. Mit innigem Ausdruck",
    composer: "Robert Schumann",
    albumName: "Complete Music of Robert Schumann",
  },
]

async function uploadImage(relativePath, alt) {
  const sourcePath = path.join(projectRoot, relativePath)
  if (!existsSync(sourcePath)) throw new Error(`Missing ${relativePath}`)
  const asset = await client.assets.upload("image", createReadStream(sourcePath), {filename: path.basename(sourcePath)})
  return {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt}
}

const [about, trio, trioDraft] = await Promise.all([
  client.fetch(`*[_id == "page-about"][0]{aboutTagline, excerpt}`),
  client.fetch(`*[_id == "page-lions-gate-trio"][0]{title, excerpt, heroImage, trioMembers, trioAboutLabel, trioAboutHeading, trioStatement, trioNewsLabel, trioNewsItems, trioNewsImage, trioNewsHeading, trioNews, trioNewsLink, trioRecordings, trioListenLabel, trioListenHeading, trioListenLinkLabel, trioEventsLabel, trioEventsHeading, trioEventsLinkLabel, trioWebsiteUrl, trioCtaText, trioCtaLinkLabel}`),
  client.withConfig({perspective: "raw"}).fetch(`*[_id == "drafts.page-lions-gate-trio"][0]{_id}`),
])

if (!trio) throw new Error("Missing page-lions-gate-trio.")

const heroImage = trio.heroImage || await uploadImage("public/images/lions-gate-trio.webp", "The Lions Gate Trio")
const existingNewsDescription = (trio.trioNews || [])
  .filter((block) => block?._type === "block")
  .map((block) => (block.children || []).map((child) => child.text || "").join(""))
  .filter(Boolean)
  .join("\n\n")
const lumieresImage = trio.trioNewsImage || await uploadImage("public/images/news-events/lumieres-feature.png", "Lumières album cover")
const defaultNews = [{
  _key: "lumieres-news",
  title: trio.trioNewsHeading || "Lumières: Radio France CD of the Week",
  description: existingNewsDescription || "The newly released Lions Gate Trio album, Lumières, was selected as Radio France’s CD of the Week. In an on-air review, Radio France called the recording a “grand success” and “sublime.”",
  image: lumieresImage,
  linkLabel: "Learn more",
  linkUrl: trio.trioNewsLink || "https://www.editionshortus.com/",
}]

const existingRecordings = Array.isArray(trio.trioRecordings) && trio.trioRecordings.length === 3
  ? trio.trioRecordings.map(({_key, title, composer, albumName, coverArt, audioFile}) => ({_key, title, composer, albumName, coverArt, audioFile}))
  : defaultRecordings

const tagline = about?.aboutTagline || about?.excerpt || "Soloist. Chamber Musician. Educator. Artistic Catalyst."
const trioContent = {
  title: trio.title || trioDefaults.title,
  excerpt: trio.excerpt || trioDefaults.excerpt,
  heroImage,
  trioMembers: Array.isArray(trio.trioMembers) && trio.trioMembers.length === 3 ? trio.trioMembers : trioDefaults.trioMembers,
  trioAboutLabel: trio.trioAboutLabel || trioDefaults.trioAboutLabel,
  trioAboutHeading: trio.trioAboutHeading || trioDefaults.trioAboutHeading,
  trioStatement: trio.trioStatement || trioDefaults.trioStatement,
  trioNewsLabel: trio.trioNewsLabel || trioDefaults.trioNewsLabel,
  trioRecordings: existingRecordings,
  trioNewsItems: Array.isArray(trio.trioNewsItems) && trio.trioNewsItems.length ? trio.trioNewsItems : defaultNews,
  trioListenLabel: trio.trioListenLabel || trioDefaults.trioListenLabel,
  trioListenHeading: trio.trioListenHeading || trioDefaults.trioListenHeading,
  trioListenLinkLabel: trio.trioListenLinkLabel || trioDefaults.trioListenLinkLabel,
  trioEventsLabel: trio.trioEventsLabel || trioDefaults.trioEventsLabel,
  trioEventsHeading: trio.trioEventsHeading || trioDefaults.trioEventsHeading,
  trioEventsLinkLabel: trio.trioEventsLinkLabel || trioDefaults.trioEventsLinkLabel,
  trioWebsiteUrl: trio.trioWebsiteUrl || trioDefaults.trioWebsiteUrl,
  trioCtaText: trio.trioCtaText || trioDefaults.trioCtaText,
  trioCtaLinkLabel: trio.trioCtaLinkLabel || trioDefaults.trioCtaLinkLabel,
}

const transaction = client.transaction()
  .patch("page-about", (patch) => patch.set({aboutTagline: tagline}).unset(["excerpt"]))
  .patch("page-lions-gate-trio", (patch) => patch.set(trioContent))

if (trioDraft?._id) transaction.patch(trioDraft._id, (patch) => patch.set(trioContent))

await transaction.commit()

console.log(`Seeded the About tagline and Lions Gate Trio CMS content${trioDraft?._id ? ", including its draft" : ""}.`)
