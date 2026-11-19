import {CogIcon, DocumentIcon} from "@sanity/icons"
import type {StructureResolver} from "sanity/structure"
import {sitePages} from "./sitePages"

function pageItem(S: Parameters<StructureResolver>[0], page: (typeof sitePages)[number]) {
  return S.listItem()
    .id(`website-page-${page.id}`)
    .title(page.title)
    .icon(DocumentIcon)
    .child(S.document().id(`website-page-editor-${page.id}`).schemaType("page").documentId(page.id).title(page.title))
}

export const structure: StructureResolver = (S) => S.list().id("website-content-root").title("Website Content").items([
  S.listItem().id("global-settings").title("Global Settings").icon(CogIcon).child(S.document().id("global-settings-editor").schemaType("siteSettings").documentId("site-settings").title("Global Settings")),
  S.listItem().id("website-pages").title("Website Pages").icon(DocumentIcon).child(S.list().id("website-pages-list").title("Website Pages").items(sitePages.map((page) => pageItem(S, page)))),
])
