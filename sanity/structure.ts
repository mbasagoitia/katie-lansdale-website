import {CalendarIcon, CogIcon, DocumentIcon, DocumentTextIcon} from "@sanity/icons"
import type {StructureResolver} from "sanity/structure"
import {sitePages} from "./sitePages"

function pageItem(S: Parameters<StructureResolver>[0], page: (typeof sitePages)[number]) {
  return S.listItem().id(page.id).title(page.title).icon(DocumentIcon).child(S.document().schemaType("page").documentId(page.id).title(page.title))
}

export const structure: StructureResolver = (S) => S.list().title("Website Content").items([
  S.listItem().title("Global Settings").icon(CogIcon).child(S.document().schemaType("siteSettings").documentId("site-settings").title("Global Settings")),
  S.listItem().title("Website Pages").icon(DocumentIcon).child(S.list().title("Website Pages").items(sitePages.map((page) => pageItem(S, page)))),
  S.listItem().title("Reviews").icon(DocumentTextIcon).child(S.documentTypeList("review").title("Reviews")),
  S.listItem().title("News & Events").icon(CalendarIcon).child(S.list().title("News & Events").items([
    S.documentTypeListItem("newsItem").title("News"),
    S.documentTypeListItem("highlightedEvent").title("Highlighted Events"),
  ])),
])
