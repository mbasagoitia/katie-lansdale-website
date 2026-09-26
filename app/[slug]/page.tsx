import {notFound} from "next/navigation"
import PageContent from "@/components/cms/PageContent"
import {getPageById} from "@/sanity/data/pages"
import {getSitePageBySlug} from "@/sanity/sitePages"

export const revalidate = 60

export default async function CmsRoutePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const sitePage = getSitePageBySlug(slug)
  if (!sitePage) notFound()

  const page = await getPageById(sitePage.id)
  return <PageContent page={page} fallbackTitle={sitePage.title} fallbackExcerpt="This page is being prepared. Please check back soon." />
}
