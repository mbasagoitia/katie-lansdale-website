import type {Metadata} from "next"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {sitePageSeeds} from "@/sanity/content/sitePageSeeds"
import type {PageQuote} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

const reviewsPageId = "page-reviews"
const fallbackQuotes = (sitePageSeeds.find((page) => page.id === "page-home")?.quotes || []) as PageQuote[]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(reviewsPageId)
}

export default async function ReviewsPage() {
  const [reviewsPage, homePage] = await Promise.all([
    getPageById(reviewsPageId),
    getPageById("page-home"),
  ])
  const quotes = (homePage?.quotes?.length ? homePage.quotes : fallbackQuotes).slice().reverse()

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
