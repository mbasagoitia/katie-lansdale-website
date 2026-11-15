import {CalendarIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export default defineType({
  name: "highlightedEvent",
  title: "Highlighted Events",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({name: "title", title: "Event title", type: "string", validation: (Rule) => Rule.required()}),
    defineField({name: "startsAt", title: "Event date and time", description: "Choose the date and starting time for this performance or event.", type: "datetime", validation: (Rule) => Rule.required()}),
    defineField({name: "description", title: "Description", type: "text", rows: 5, validation: (Rule) => Rule.required()}),
    defineField({name: "location", title: "Venue and location", type: "string"}),
    defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
    defineField({name: "linkUrl", title: "Link", description: "Optional full URL. When set, the title links there.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
    defineField({name: "expiresAt", title: "Keep on website through", description: "Optional. If blank, the listing automatically disappears at 10 PM Eastern on the event date. Set a different date and time to override that default.", type: "datetime"}),
  ],
  preview: {select: {title: "title", subtitle: "startsAt", media: "image"}},
})
