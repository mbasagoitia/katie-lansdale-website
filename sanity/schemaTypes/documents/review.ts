import {DocumentTextIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export default defineType({
  name: "review",
  title: "Review",
  type: "document",
  icon: DocumentTextIcon,
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({name: "quote", title: "Quote", type: "text", rows: 5, validation: (Rule) => Rule.required()}),
    defineField({name: "attribution", title: "Attribution", description: "For example: Boston Globe, or Boston Globe — review of the Tanglewood Festival of Contemporary Music.", type: "string", validation: (Rule) => Rule.required()}),
    defineField({name: "sourceKey", title: "Migration source key", type: "string", hidden: true, readOnly: true}),
  ],
  preview: {
    select: {title: "quote", subtitle: "attribution"},
    prepare({title, subtitle}) {
      return {title: title || "Untitled review", subtitle}
    },
  },
})
