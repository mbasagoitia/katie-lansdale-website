import type {Metadata} from "next"
import Image from "next/image"
import type {SanityImageSource} from "@sanity/image-url"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import type {CmsPage, SanityImage, TrioEvent, TrioMember, TrioRecording} from "@/types/page"
import RecordingPlayer from "@/components/lions-gate-trio/RecordingPlayer"
import {getLionsGateCalendarEvents, type LionsGateCalendarEvent} from "@/lib/lions-gate-calendar"
import styles from "./page.module.css"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("page-lions-gate-trio")
}

const defaultMembers: TrioMember[] = [
  {_key: "katie", name: "Katie Lansdale", instrument: "Violin"},
  {_key: "darrett", name: "Darrett Adkins", instrument: "Cello"},
  {_key: "florence", name: "Florence Millet", instrument: "Piano"},
]

export default async function LionsGateTrioPage() {
  const [page, calendarEvents] = await Promise.all([getPageById("page-lions-gate-trio"), getLionsGateCalendarEvents()])
  const websiteUrl = page?.trioWebsiteUrl || "https://lionsgatetrio.org/"
  const members = page?.trioMembers?.length ? page.trioMembers : defaultMembers
  const recordings = page?.trioRecordings || []
  const events = [...(page?.trioEvents || []), ...calendarEvents].sort((a, b) => a.date.localeCompare(b.date))

  return <main className={styles.page} data-quiet-background>
    <header className={styles.hero}>
      <HeroImage image={page?.heroImage} />
      <div className={styles.heroContent}>
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
        <p className={styles.sectionLabel}>{page?.trioAboutLabel || "The Trio"}</p>
        <h2>{page?.trioAboutHeading || "A shared musical life"}</h2>
      </div>
      <p>{page?.trioStatement || "For over three decades, Katie Lansdale has performed with the internationally acclaimed Lions Gate Trio. Together with cellist Darrett Adkins and pianist Florence Millet, she brings the piano-trio repertoire to life through performances, recordings, residencies, and educational work in the United States and Europe."}</p>
    </section>

    <NewsSection page={page} />

    <section className={styles.recordings}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionLabel}>{page?.trioListenLabel || "Listen"}</p>
          <h2>{page?.trioListenHeading || "Selected recordings"}</h2>
        </div>
        <ExternalLink href={`${websiteUrl.replace(/\/$/, "")}/listen`}>{page?.trioListenLinkLabel || "Full discography"}</ExternalLink>
      </div>
      {recordings.length ? <div className={styles.recordingGrid}>{recordings.map((recording) => <RecordingCard key={recording._key} recording={recording} />)}</div> : <p className={styles.empty}>Recordings will be available soon.</p>}
    </section>

    <section className={styles.events}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionLabel}>{page?.trioEventsLabel || "On stage"}</p>
          <h2>{page?.trioEventsHeading || "Upcoming performances"}</h2>
        </div>
        <ExternalLink href={`${websiteUrl.replace(/\/$/, "")}/calendar`}>{page?.trioEventsLinkLabel || "Full calendar"}</ExternalLink>
      </div>
      {events.length ? <div className={styles.eventList}>{events.map((event) => <EventCard key={"id" in event ? event.id : event._key} event={event} />)}</div> : <p className={styles.empty}>Upcoming Lions Gate Trio performances will be announced soon.</p>}
    </section>

    <section className={styles.cta}>
      <p>{page?.trioCtaText || "For complete concert information, recordings, and news, visit the Lions Gate Trio official website."}</p>
      <ExternalLink href={websiteUrl}>{page?.trioCtaLinkLabel || "Visit LionsGateTrio.org"}</ExternalLink>
    </section>
  </main>
}

function HeroImage({image}: {image?: SanityImage}) {
  const src = image?.asset ? urlFor(image as SanityImageSource).width(1800).height(1000).fit("crop").url() : null
  return <div className={styles.heroImage}>{src ? <Image src={src} alt={image?.alt || "Lions Gate Trio"} fill priority sizes="100vw" /> : <Image src="/images/lions-gate-trio.webp" alt="Lions Gate Trio" fill priority sizes="100vw" />}</div>
}

function RecordingCard({recording}: {recording: TrioRecording}) {
  const coverArtUrl = recording.coverArt?.asset ? urlFor(recording.coverArt as SanityImageSource).width(800).height(800).fit("crop").url() : null
  const audioUrl = recording.audioFile?.asset?.url
  const detailsLabel = [recording.composer, recording.albumName].filter(Boolean).join(" · ")
  const details = <div className={styles.recordingDetails}>
    <h3>{recording.title}</h3>
    {detailsLabel && <p>{detailsLabel}</p>}
  </div>
  return <article className={styles.recordingCard}>
    {audioUrl && coverArtUrl ? <RecordingPlayer audioUrl={audioUrl} coverArtUrl={coverArtUrl} coverArtAlt={recording.coverArt?.alt || `Cover art for ${recording.title}`} title={recording.title} /> : <div className={styles.albumArt}>{coverArtUrl ? <Image src={coverArtUrl} alt={recording.coverArt?.alt || `Cover art for ${recording.title}`} fill sizes="(max-width: 700px) 100vw, 30vw" /> : <span>LGT</span>}</div>}
    {details}
  </article>
}

function NewsSection({page}: {page: CmsPage | null}) {
  const defaultNews = {
    heading: "Recently released: Lumières",
    body: "Lumières features music by Fauré, Saariaho, Höller, Iannotta, and Bertrand. The album is available on Spotify, Apple Music, Amazon Music, and through Editions Hortus.",
    linkUrl: "https://www.editionshortus.com/",
  }
  const items = page?.trioNewsItems?.length ? page.trioNewsItems : [{_key: "default-news", title: defaultNews.heading, description: defaultNews.body, linkUrl: defaultNews.linkUrl}]

  return <>{items.map((news) => {
    const imageUrl = news.image?.asset ? urlFor(news.image as SanityImageSource).width(1000).height(1000).fit("max").url() : null
    return <section key={news._key} className={`${styles.news} ${imageUrl ? styles.newsWithImage : ""}`}>
    {imageUrl && <div className={styles.newsImage}><Image src={imageUrl} alt={news.image?.alt || "Lions Gate Trio news"} fill sizes="(max-width: 800px) 100vw, 360px" /></div>}
    <div className={styles.newsText}>
      <p className={styles.sectionLabel}>{page?.trioNewsLabel || "News"}</p>
      <h2>{news.title}</h2>
      {news.description && <div className={styles.newsContent}><p>{news.description}</p></div>}
      {news.linkUrl && <ExternalLink href={news.linkUrl}>{news.linkLabel || "Learn more"}</ExternalLink>}
    </div>
  </section>
  })}</>
}

function EventCard({event}: {event: TrioEvent | LionsGateCalendarEvent}) {
  const date = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", year: "numeric", timeZone: "UTC"}).format(new Date(`${event.date}T12:00:00Z`))
  const description = "description" in event ? event.description : undefined
  const imageUrl = "image" in event && event.image?.asset ? urlFor(event.image as SanityImageSource).width(700).height(500).fit("crop").url() : "imageUrl" in event ? event.imageUrl : undefined
  const imageAlt = "image" in event ? event.image?.alt : "imageAlt" in event ? event.imageAlt : undefined
  const content = <>
    {imageUrl && <div className={styles.eventImage}><Image src={imageUrl} alt={imageAlt || "Lions Gate Trio performance"} fill sizes="(max-width: 800px) 100vw, 260px" /></div>}
    <div className={styles.eventContent}><p className={styles.eventDate}>{date}</p><h3>{event.title}</h3><p className={styles.eventVenue}>{[event.venue, event.location].filter(Boolean).join(" · ")}</p>{description && <p className={styles.eventDescription}>{description}</p>}</div>
  </>
  return event.url ? <ExternalLink href={event.url} className={styles.event} showIcon={false}>{content}</ExternalLink> : <article className={styles.event}>{content}</article>
}

function ExternalLink({href, children, className, showIcon = true}: {href: string; children: React.ReactNode; className?: string; showIcon?: boolean}) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}{showIcon && <span aria-hidden="true"> ↗</span>}</a>
}
