import type {Metadata} from "next"
import Image from "next/image"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "News & Events | Katie Lansdale",
  description: "Selected upcoming performances and events with violinist Katie Lansdale.",
}

type Event = {
  date: string
  title: string
  description: string
  location?: string
  href?: string
  image?: {src: string; alt: string}
  status?: string
}

const lionsGateCalendar = "https://lionsgatetrio.org/calendar"

const events: Event[] = [
  {
    date: "February 20 · 2 PM",
    title: "Soundwaves Concert: Lions Gate Trio",
    description: "The library’s trio-in-residence presents an exquisite pairing of a beloved masterpiece and a forgotten treasure, followed by light refreshments and time with the musicians.",
    location: "Memorial Room, Fairfield Public Library · Fairfield, CT",
    href: lionsGateCalendar,
    image: {src: "/images/lions-gate-trio.webp", alt: "The Lions Gate Trio"},
  },
  {
    date: "February 21 · 1 PM",
    title: "Guilford Free Library Performance",
    description: "Katie joins Darrett Adkins and Florence Millet for an afternoon performance with the Lions Gate Trio.",
    location: "Guilford Free Library · Guilford, CT",
    href: lionsGateCalendar,
    image: {src: "/images/lions-gate-trio.webp", alt: "The Lions Gate Trio"},
  },
  {
    date: "February 21 · 6 PM",
    title: "Hartt Spring Residency",
    description: "An evening with the Lions Gate Trio at The Hartt School. Program details will be announced soon.",
    location: "Lincoln Theater, University of Hartford · West Hartford, CT",
    href: lionsGateCalendar,
  },
  {
    date: "Date forthcoming",
    title: "Promisek Concert",
    description: "A sample calendar event for the Promisek Solo Strings Workshop.",
    image: {src: "/images/projects/promisek-house.png", alt: "Promisek workshop setting"},
    status: "Sample event",
  },
  {
    date: "Date forthcoming",
    title: "Violin & Verse",
    description: "A sample calendar event for a Violin & Verse event.",
    image: {src: "/images/projects/violin-and-verse-canyon.png", alt: "Canyon landscape for Violin and Verse"},
    status: "Sample event",
  },
]

export default function NewsAndEventsPage() {
  return <main className={styles.page} data-quiet-background>
    <header className={styles.header}>
      <h1>February <span>2027</span></h1>
    </header>

    <section className={styles.eventList} aria-label="Selected events for February 2027">
      {events.map((event) => <EventCard key={event.title} event={event} />)}
    </section>
  </main>
}

function EventCard({event}: {event: Event}) {
  const title = event.href ? <a href={event.href} target="_blank" rel="noreferrer">{event.title} <span aria-hidden="true">↗</span></a> : event.title

  return <article className={styles.event}>
    <div className={styles.media}>
      {event.image ? <Image src={event.image.src} alt={event.image.alt} fill sizes="(max-width: 700px) 100vw, 300px" /> : <div className={styles.imagePlaceholder} aria-label="Placeholder image"><span>Placeholder<br />Image</span></div>}
    </div>
    <div className={styles.details}>
      <div className={styles.meta}><p className={styles.date}>{event.date}</p>{event.status && <p className={styles.status}>{event.status}</p>}</div>
      <h2>{title}</h2>
      {event.location && <p className={styles.location}>{event.location}</p>}
      <p className={styles.description}>{event.description}</p>
    </div>
  </article>
}
