import type {Metadata} from "next"
import Image from "next/image"
import type {SanityImageSource} from "@sanity/image-url"
import {getNewsAndEvents} from "@/sanity/data/newsAndEvents"
import {urlFor} from "@/sanity/lib/image"
import type {HighlightedEvent, NewsItem} from "@/types/newsAndEvents"
import styles from "./page.module.css"

export const revalidate = 60

export const metadata: Metadata = {
  title: "News & Events | Katie Lansdale",
  description: "Upcoming performances, events, and news from violinist Katie Lansdale.",
}

export default async function NewsAndEventsPage() {
  const {news, events} = await getNewsAndEvents()
  const eventMonths = groupEventsByMonth(events)
  const topMonth = eventMonths[0]?.label || (news[0] ? monthLabel(news[0].publishedAt) : monthLabel(new Date().toISOString()))

  return <main className={styles.page} data-quiet-background>
    <header className={styles.header}><h1>{topMonth}</h1></header>

    {news.length > 0 && <section className={styles.contentSection} aria-labelledby="news-heading">
      <h2 className={styles.sectionHeading} id="news-heading">News</h2>
      <div className={styles.list}>{news.map((item) => <NewsCard key={item._id} item={item} />)}</div>
    </section>}

    {eventMonths.length > 0 && <section className={styles.contentSection} aria-labelledby="events-heading">
      <h2 className={styles.sectionHeading} id="events-heading">Highlighted Events</h2>
      {eventMonths.map((group, index) => <div className={styles.monthGroup} key={group.key}>
        {index > 0 && <h2 className={styles.monthHeading}>{group.label}</h2>}
        <div className={styles.list} aria-label={`Highlighted events for ${group.label}`}>{group.events.map((event) => <EventCard key={event._id} event={event} />)}</div>
      </div>)}
    </section>}

    {!news.length && !events.length && <p className={styles.empty}>Check back soon for upcoming events and performances.</p>}
  </main>
}

function NewsCard({item}: {item: NewsItem}) {
  return <article className={styles.item}>
    <ItemImage image={item.image} />
    <div className={styles.details}>
      <p className={styles.date}>{formatDateTime(item.publishedAt)}</p>
      <h2><LinkedTitle title={item.title} href={item.linkUrl} /></h2>
      <p className={styles.description}>{item.description}</p>
    </div>
  </article>
}

function EventCard({event}: {event: HighlightedEvent}) {
  return <article className={styles.item}>
    <ItemImage image={event.image} />
    <div className={styles.details}>
      <p className={styles.date}>{formatDateTime(event.startsAt)}</p>
      <h2><LinkedTitle title={event.title} href={event.linkUrl} /></h2>
      {event.location && <p className={styles.location}>{event.location}</p>}
      <p className={styles.description}>{event.description}</p>
    </div>
  </article>
}

function ItemImage({image}: {image?: NewsItem["image"]}) {
  const imageUrl = image ? urlFor(image as SanityImageSource).width(900).url() : null
  return <div className={styles.media}>{imageUrl ? <Image src={imageUrl} alt={image?.alt || ""} fill sizes="(max-width: 700px) 100vw, 300px" /> : <div className={styles.imagePlaceholder} aria-label="Placeholder image"><span>Placeholder<br />Image</span></div>}</div>
}

function LinkedTitle({title, href}: {title: string; href?: string}) {
  return href ? <a href={href} target="_blank" rel="noreferrer">{title} <span aria-hidden="true">↗</span></a> : title
}

function groupEventsByMonth(events: HighlightedEvent[]) {
  const groups = new Map<string, {key: string; label: string; events: HighlightedEvent[]}>()
  for (const event of events) {
    const key = monthKey(event.startsAt)
    const group = groups.get(key) || {key, label: monthLabel(event.startsAt), events: []}
    group.events.push(event)
    groups.set(key, group)
  }
  return [...groups.values()]
}

function monthKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {timeZone: "America/New_York", year: "numeric", month: "2-digit"}).format(new Date(value))
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", month: "long", year: "numeric"}).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"}).format(new Date(value)).replace(", ", " · ")
}
