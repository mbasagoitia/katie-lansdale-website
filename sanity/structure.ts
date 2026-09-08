import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([

      S.documentTypeListItem("composer"),

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
    ]);