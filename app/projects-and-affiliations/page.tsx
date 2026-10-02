import Image from "next/image"
import type {Metadata} from "next"
import {sitePageSeeds} from "@/sanity/content/sitePageSeeds"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import type {ProjectCard} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

const pageId = "page-projects-and-affiliations"
const seed = sitePageSeeds.find((page) => page.id === pageId)
const fallbackCards = (seed?.projectCards || []) as ProjectCard[]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(pageId)
}

export default async function ProjectsAndAffiliationsPage() {
  const page = await getPageById(pageId)
  const cards = page?.projectCards?.length ? page.projectCards : fallbackCards

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>{page?.title || "Projects & Affiliations"}</h1>
      <p className={styles.excerpt}>{page?.excerpt || "A selection of Katie's ongoing artistic, educational, and collaborative work."}</p>
    </header>

    <section className={styles.grid} aria-label="Projects and affiliations">
      {cards.map((card) => <ProjectFeature key={card._key} card={card} />)}
    </section>
  </main>
}

function ProjectFeature({card}: {card: ProjectCard}) {
  const content = <>
    <div className={styles.imageWrap}>
      {card.imageUrl ? <Image src={card.imageUrl} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" className={styles.image} /> : <div className={styles.imageFallback} aria-hidden="true">{card.title.slice(0, 1)}</div>}
    </div>
    <div className={styles.content}>
      {card.category && <p className={styles.category}>{card.category}</p>}
      <h2>{card.title}</h2>
      {card.description && <p className={styles.description}>{card.description}</p>}
      {card.linkUrl && <span className={styles.linkLabel}>{card.linkLabel || "Learn more"} <span aria-hidden="true">↗</span></span>}
    </div>
  </>

  return card.linkUrl
    ? <a className={styles.card} href={card.linkUrl} target="_blank" rel="noreferrer">{content}</a>
    : <article className={styles.card}>{content}</article>
}
