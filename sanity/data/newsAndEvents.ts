import {client} from "@/sanity/lib/client"
import {newsAndEventsQuery} from "@/sanity/queries/newsAndEvents"
import type {HighlightedEvent, NewsItem} from "@/types/newsAndEvents"

export async function getNewsAndEvents(now = new Date()): Promise<{news: NewsItem[]; events: HighlightedEvent[]}> {
  const page = await client.withConfig({useCdn: false}).fetch<{newsItems?: NewsItem[]; highlightedEvents?: HighlightedEvent[]} | null>(newsAndEventsQuery)
  return {
    news: (page?.newsItems || []).filter((item) => !item.expiresAt || new Date(item.expiresAt) > now),
    events: (page?.highlightedEvents || []).filter((item) => eventExpiry(item) > now).sort((a, b) => eventStartDate(a).localeCompare(eventStartDate(b))),
  }
}

function eventExpiry(event: HighlightedEvent): Date {
  if (event.expirationMode === "never") return new Date("9999-12-31T23:59:59.999Z")
  if (event.expiresAt && event.expirationMode !== "eventEnd") return new Date(event.expiresAt)
  return tenPmEastern(event.endDate || eventStartDate(event))
}

function eventStartDate(event: HighlightedEvent): string {
  return event.startDate
}

function tenPmEastern(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  const dateAtTenPmUtc = new Date(Date.UTC(year, month - 1, day, 22))
  const timeZoneName = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", timeZoneName: "shortOffset"})
    .formatToParts(dateAtTenPmUtc)
    .find((part) => part.type === "timeZoneName")?.value || "GMT-05:00"
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(timeZoneName)
  if (!match) return dateAtTenPmUtc
  const offsetMinutes = (Number(match[2]) * 60 + Number(match[3] || 0)) * (match[1] === "+" ? 1 : -1)
  return new Date(dateAtTenPmUtc.getTime() - offsetMinutes * 60_000)
}
