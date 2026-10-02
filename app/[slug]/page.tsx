import {notFound} from "next/navigation"
import type {Metadata} from "next"
import PageContent from "@/components/cms/PageContent"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {getSitePageBySlug} from "@/sanity/sitePages"

export const revalidate = 60

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const sitePage = getSitePageBySlug(slug)
  return sitePage ? getPageMetadata(sitePage.id) : {}
}

export default async function CmsRoutePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const sitePage = getSitePageBySlug(slug)
  if (!sitePage) notFound()

  const page = await getPageById(sitePage.id)
  return <PageContent page={page} fallbackTitle={sitePage.title} fallbackExcerpt="This page is being prepared. Please check back soon." />
}
