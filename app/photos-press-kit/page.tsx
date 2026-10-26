import type {Metadata} from "next"
import type {SanityImageSource} from "@sanity/image-url"
import Link from "@/components/ui/page-transition/TransitionLink"
import BioResources from "@/components/press-kit/BioResources"
import PressPhotoGallery, {type GalleryPhoto} from "@/components/press-kit/PressPhotoGallery"
import {pressKitLongBio, pressKitShortBioPlaceholder, pressPhotoSeeds} from "@/sanity/content/pressKitSeed"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import styles from "./page.module.css"

export const revalidate = 60

const pageId = "page-photos-press-kit"

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(pageId)
}

export default async function PhotosPressKitPage() {
  const page = await getPageById(pageId)
  const photos = page?.pressKitPhotos?.flatMap((photo) => photo.image?.asset ? [{
    key: photo._key,
    src: urlFor(photo.image as SanityImageSource).width(1800).url(),
    alt: photo.image.alt || "Katie Lansdale",
    label: photo.label || "Press photo",
  }] : []) || fallbackPhotos
  const longBio = toParagraphs(page?.pressKitLongBio?.length ? page.pressKitLongBio : pressKitLongBio)
  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>{page?.title || "Photos & Press Kit"}</h1>
      <p>{page?.excerpt || "Approved images and press materials for presenters, media, and collaborators."}</p>
    </header>

    <section className={styles.photoSection} aria-labelledby="press-photos-heading">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="press-photos-heading">Press photos</h2>
          <p>Click any image to open a larger view.</p>
        </div>
      </div>
      <PressPhotoGallery photos={photos} />
    </section>

    <section className={styles.bioSection} aria-labelledby="biography-heading">
      <h2 id="biography-heading">Biography</h2>
      <BioResources bios={[
        {id: "short", title: "Short bio", paragraphs: toParagraphs(page?.pressKitShortBio || pressKitShortBioPlaceholder)},
        {id: "long", title: "Long bio", paragraphs: longBio},
      ]} />
    </section>

    <section className={styles.reviews} aria-labelledby="selected-reviews-heading">
      <div className={styles.reviewIntro}>
        <p className={styles.label}>Critical acclaim</p>
        <h2 id="selected-reviews-heading">Selected reviews</h2>
      </div>
      <div className={styles.reviewGrid}>
        {topReviews.map((review) => <figure key={review.source}>
          <blockquote>“{review.quote}”</blockquote>
          <figcaption>— {review.source}</figcaption>
        </figure>)}
      </div>
      <Link className={styles.allReviewsLink} href="/reviews">Read all reviews <span aria-hidden="true">→</span></Link>
    </section>

    <section className={styles.resources} aria-label="Press kit contact information">
      <div>
        <p className={styles.label}>For presenters & media</p>
        <h2>Get in touch</h2>
        <p>For booking, interview requests, additional materials, or permission to use press images, please get in touch.</p>
      </div>
      <div className={styles.resourceLinks}>
        <Link href="/contact">Contact <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  </main>
}

const fallbackPhotos: GalleryPhoto[] = pressPhotoSeeds.map((photo) => ({
  key: photo.key,
  src: `/${photo.sourcePath.replace(/^public\//, "")}`,
  alt: photo.alt,
  label: photo.label,
}))

function toParagraphs(value: string | { _type: string; children?: Array<{text?: string}> }[]) {
  if (typeof value === "string") return value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return value.flatMap((block) => {
    if (block._type !== "block") return []
    const paragraph = block.children?.map((child) => child.text || "").join("").trim()
    return paragraph ? [paragraph] : []
  })
}

const topReviews = [
  {
    quote: "A bold and expressive soloist.",
    source: "Boston Globe",
  },
  {
    quote: "A stunning musician and wonderful soloist, communicating an infectious joy … a wonderful addition to the international music scene.",
    source: "Berliner Morgenpost",
  },
  {
    quote: "It was a remarkable evening—one in which the music seemed as it must have when played the very first time, perhaps from still-damp manuscript paper. It was that revealing. It was that good.",
    source: "Raleigh-Durham Spectator",
  },
]
