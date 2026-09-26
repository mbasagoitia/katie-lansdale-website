export const sitePages = [
  {id: "page-home", title: "Home", path: "/"},
  {id: "page-about", title: "About", path: "/about"},
  {id: "page-media", title: "Media", path: "/media"},
  {id: "page-watch-listen", title: "Watch / Listen", path: "/watch-listen"},
  {id: "page-lions-gate-trio", title: "Lions Gate Trio", path: "/lions-gate-trio"},
  {id: "page-photos-press-kit", title: "Photos & Press Kit", path: "/photos-press-kit"},
  {id: "page-reviews", title: "Reviews", path: "/reviews"},
  {id: "page-publications", title: "Publications", path: "/publications"},
  {id: "page-news-and-events", title: "News & Events", path: "/news-and-events"},
  {id: "page-projects-and-affiliations", title: "Projects & Affiliations", path: "/projects-and-affiliations"},
  {id: "page-donations", title: "Donations", path: "/donations"},
  {id: "page-contact", title: "Contact", path: "/contact"},
] as const

export type SitePage = (typeof sitePages)[number]
export type SitePageId = SitePage["id"]

export function getSitePageById(id: string): SitePage | undefined {
  return sitePages.find((page) => page.id === id)
}

export function getSitePageBySlug(slug: string): SitePage | undefined {
  return sitePages.find((page) => page.path === `/${slug}`)
}
