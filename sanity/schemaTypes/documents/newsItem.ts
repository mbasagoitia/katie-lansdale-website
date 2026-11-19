import {DocumentTextIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"
import ExpirationDateInput from "../../components/ExpirationDateInput"

export default defineType({
  name: "newsItem",
  title: "News",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
    defineField({name: "date", title: "Date", type: "date", validation: (Rule) => Rule.required()}),
    defineField({name: "time", title: "Time (optional)", type: "string"}),
    defineField({name: "description", title: "Description", type: "text", rows: 5, validation: (Rule) => Rule.required()}),
    defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
    defineField({name: "linkUrl", title: "Link", description: "Optional full URL. When set, the title links there.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
    defineField({name: "expirationMode", title: "Expiration", description: "Choose a date and time to unlist this news item from your website. The default expiration is 10pm on the news date.", type: "string", initialValue: "expire", options: {layout: "radio", list: [{title: "Expire", value: "expire"}, {title: "Do not automatically remove", value: "never"}]}}),
    defineField({name: "expirationDate", title: "Expiration date", type: "date", hidden: ({parent}) => parent?.expirationMode === "never", components: {input: ExpirationDateInput}}),
  ],
  preview: {select: {title: "title", subtitle: "date", media: "image"}},
})
