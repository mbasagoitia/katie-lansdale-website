import type {Metadata} from "next"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import styles from "./page.module.css"

export const revalidate = 60

const reviewsPageId = "page-reviews"
const fallbackQuotes = [
  { _key: "fallback-bold", quote: "A bold and expressive soloist.", attribution: "Boston Globe" },
  { _key: "fallback-stunning", quote: "A stunning musician and wonderful soloist, communicating an infectious joy … a wonderful addition to the international music scene.", attribution: "Berliner Morgenpost" },
  { _key: "fallback-remarkable", quote: "It was a remarkable evening—one in which the music seemed as it must have when played the very first time, perhaps from still-damp manuscript paper. It was that revealing. It was that good.", attribution: "Raleigh-Durham Spectator" },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(reviewsPageId)
}

export default async function ReviewsPage() {
  const reviewsPage = await getPageById(reviewsPageId)
  const quotes = reviewsPage?.reviews?.length ? reviewsPage.reviews : fallbackQuotes

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>{reviewsPage?.title || "Reviews"}</h1>
    </header>

    <section className={styles.reviewList} aria-label="Reviews and critical acclaim">
      {quotes.map((item, index) => <figure className={styles.review} key={item._key}>
        <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <blockquote>“{item.quote}”</blockquote>
        {item.attribution && <figcaption>— {item.attribution}</figcaption>}
      </figure>)}
    </section>
  </main>
}
