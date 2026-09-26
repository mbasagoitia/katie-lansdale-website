const CALENDAR_URL = "https://lionsgatetrio.org/calendar"
const LIONS_GATE_ORIGIN = "https://lionsgatetrio.org"
const SQUARESPACE_IMAGE_ORIGIN = "https://images.squarespace-cdn.com/"

export type LionsGateCalendarEvent = {
  id: string
  title: string
  date: string
  venue?: string
  location?: string
  description?: string
  imageUrl?: string
  imageAlt?: string
  url: string
}

export async function getLionsGateCalendarEvents(): Promise<LionsGateCalendarEvent[]> {
  try {
    const response = await fetch(CALENDAR_URL, {next: {revalidate: 3600}})
    if (!response.ok) return []

    return parseCalendarEvents(await response.text()).slice(0, 3)
  } catch {
    return []
  }
}

function parseCalendarEvents(html: string): LionsGateCalendarEvent[] {
  return html
    .split(/<article[^>]*eventlist-event--upcoming[^>]*>/i)
    .slice(1)
    .map((fragment) => fragment.split("</article>")[0])
    .map<LionsGateCalendarEvent | null>((fragment) => {
      const path = match(fragment, /<h1[^>]*eventlist-title[^>]*>\s*<a href="([^"]+)"[^>]*eventlist-title-link[^>]*>([\s\S]*?)<\/a>/i)
      const date = match(fragment, /<time class="event-date" datetime="(\d{4}-\d{2}-\d{2})"/i)
      if (!path || !date) return null

      const imageUrl = match(fragment, /<img[^>]*data-src="([^"]+)"/i)
      const imageAlt = match(fragment, /<img[^>]*alt="([^"]*)"/i)
      const venue = match(fragment, /eventlist-meta-address[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)
      const description = match(fragment, /<div class="eventlist-description">([\s\S]*?)<a href="[^"]+" class="eventlist-button/i)

      return {
        id: path[1],
        title: textFromHtml(path[2]),
        date: date[1],
        ...(venue ? {venue: textFromHtml(venue[1])} : {}),
        ...(description ? {description: textFromHtml(description[1])} : {}),
        ...(imageUrl?.[1]?.startsWith(SQUARESPACE_IMAGE_ORIGIN) ? {imageUrl: imageUrl[1]} : {}),
        ...(imageAlt ? {imageAlt: decodeEntities(imageAlt[1])} : {}),
        url: new URL(path[1], LIONS_GATE_ORIGIN).toString(),
      }
    })
    .filter((event): event is LionsGateCalendarEvent => event !== null)
}

function match(input: string, expression: RegExp): RegExpMatchArray | null {
  return input.match(expression)
}

function textFromHtml(input: string): string {
  return decodeEntities(input
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/?p[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim())
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number(value)))
    .replace(/&#x([\da-f]+);/gi, (_, value: string) => String.fromCodePoint(parseInt(value, 16)))
}
