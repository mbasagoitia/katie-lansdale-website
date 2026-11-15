import {client} from "@/sanity/lib/client"
import {highlightedEventsQuery, newsEventsOrderQuery, newsItemsQuery} from "@/sanity/queries/newsAndEvents"
import type {HighlightedEvent, NewsItem} from "@/types/newsAndEvents"

export async function getNewsAndEvents(now = new Date()): Promise<{news: NewsItem[]; events: HighlightedEvent[]}> {
  const [allNews, allEvents, order] = await Promise.all([
    client.withConfig({useCdn: false}).fetch<NewsItem[]>(newsItemsQuery),
    client.withConfig({useCdn: false}).fetch<HighlightedEvent[]>(highlightedEventsQuery),
    client.withConfig({useCdn: false}).fetch<{newsIds?: string[]; eventIds?: string[]} | null>(newsEventsOrderQuery),
  ])
  return {
    news: applyDisplayOrder(allNews.filter((item) => !item.expiresAt || new Date(item.expiresAt) > now), order?.newsIds),
    events: applyDisplayOrder(allEvents.filter((item) => eventExpiry(item) > now), order?.eventIds),
  }
}

function applyDisplayOrder<T extends {_id: string}>(items: T[], orderedIds?: string[]): T[] {
  if (!orderedIds?.length) return items
  const rank = new Map(orderedIds.map((id, index) => [id, index]))
  return items.slice().sort((a, b) => (rank.get(a._id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b._id) ?? Number.MAX_SAFE_INTEGER))
}

function eventExpiry(event: HighlightedEvent): Date {
  if (event.expirationMode === "never") return new Date("9999-12-31T23:59:59.999Z")
  if (event.expiresAt && event.expirationMode !== "eventEnd") return new Date(event.expiresAt)
  return tenPmEastern(event.endDate || eventStartDate(event))
}

function eventStartDate(event: HighlightedEvent): string {
  if (event.startDate) return event.startDate
  if (!event.startsAt) return "1970-01-01"
  return new Intl.DateTimeFormat("en-CA", {timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date(event.startsAt))
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
