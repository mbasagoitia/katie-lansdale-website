import type {Metadata} from "next"
import Image from "next/image"
import type {SanityImageSource} from "@sanity/image-url"
import {getPageById} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import type {CmsPage, SanityImage, TrioEvent, TrioMember, TrioRecording} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Lions Gate Trio | Katie Lansdale",
  description: "Violinist Katie Lansdale and the Lions Gate Trio.",
}

const defaultMembers: TrioMember[] = [
  {_key: "katie", name: "Katie Lansdale", instrument: "Violin"},
  {_key: "darrett", name: "Darrett Adkins", instrument: "Cello"},
  {_key: "florence", name: "Florence Millet", instrument: "Piano"},
]

const defaultRecordings: TrioRecording[] = [
  {_key: "ravel-ives-clarke", title: "Ravel · Ives · Clarke", subtitle: "Piano trios by Ravel, Ives, and Rebecca Clarke"},
  {_key: "schumann", title: "Complete Music of Robert Schumann", subtitle: "A selected Lions Gate Trio recording"},
  {_key: "american-trios", title: "American Trios", subtitle: "Music by Helps, Moe, Diesendruck, and Thomas"},
]

export default async function LionsGateTrioPage() {
  const page = await getPageById("page-lions-gate-trio")
  const websiteUrl = page?.trioWebsiteUrl || "https://lionsgatetrio.org/"
  const members = page?.trioMembers?.length ? page.trioMembers : defaultMembers
  const recordings = page?.trioRecordings?.length ? page.trioRecordings : defaultRecordings

  return <main className={styles.page}>
    <header className={styles.hero}>
      <HeroImage image={page?.heroImage} />
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>Katie Lansdale · Violin</p>
        <h1>{page?.title || "Lions Gate Trio"}</h1>
        <p className={styles.intro}>{page?.excerpt || "A long-standing musical partnership shaped by curiosity, generosity, and the joy of chamber music."}</p>
      </div>
    </header>

    <section className={styles.members} aria-label="Lions Gate Trio members">
      {members.map((member) => <div key={member._key}>
        <p>{member.instrument}</p>
        <h2>{member.name}</h2>
      </div>)}
    </section>

    <section className={styles.about}>
      <div>
        <p className={styles.sectionLabel}>The Trio</p>
        <h2>A shared musical life</h2>
      </div>
      <p>{page?.trioStatement || "For over 35 years, Katie Lansdale has performed with the internationally acclaimed Lions Gate Trio. Together with cellist Darrett Adkins and pianist Florence Millet, she brings the piano-trio repertoire to life through performances, recordings, residencies, and educational work in the United States and Europe."}</p>
    </section>

    <blockquote className={styles.quote}>
      <p>“{page?.trioQuote || "These three stunning musicians are wonderful soloists, and as a team, unbeatable."}”</p>
      <footer>— {page?.trioQuoteAttribution || "Berliner Morgenpost"}</footer>
    </blockquote>

    <Highlight highlight={page?.trioHighlight} />

    <section className={styles.recordings}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionLabel}>Listen</p>
          <h2>Selected recordings</h2>
        </div>
        <ExternalLink href={`${websiteUrl.replace(/\/$/, "")}/listen`}>Full discography</ExternalLink>
      </div>
      <div className={styles.recordingGrid}>
        {recordings.map((recording) => <RecordingCard key={recording._key} recording={recording} />)}
      </div>
    </section>

    <section className={styles.events}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionLabel}>On stage</p>
          <h2>Upcoming performances</h2>
        </div>
        <ExternalLink href={`${websiteUrl.replace(/\/$/, "")}/calendar`}>Full calendar</ExternalLink>
      </div>
      {page?.trioEvents?.length ? <div className={styles.eventList}>{page.trioEvents.map((event) => <EventCard key={event._key} event={event} />)}</div> : <p className={styles.empty}>Upcoming Lions Gate Trio performances will be announced soon.</p>}
    </section>

    <section className={styles.cta}>
      <p>For complete concert information, recordings, and news, visit the Lions Gate Trio.</p>
      <ExternalLink href={websiteUrl}>Visit LionsGateTrio.org</ExternalLink>
    </section>
  </main>
}

function HeroImage({image}: {image?: SanityImage}) {
  const src = image?.asset ? urlFor(image as SanityImageSource).width(1800).height(1000).fit("crop").url() : null
  return <div className={styles.heroImage}>{src ? <Image src={src} alt={image?.alt || "Lions Gate Trio"} fill priority sizes="100vw" /> : <div className={styles.heroPlaceholder} aria-hidden="true" />}</div>
}

function Highlight({highlight}: {highlight?: CmsPage["trioHighlight"]}) {
  if (!highlight?.title && !highlight?.description) return null
  const src = highlight.image?.asset ? urlFor(highlight.image as SanityImageSource).width(1000).height(700).fit("crop").url() : null

  return <section className={styles.highlight}>
    {src && <div className={styles.highlightImage}><Image src={src} alt={highlight.image?.alt || "Lions Gate Trio current highlight"} fill sizes="(max-width: 800px) 100vw, 42vw" /></div>}
    <div className={styles.highlightContent}>
      <p className={styles.sectionLabel}>Current highlight</p>
      {highlight.title && <h2>{highlight.title}</h2>}
      {highlight.description && <p>{highlight.description}</p>}
      {highlight.linkUrl && <ExternalLink href={highlight.linkUrl}>{highlight.linkLabel || "Learn more"}</ExternalLink>}
    </div>
  </section>
}

function RecordingCard({recording}: {recording: TrioRecording}) {
  const src = recording.coverArt?.asset ? urlFor(recording.coverArt as SanityImageSource).width(800).height(800).fit("crop").url() : null
  const content = <>
    <div className={styles.albumArt}>{src ? <Image src={src} alt={recording.coverArt?.alt || `Cover art for ${recording.title}`} fill sizes="(max-width: 700px) 100vw, 30vw" /> : <span>LGT</span>}</div>
    <h3>{recording.title}</h3>
    {recording.subtitle && <p>{recording.subtitle}</p>}
  </>
  return recording.url ? <ExternalLink href={recording.url} className={styles.recordingCard}>{content}</ExternalLink> : <article className={styles.recordingCard}>{content}</article>
}

function EventCard({event}: {event: TrioEvent}) {
  const date = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", year: "numeric", timeZone: "UTC"}).format(new Date(`${event.date}T12:00:00Z`))
  const content = <><p className={styles.eventDate}>{date}</p><h3>{event.title}</h3><p>{[event.venue, event.location].filter(Boolean).join(" · ")}</p></>
  return event.url ? <ExternalLink href={event.url} className={styles.event}>{content}</ExternalLink> : <article className={styles.event}>{content}</article>
}

function ExternalLink({href, children, className}: {href: string; children: React.ReactNode; className?: string}) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true"> ↗</span></a>
}
