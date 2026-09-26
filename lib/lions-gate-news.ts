const HOME_URL = "https://lionsgatetrio.org/"
const SQUARESPACE_IMAGE_ORIGIN = "https://images.squarespace-cdn.com/"

export type LionsGateNewsItem = {
  heading: string
  body: string
  imageUrl?: string
  linkUrl?: string
}

export async function getLionsGateNews(): Promise<LionsGateNewsItem | null> {
  try {
    const response = await fetch(HOME_URL, {next: {revalidate: 3600}})
    if (!response.ok) return null

    const section = latestNewsSection(await response.text())
    if (!section) return null

    const imageUrl = section.match(/<img[^>]*data-src="([^"]+)"/i)?.[1]
    const sourceText = textFromHtml(section.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || "")
    const linkUrl = section.match(/<a href="([^"]*editionshortus[^\"]*)"/i)?.[1]
    if (!sourceText) return null

    if (/Lumi[eé]res/i.test(sourceText)) {
      return {
        heading: "Recently released: Lumiéres",
        body: "Lumiéres features music by Fauré, Saariaho, Höller, Iannotta, and Bertrand. The album is available on Spotify, Apple Music, Amazon Music, and through Editions Hortus.",
        ...(imageUrl?.startsWith(SQUARESPACE_IMAGE_ORIGIN) ? {imageUrl} : {}),
        ...(linkUrl ? {linkUrl} : {}),
      }
    }

    return {
      heading: "Latest news",
      body: sourceText,
      ...(imageUrl?.startsWith(SQUARESPACE_IMAGE_ORIGIN) ? {imageUrl} : {}),
      ...(linkUrl ? {linkUrl} : {}),
    }
  } catch {
    return null
  }
}

function latestNewsSection(html: string): string | null {
  const start = html.search(/<h2[^>]*>\s*<strong>Latest News<\/strong>\s*<\/h2>/i)
  if (start === -1) return null
  return html.slice(start, start + 12_000)
}

function textFromHtml(input: string): string {
  return decodeEntities(input
    .replace(/<br\s*\/?\s*>/gi, " ")
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
