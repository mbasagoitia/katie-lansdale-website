import {DocumentTextIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export default defineType({
  name: "newsItem",
  title: "News",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
    defineField({name: "publishedAt", title: "News date and time", description: "Used to order news stories. Defaults to now.", type: "datetime", initialValue: () => new Date().toISOString(), validation: (Rule) => Rule.required()}),
    defineField({name: "description", title: "Description", type: "text", rows: 5, validation: (Rule) => Rule.required()}),
    defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
    defineField({name: "linkUrl", title: "Link", description: "Optional full URL. When set, the title links there.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
    defineField({name: "expiresAt", title: "Keep on website through", description: "Optional. Set a date and time to automatically remove this news story from the website.", type: "datetime"}),
  ],
  preview: {select: {title: "title", subtitle: "publishedAt", media: "image"}},
})
