import {CalendarIcon, CogIcon, DocumentIcon, DocumentTextIcon} from "@sanity/icons"
import type {StructureResolver} from "sanity/structure"
import {sitePages} from "./sitePages"

function pageItem(S: Parameters<StructureResolver>[0], page: (typeof sitePages)[number]) {
  return S.listItem().id(page.id).title(page.title).icon(DocumentIcon).child(S.document().schemaType("page").documentId(page.id).title(page.title))
}

export const structure: StructureResolver = (S) => S.list().title("Website Content").items([
  S.listItem().id("global-settings").title("Global Settings").icon(CogIcon).child(S.document().schemaType("siteSettings").documentId("site-settings").title("Global Settings")),
  S.listItem().id("website-pages").title("Website Pages").icon(DocumentIcon).child(S.list().id("website-pages-list").title("Website Pages").items(sitePages.map((page) => pageItem(S, page)))),
  S.listItem().id("reviews").title("Reviews").icon(DocumentTextIcon).child(S.documentTypeList("review").title("Reviews")),
  S.listItem().id("news-events").title("News & Events").icon(CalendarIcon).child(S.list().id("news-events-list").title("News & Events").items([
    S.documentTypeListItem("newsItem").title("News"),
    S.documentTypeListItem("highlightedEvent").title("Highlighted Events"),
  ])),
])
