import {createClient} from "@sanity/client"

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN.")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-24",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const recordingSources = [
  {
    key: "ravel-finale",
    title: "Piano Trio in A minor — IV. Finale: Animé",
    composer: "Maurice Ravel",
    albumName: "Ravel, Ives & Clarke: Piano Trios",
    coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1785280687262-S648O08QEVEHDEX4FZ1Q/Ravel_Ives_Clarke.jpg",
    audioUrl: "https://static1.squarespace.com/static/5a6cacc2cf81e018e2e33569/t/5a84b1aa8165f5ac7e90a42a/1785181515342/04+IV.+Finale_+Anime.m4a",
  },
  {
    key: "theater-of-the-ear",
    title: "Theater of the Ear — III. On That Day",
    composer: "Tamar Diesendruck",
    albumName: "Theater of the Ear",
    coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1517688123612-UTR5O3AJ8EKWG4X0264H/Theater_of_the_Ear.jpg",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/Music/a7/d4/4d/mzm.pfbzifep.aac.p.m4a",
  },
  {
    key: "schumann-mit-innigem-ausdruck",
    title: "Piano Trio No. 2 — II. Mit innigem Ausdruck",
    composer: "Robert Schumann",
    albumName: "Complete Music of Robert Schumann",
    coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1517078901961-S48A1QYF5LL5J38PXMHO/Schumann.jpeg",
    audioUrl: "https://static1.squarespace.com/static/5a6cacc2cf81e018e2e33569/t/5a84afefe4966b15dd8961a7/1785181515368/1-10+Piano+Trio+No.+2+in+F+major%2C+Op.+80+-+II.+Mit+innigem+Ausdruck.m4a",
  },
]

async function download(url, label) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not download ${label} (${response.status}).`)
  return Buffer.from(await response.arrayBuffer())
}

async function uploadImage(source) {
  const file = await download(source.coverArtUrl, `${source.title} cover art`)
  const asset = await client.assets.upload("image", file, {filename: `${source.key}.jpg`})
  return {_type: "image", asset: {_type: "reference", _ref: asset._id}, alt: `Cover art for ${source.title}`}
}

async function uploadAudio(source) {
  const file = await download(source.audioUrl, `${source.title} audio`)
  const asset = await client.assets.upload("file", file, {filename: `${source.key}.m4a`, contentType: "audio/mp4"})
  return {_type: "file", asset: {_type: "reference", _ref: asset._id}}
}

const recordings = await Promise.all(recordingSources.map(async (source) => ({
  _key: source.key,
  title: source.title,
  composer: source.composer,
  albumName: source.albumName,
  coverArt: await uploadImage(source),
  audioFile: await uploadAudio(source),
})))

const rawClient = client.withConfig({perspective: "raw"})
const draft = await rawClient.fetch(`*[_id == "drafts.page-lions-gate-trio"][0]{_id}`)
const fieldsToRemove = ["trioQuote", "trioQuoteAttribution", "trioHighlight", "trioHighlightLabel"]

const transaction = client.transaction()
  .patch("page-lions-gate-trio", (patch) => patch.set({trioRecordings: recordings}).unset(fieldsToRemove))

if (draft?._id) {
  transaction.patch(draft._id, (patch) => patch.set({trioRecordings: recordings}).unset(fieldsToRemove))
}

await transaction.commit()
console.log(`Uploaded cover art and audio files for ${recordings.length} Lions Gate Trio recordings${draft?._id ? ", including the draft" : ""}.`)
