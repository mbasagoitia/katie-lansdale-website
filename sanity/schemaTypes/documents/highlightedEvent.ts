import {CalendarIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"
import ExpirationDateInput from "../../components/ExpirationDateInput"

export default defineType({
  name: "highlightedEvent",
  title: "Highlighted Events",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({name: "title", title: "Event title", type: "string", validation: (Rule) => Rule.required()}),
    defineField({
      name: "startDate",
      title: "Date/Start date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start time",
      description: "Optional. For example, “2 PM” or “Time TBA.”",
      type: "string",
    }),
    defineField({
      name: "endDate",
      title: "End date (optional)",
      type: "date",
      validation: (Rule) => Rule.min(Rule.valueOfField("startDate")).custom((value, context) => {
        const startDate = (context.parent as {startDate?: string} | undefined)?.startDate
        if (!value || !startDate) return true
        const duration = new Date(`${value}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime()
        return duration <= 31 * 24 * 60 * 60 * 1000 || "Please use an end date no more than one month after the start date."
      }),
    }),
    defineField({
      name: "dateDisplay",
      title: "Display date text",
      description: "Optional. Replaces the formatted date and time on the site—for example, “Late February · Time TBA.”",
      type: "string",
    }),
    defineField({name: "description", title: "Description", type: "text", rows: 5, validation: (Rule) => Rule.required()}),
    defineField({name: "location", title: "Venue and location", type: "string"}),
    defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
    defineField({name: "linkUrl", title: "Link", description: "Optional full URL. When set, the title links there.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
    defineField({
      name: "expirationMode",
      title: "Expiration",
      description: "Choose a date and time to unlist this event from your website. The default expiration is 10pm on the event end date, if included.",
      type: "string",
      initialValue: "eventEnd",
      options: {
        layout: "radio",
        list: [
          {title: "At 10 PM on the event date", value: "eventEnd"},
          {title: "At 10 PM on another date", value: "custom"},
          {title: "Do not automatically remove", value: "never"},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "expirationDate",
      title: "Expiration date",
      type: "date",
      hidden: ({parent}) => parent?.expirationMode === "never",
      components: {input: ExpirationDateInput},
      validation: (Rule) => Rule.custom((value, context) => (context.parent as {expirationMode?: string} | undefined)?.expirationMode === "never" || value ? true : "Choose an expiration date, or select Do not automatically remove."),
    }),
  ],
  preview: {select: {title: "title", subtitle: "startDate", media: "image"}},
})
