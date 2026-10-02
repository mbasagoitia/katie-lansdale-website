import type {Metadata} from "next"
import Image from "next/image"
import Link from "next/link"
import type {SanityImageSource} from "@sanity/image-url"
import AddToCartButton from "@/components/music/AddToCartButton"
import CartPanel from "@/components/music/CartPanel"
import {RichTextContent} from "@/components/cms/PageContent"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {getProducts} from "@/sanity/data/products"
import {urlFor} from "@/sanity/lib/image"
import type {Product} from "@/types/product"
import styles from "./page.module.css"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("page-watch-listen")
}

export default async function WatchListen() {
  const [products, page] = await Promise.all([getProducts(), getPageById("page-watch-listen")])
  const albums = products.filter((product) => product.productKind === "album")
  const singles = products.filter((product) => product.productKind !== "album")
  const singlesWithArtwork = singles.filter((product) => product.coverArt)
  const singlesWithoutArtwork = singles.filter((product) => !product.coverArt)

  return <div className={styles.page}>
    <header className={styles.intro}>
      <h1>{page?.title || "Watch / Listen"}</h1>
      <CartPanel />
    </header>

    {page?.content?.length ? <div className={styles.cmsContent}><RichTextContent content={page.content} /></div> : null}

    <section className={styles.section}>
      <SectionHeading title="Albums" />
      {albums.length ? <div className={styles.albumFeatures}>{albums.map((product) => <AlbumFeature key={product._id} product={product} />)}</div> : <p className={styles.empty}>Albums will appear here when they are available for purchase.</p>}
    </section>

    <section className={styles.section}>
      <SectionHeading title="Singles" />
      {singles.length === 0 ? <p className={styles.empty}>Singles will appear here when they are available for purchase.</p> : <>
        {singlesWithArtwork.length > 0 && <div className={styles.singleTiles}>{singlesWithArtwork.map((product) => <SingleTile key={product._id} product={product} />)}</div>}
        {singlesWithoutArtwork.length > 0 && <div className={styles.singleList}>{singlesWithoutArtwork.map((product) => <SingleListItem key={product._id} product={product} />)}</div>}
      </>}
    </section>
  </div>
}

function SectionHeading({title}: {title: string}) {
  return <div className={styles.sectionHeading}>
    <h2>{title}</h2>
  </div>
}

function AlbumFeature({product}: {product: Product}) {
  const imageUrl = coverUrl(product, 1100, true)
  const albumHref = `/watch-listen/${product.slug.current}`

  return <article className={styles.albumFeature}>
    <Link href={albumHref} className={styles.albumCoverLink} aria-label={`View ${product.title} album details`}>
      <Cover product={product} imageUrl={imageUrl} sizes="(max-width: 700px) calc(100vw - 64px), 360px" fullArt />
    </Link>
    <div className={styles.albumContent}>
      <p className={styles.kind}>Album</p>
      <h3><Link href={albumHref}>{product.title}</Link></h3>
      <p className={styles.meta}>{releaseMeta(product)}</p>
      {product.shortDescription && <p className={styles.description}>{product.shortDescription}</p>}
      <p className={styles.trackCount}>{product.recordings.length} {product.recordings.length === 1 ? "recording" : "recordings"}</p>
      <Link href={albumHref} className={styles.albumDetailsLink}>View tracks &amp; previews <span aria-hidden="true">→</span></Link>
      <PurchaseAction product={product} />
    </div>
  </article>
}

function SingleTile({product}: {product: Product}) {
  const imageUrl = coverUrl(product, 780)
  const previewRecording = product.recordings.find(hasPreview)

  return <article className={styles.singleTile}>
    <Cover product={product} imageUrl={imageUrl} sizes="(max-width: 700px) calc(100vw - 64px), 280px" />
    <div className={styles.tileContent}>
      <div className={styles.tileDetails}>
        <p className={styles.kind}>Single</p>
        <h3>{product.title}</h3>
        <p className={styles.meta}>{releaseMeta(product)}</p>
      </div>
      {previewRecording ? <Preview recording={previewRecording} label="Play preview" compact /> : <p className={styles.noPreview}>Preview coming soon</p>}
      <PurchaseAction product={product} compact />
    </div>
  </article>
}

function SingleListItem({product}: {product: Product}) {
  const previewRecording = product.recordings.find(hasPreview)

  return <article className={styles.listItem}>
    <div className={styles.listDetails}>
      <p className={styles.kind}>Single</p>
      <h3>{product.title}</h3>
      <p className={styles.meta}>{releaseMeta(product)}</p>
      {product.shortDescription && <p className={styles.description}>{product.shortDescription}</p>}
    </div>
    <div className={styles.listPreview}>{previewRecording ? <Preview recording={previewRecording} label="Play preview" compact /> : <p className={styles.noPreview}>Preview coming soon</p>}</div>
    <PurchaseAction product={product} compact />
  </article>
}

function Cover({product, imageUrl, sizes, fullArt = false}: {product: Product; imageUrl: string | null; sizes: string; fullArt?: boolean}) {
  return <div className={styles.cover}>
    {imageUrl ? <Image src={imageUrl} alt={`Cover art for ${product.title}`} fill sizes={sizes} className={`${styles.coverImage} ${fullArt ? styles.coverImageFull : ""}`} /> : <div className={styles.coverPlaceholder} aria-hidden="true"><span>{product.productKind === "album" ? "Album" : "Single"}</span></div>}
  </div>
}

function PurchaseAction({product, compact = false}: {product: Product; compact?: boolean}) {
  return <div className={`${styles.purchaseAction} ${compact ? styles.purchaseActionCompact : ""}`}>
    <div><strong>${product.price.toFixed(2)}</strong><span>{deliveryLabel(product)}</span></div>
    <AddToCartButton product={{id: product._id, title: product.title, price: product.price}} />
  </div>
}

function Preview({recording, label, compact = false}: {recording: Product["recordings"][number]; label: string; compact?: boolean}) {
  const path = recording.mediaType === "video" ? recording.previewVideo : recording.previewAudio
  const url = path ? publicPreviewUrl(recording.mediaType, path) : null
  if (!url) return null

  return <div className={`${styles.preview} ${compact ? styles.previewCompact : ""}`}>
    <p>{label}</p>
    {recording.mediaType === "video"
      ? <video className={styles.video} controls preload="metadata" src={url}>Your browser does not support video previews.</video>
      : <audio className={styles.audio} controls preload="metadata" src={url}>Your browser does not support audio previews.</audio>}
  </div>
}

function coverUrl(product: Product, width: number, preserveFullArt = false): string | null {
  if (!product.coverArt) return null
  const image = urlFor(product.coverArt as SanityImageSource).width(width)
  return preserveFullArt ? image.url() : image.height(width).fit("crop").url()
}

function hasPreview(recording: Product["recordings"][number]): boolean {
  return Boolean(recording && (recording.mediaType === "video" ? recording.previewVideo : recording.previewAudio))
}

function releaseMeta(product: Product): string {
  const artist = product.album?.artist || product.recordings.at(0)?.artist || "Katie Lansdale"
  const year = product.album?.yearReleased || product.recordings[0]?.yearReleased
  const composer = product.work?.composer?.name
  const arranger = product.work?.arrangedBy ? `Arr. ${product.work.arrangedBy}` : undefined
  return [artist, year, composer, arranger].filter(Boolean).join(" · ")
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
