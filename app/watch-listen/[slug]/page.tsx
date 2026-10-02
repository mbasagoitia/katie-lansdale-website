import type {Metadata} from "next"
import Image from "next/image"
import Link from "next/link"
import {notFound} from "next/navigation"
import type {SanityImageSource} from "@sanity/image-url"
import AddToCartButton from "@/components/music/AddToCartButton"
import {getProductBySlug} from "@/sanity/data/products"
import {urlFor} from "@/sanity/lib/image"
import type {Product} from "@/types/product"
import styles from "./page.module.css"

export const revalidate = 60

type PageProps = {params: Promise<{slug: string}>}
type Recording = Product["recordings"][number]
type AlbumWork = NonNullable<Recording["work"]>

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params
  const product = await getProductBySlug(slug)
  if (!product || product.productKind !== "album") return {}

  return {
    title: `${product.title} | Katie Lansdale`,
    description: product.shortDescription || `Listen to track previews from ${product.title}.`,
  }
}

export default async function AlbumPage({params}: PageProps) {
  const {slug} = await params
  const product = await getProductBySlug(slug)
  if (!product || product.productKind !== "album") notFound()

  const coverArtUrl = product.coverArt
    ? urlFor(product.coverArt as SanityImageSource).width(1200).url()
    : null
  const workGroups = groupRecordingsByWork(product.recordings)

  return <main className={styles.page}>
    <Link href="/watch-listen" className={styles.backLink}>← Back to Watch / Listen</Link>

    <section className={styles.hero}>
      <div className={styles.cover}>
        {coverArtUrl
          ? <Image src={coverArtUrl} alt={`Cover art for ${product.title}`} fill sizes="(max-width: 760px) calc(100vw - 64px), 420px" className={styles.coverImage} />
          : <span>Album</span>}
      </div>
      <div className={styles.heroContent}>
        <p className={styles.kind}>Album</p>
        <h1>{product.title}</h1>
        <p className={styles.meta}>{releaseMeta(product)}</p>
        {product.shortDescription && <p className={styles.description}>{product.shortDescription}</p>}
        <p className={styles.trackCount}>{product.recordings.length} {product.recordings.length === 1 ? "recording" : "recordings"}</p>
        <PurchaseAction product={product} />
      </div>
    </section>

    <section className={styles.tracks} aria-labelledby="album-tracks">
      <div className={styles.sectionHeading}>
        <h2 id="album-tracks">Track listing</h2>
      </div>
      {workGroups.map(({key, work, recordings}) => <article className={styles.workGroup} key={key}>
        <header className={styles.workHeader}>
          {work?.composer?.name && <p className={styles.composer}>{work.composer.name}</p>}
          <h3>{work?.title || "Recording"}</h3>
          {work && <p className={styles.workMeta}>{[work.subtitle, work.catalogNumber, work.arrangedBy ? `Arr. ${work.arrangedBy}` : undefined].filter(Boolean).join(" · ")}</p>}
          {work?.movements?.length ? <p className={styles.movements}>{work.movements.map((movement) => `${movement.number ? `${movement.number}. ` : ""}${movement.title || "Untitled movement"}`).join(" · ")}</p> : null}
        </header>
        <ol className={styles.recordings}>
          {recordings.map((recording, index) => <li className={styles.track} key={recording._id}>
            <div className={styles.trackInfo}>
              <p className={styles.trackNumber}>{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h4>{movementTitle(recording)}</h4>
                <p>{[recording.artist, recording.yearReleased, recording.duration].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <Preview recording={recording} />
          </li>)}
        </ol>
      </article>)}
    </section>
  </main>
}

function groupRecordingsByWork(recordings: Recording[]) {
  const groups = new Map<string, {key: string; work?: AlbumWork; recordings: Recording[]}>()
  for (const recording of recordings) {
    const key = recording.work?._id || recording._id
    const existing = groups.get(key)
    if (existing) existing.recordings.push(recording)
    else groups.set(key, {key, work: recording.work, recordings: [recording]})
  }
  return [...groups.values()]
}

function movementTitle(recording: Recording): string {
  const movement = recording.movementNumber
    ? recording.work?.movements?.find(({number}) => number === recording.movementNumber)
    : undefined
  return movement?.title || recording.title
}

function Preview({recording}: {recording: Recording}) {
  const path = recording.mediaType === "video" ? recording.previewVideo : recording.previewAudio
  const previewUrl = path ? publicPreviewUrl(recording.mediaType, path) : null
  if (!previewUrl) return <p className={styles.noPreview}>Preview coming soon</p>

  return <div className={styles.preview}>
    {recording.mediaType === "video"
      ? <video controls preload="metadata" src={previewUrl}>Your browser does not support video previews.</video>
      : <audio controls preload="metadata" src={previewUrl}>Your browser does not support audio previews.</audio>}
  </div>
}

function PurchaseAction({product}: {product: Product}) {
  return <div className={styles.purchaseAction}>
    <div><strong>${product.price.toFixed(2)}</strong><span>{deliveryLabel(product)}</span></div>
    <AddToCartButton product={{id: product._id, title: product.title, price: product.price}} />
  </div>
}

function releaseMeta(product: Product): string {
  const artist = product.album?.artist || product.recordings.at(0)?.artist || "Katie Lansdale"
  const year = product.album?.yearReleased || product.recordings.at(0)?.yearReleased
  return [artist, year].filter(Boolean).join(" · ")
}

function publicPreviewUrl(mediaType: "audio" | "video", path: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return null
  const bucket = mediaType === "video" ? "video-previews" : "audio-previews"
  const encodedPath = path.split("/").map(encodeURIComponent).join("/")
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodedPath}`
}

function deliveryLabel(product: Product): string {
  const types = product.deliveryTypes?.length ? product.deliveryTypes : product.type ? [product.type] : []
  return types.map((type) => type === "physicalCD" ? "Physical CD" : "Digital download").join(" + ") || "Available for purchase"
}
