import type {Metadata} from "next"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {sitePageSeeds} from "@/sanity/content/sitePageSeeds"
import type {HonorEntry, PresentationEntry, PublicationEntry} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

const pageId = "page-publications"
const fallbackPage = sitePageSeeds.find((page) => page.id === pageId)

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(pageId)
}

export default async function PublicationsPage() {
  const page = await getPageById(pageId)
  const publications = page?.publications?.length ? page.publications : fallbackPage?.publications || []
  const presentations = page?.presentations?.length ? page.presentations : fallbackPage?.presentations || []
  const honors = page?.honors?.length ? page.honors : fallbackPage?.honors || []

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>{page?.title || fallbackPage?.title || "Publications & Presentations"}</h1>
    </header>

    <CitationSection title="Selected writing" entries={publications} />
    <PresentationSection entries={presentations} />
    <HonorSection entries={honors} />
  </main>
}

function CitationSection({title, entries}: {title: string; entries: PublicationEntry[]}) {
  if (!entries.length) return null

  return <section className={styles.section} aria-labelledby="writing-heading">
    <h2 id="writing-heading">{title}</h2>
    <div className={styles.citationList}>
      {entries.map((entry) => <article className={styles.citation} key={entry._key}>
        <div className={styles.meta}>{[entry.publication, entry.date].filter(Boolean).join(" · ")}</div>
        <div>
          <h3>{entry.title}</h3>
          {entry.subtitle && <p className={styles.subtitle}>{entry.subtitle}</p>}
          {entry.collaborators && <p className={styles.byline}>By {entry.collaborators}</p>}
          {entry.description && <p className={styles.description}>{entry.description}</p>}
        </div>
      </article>)}
    </div>
  </section>
}

function PresentationSection({entries}: {entries: PresentationEntry[]}) {
  if (!entries.length) return null

  return <section className={styles.section} aria-labelledby="presentations-heading">
    <h2 id="presentations-heading">Presentations</h2>
    <div className={styles.presentationList}>
      {entries.map((entry) => <article className={styles.presentation} key={entry._key}>
        <div className={styles.meta}>{[entry.event, entry.date].filter(Boolean).join(" · ")}</div>
        <h3>{entry.title}</h3>
        {entry.description && <p>{entry.description}</p>}
      </article>)}
    </div>
  </section>
}

function HonorSection({entries}: {entries: HonorEntry[]}) {
  if (!entries.length) return null

  return <section className={styles.section} aria-labelledby="honors-heading">
    <h2 id="honors-heading">Honors & awards</h2>
    <div className={styles.honorGrid}>
      {entries.map((entry) => <article className={styles.honor} key={entry._key}>
        <div className={styles.meta}>{[entry.organization, entry.date].filter(Boolean).join(" · ")}</div>
        <h3>{entry.title}</h3>
        {entry.description && <p>{entry.description}</p>}
      </article>)}
    </div>
  </section>
}
