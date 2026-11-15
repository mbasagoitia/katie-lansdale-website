import {client} from "@/sanity/lib/client"
import {highlightedEventsQuery, newsItemsQuery} from "@/sanity/queries/newsAndEvents"
import type {HighlightedEvent, NewsItem} from "@/types/newsAndEvents"

export async function getNewsAndEvents(now = new Date()): Promise<{news: NewsItem[]; events: HighlightedEvent[]}> {
  const [allNews, allEvents] = await Promise.all([
    client.withConfig({useCdn: false}).fetch<NewsItem[]>(newsItemsQuery),
    client.withConfig({useCdn: false}).fetch<HighlightedEvent[]>(highlightedEventsQuery),
  ])
  return {
    news: allNews.filter((item) => !item.expiresAt || new Date(item.expiresAt) > now),
    events: allEvents.filter((item) => eventExpiry(item) > now),
  }
}

function eventExpiry(event: HighlightedEvent): Date {
  if (event.expiresAt) return new Date(event.expiresAt)
  return tenPmEastern(event.startsAt)
}

function tenPmEastern(startsAt: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", timeZoneName: "shortOffset"}).formatToParts(new Date(startsAt))
  const value = (type: string) => parts.find((part) => part.type === type)?.value || ""
  const offset = value("timeZoneName").replace("GMT", "") || "-05:00"
  const normalizedOffset = /^[+-]\d{1,2}$/.test(offset)
    ? `${offset.slice(0, 1)}${offset.slice(1).padStart(2, "0")}:00`
    : offset
  return new Date(`${value("year")}-${value("month")}-${value("day")}T22:00:00${normalizedOffset}`)
}
