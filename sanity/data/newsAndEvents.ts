import {client} from "@/sanity/lib/client"
import {tenPmEastern} from "@/sanity/lib/easternTime"
import {newsAndEventsQuery} from "@/sanity/queries/newsAndEvents"
import type {HighlightedEvent, NewsItem} from "@/types/newsAndEvents"

export async function getNewsAndEvents(now = new Date()): Promise<{news: NewsItem[]; events: HighlightedEvent[]}> {
  const page = await client.withConfig({useCdn: false}).fetch<{newsItems?: NewsItem[]; highlightedEvents?: HighlightedEvent[]} | null>(newsAndEventsQuery)
  return {
    news: (page?.newsItems || []).filter((item) => listingExpiry(item, item.date) > now),
    events: (page?.highlightedEvents || []).filter((item) => eventExpiry(item) > now).sort((a, b) => eventStartDate(a).localeCompare(eventStartDate(b))),
  }
}

function eventExpiry(event: HighlightedEvent): Date {
  return listingExpiry(event, event.endDate || eventStartDate(event))
}

function listingExpiry(item: {expirationMode?: "expire" | "never"; expirationAt?: string}, defaultDate: string): Date {
  if (item.expirationMode === "never") return new Date("9999-12-31T23:59:59.999Z")
  return item.expirationAt ? new Date(item.expirationAt) : tenPmEastern(defaultDate)
}

function eventStartDate(event: HighlightedEvent): string {
  return event.startDate
}
