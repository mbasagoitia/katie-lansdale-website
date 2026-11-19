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
    defineField({name: "expirationDate", title: "Expiration", description: "Choose a date and time to unlist this news item from your website. The default expiration is 10pm on the news date.", type: "date", hidden: ({parent}) => parent?.doNotExpire, components: {input: ExpirationDateInput}}),
    defineField({name: "doNotExpire", title: "Do not automatically remove", type: "boolean", initialValue: false}),
  ],
  preview: {select: {title: "title", subtitle: "date", media: "image"}},
})
