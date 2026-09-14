import type {Metadata} from "next"
import Image from "next/image"
import type {SanityImageSource} from "@sanity/image-url"
import styles from "./page.module.css"
import {getProducts} from "@/sanity/data/products"
import {urlFor} from "@/sanity/lib/image"
import type {Product} from "@/types/product"

export const metadata: Metadata = {
  title: "Watch / Listen | Katie Lansdale",
  description: "Albums and recordings by violinist Katie Lansdale.",
}

export default async function WatchListen() {
  const products = await getProducts()
  const albums = products.filter((product) => product.productKind === "album")
  const singles = products.filter((product) => product.productKind !== "album")

  return <div className={styles.page}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Katie Lansdale</p>
      <h1>Watch / Listen</h1>
      <p>Explore recordings currently available for purchase.</p>
    </header>

    <ReleaseSection title="Albums" products={albums} emptyMessage="Albums will appear here when they are available for purchase." />
    <ReleaseSection title="Singles" products={singles} emptyMessage="Singles will appear here when they are available for purchase." />
  </div>
}

function ReleaseSection({title, products, emptyMessage}: {title: string; products: Product[]; emptyMessage: string}) {
  return <section className={styles.section}>
    <h2>{title}</h2>
    {products.length === 0 ? <p className={styles.empty}>{emptyMessage}</p> : <div className={styles.grid}>{products.map((product) => <ReleaseCard key={product._id} product={product} />)}</div>}
  </section>
}

function ReleaseCard({product}: {product: Product}) {
  const imageUrl = product.coverArt ? urlFor(product.coverArt as SanityImageSource).width(900).height(900).fit("crop").url() : null
  const artist = product.album?.artist || product.recordings[0]?.artist || "Katie Lansdale"
  const year = product.album?.yearReleased || product.recordings[0]?.yearReleased
  const composer = product.work?.composer?.name

  return <article className={styles.card}>
    <div className={styles.cover}>
      {imageUrl ? <Image src={imageUrl} alt={`Cover art for ${product.title}`} fill sizes="(max-width: 700px) calc(100vw - 80px), (max-width: 1050px) calc(50vw - 80px), 350px" className={styles.coverImage} /> : <div className={styles.coverPlaceholder} aria-hidden="true"><span>{product.productKind === "album" ? "Album" : "Single"}</span></div>}
    </div>
    <div className={styles.cardContent}>
      <p className={styles.kind}>{product.productKind === "album" ? "Album" : "Single"}</p>
      <h3>{product.title}</h3>
      <p className={styles.meta}>{[artist, year, composer].filter(Boolean).join(" · ")}</p>
      {product.shortDescription && <p className={styles.description}>{product.shortDescription}</p>}
      <div className={styles.purchase}><span>${product.price.toFixed(2)}</span><span>{deliveryLabel(product)}</span></div>
      <TrackList recordings={product.recordings} />
    </div>
  </article>
}

function TrackList({recordings}: {recordings: Product["recordings"]}) {
  if (!recordings.length) return null
  return <div className={styles.tracks}>
    <p className={styles.trackHeading}>{recordings.length === 1 ? "Recording" : "Track list"}</p>
    {recordings.map((recording) => <div className={styles.track} key={recording._id}>
      <div><span>{recording.title}</span>{recording.duration && <span className={styles.duration}>{recording.duration}</span>}</div>
      <Preview recording={recording} />
    </div>)}
  </div>
}

function Preview({recording}: {recording: Product["recordings"][number]}) {
  const path = recording.mediaType === "video" ? recording.previewVideo : recording.previewAudio
  const url = path ? publicPreviewUrl(recording.mediaType, path) : null
  if (!url) return null
  return recording.mediaType === "video"
    ? <video className={styles.video} controls preload="metadata" src={url}>Your browser does not support video previews.</video>
    : <audio className={styles.audio} controls preload="metadata" src={url}>Your browser does not support audio previews.</audio>
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
