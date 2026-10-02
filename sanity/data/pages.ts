import {client} from "@/sanity/lib/client"
import {pageByIdQuery, siteSettingsQuery} from "@/sanity/queries/pages"
import type {CmsPage, SiteSettings} from "@/types/page"

export async function getPageById(id: string): Promise<CmsPage | null> {
  return client.withConfig({useCdn: false}).fetch<CmsPage | null>(pageByIdQuery, {id})
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.withConfig({useCdn: false}).fetch<SiteSettings | null>(siteSettingsQuery)
}

export async function getPageMetadata(id: string) {
  const [page, settings] = await Promise.all([getPageById(id), getSiteSettings()])
  return {
    title: page?.seoTitle || settings?.seoTitle || "Katie Lansdale | Violinist",
    description: page?.seoDescription || settings?.seoDescription || "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
  }
}
