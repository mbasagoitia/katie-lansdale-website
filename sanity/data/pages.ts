import {client} from "@/sanity/lib/client"
import {pageByIdQuery, pageNavigationQuery, siteSettingsQuery} from "@/sanity/queries/pages"
import {sitePages, type SitePageId} from "@/sanity/sitePages"
import type {CmsPage, SiteSettings} from "@/types/page"

export async function getPageById(id: string): Promise<CmsPage | null> {
  return client.withConfig({useCdn: false}).fetch<CmsPage | null>(pageByIdQuery, {id})
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.withConfig({useCdn: false}).fetch<SiteSettings | null>(siteSettingsQuery)
}

export async function getNavigationLabels(): Promise<Partial<Record<SitePageId, string>>> {
  const pages = await client.withConfig({useCdn: false}).fetch<Array<{_id: string; title?: string}>>(pageNavigationQuery, {
    ids: sitePages.map((page) => page.id),
  })
  const titles = new Map(pages.map((page) => [page._id, page.title]))

  return Object.fromEntries(sitePages.flatMap((page) => {
    const title = titles.get(page.id)?.trim()
    return title ? [[page.id, title]] : []
  })) as Partial<Record<SitePageId, string>>
}

export async function getPageMetadata(id: string) {
  const [page, settings] = await Promise.all([getPageById(id), getSiteSettings()])
  return {
    title: page?.seoTitle || page?.title || settings?.seoTitle || "Katie Lansdale | Violinist",
    description: page?.seoDescription || settings?.seoDescription || "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
  }
}
