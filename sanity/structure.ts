import {CogIcon, DocumentIcon} from "@sanity/icons";
import type {StructureResolver} from "sanity/structure";
import {sitePages} from "./sitePages";

const singletonTypes = ["page", "siteSettings"];

function pageItem(S: Parameters<StructureResolver>[0], page: (typeof sitePages)[number]) {
  return S.listItem()
    .id(page.id)
    .title(page.title)
    .icon(DocumentIcon)
    .child(S.document().schemaType("page").documentId(page.id).title(page.title));
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website Content")
    .items([
      S.listItem()
        .title("Global Settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("site-settings").title("Global Settings")),
      S.divider(),
      S.listItem()
        .title("Website Pages")
        .icon(DocumentIcon)
        .child(S.list().title("Website Pages").items(sitePages.map((page) => pageItem(S, page)))),
      S.divider(),
      S.documentTypeListItem("composer").title("Composers"),

    S.listItem()
      .title("Works")
      .child(
        S.documentTypeList("composer")
          .title("Composers")
          .child((composerId) =>
            S.documentList()
              .title("Works")
              .filter('_type == "work" && composer._ref == $composerId')
              .params({ composerId })
          )
      ),

      S.listItem()
        .title("Recordings")
        .child(
          S.documentTypeList("composer")
            .title("Composers")
            .child((composerId) =>

              S.documentList()
                .title("Works")
                .filter(
                  '_type == "work" && composer._ref == $composerId'
                )
                .params({ composerId })

                .child((workId) =>

                  S.documentList()
                    .title("Recordings")
                    .filter(
                      '_type == "recording" && work._ref == $workId'
                    )
                    .params({ workId })

                )
            )
        ),
      S.documentTypeListItem("album"),
      S.divider(),
      S.documentTypeListItem("product"),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !singletonTypes.includes(item.getId() || "") && !["composer", "work", "recording", "album", "product"].includes(item.getId() || "")),
    ]);
