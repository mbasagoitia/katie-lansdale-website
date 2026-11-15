import {CalendarIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export default defineType({
  name: "highlightedEvent",
  title: "Highlighted Events",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({name: "title", title: "Event title", type: "string", validation: (Rule) => Rule.required()}),
    defineField({
      name: "startDate",
      title: "Start date",
      description: "Required to organize this listing under a month. For an approximate date, choose the best estimate and use Display date text to explain.",
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
      title: "Event end date",
      description: "Optional. Keep multi-day events to one month or less. By default, the listing automatically expires at 10 PM Eastern on this date; if no end date is supplied, it expires at 10 PM Eastern on the start date.",
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
      type: "string",
      initialValue: "eventEnd",
      options: {
        layout: "radio",
        list: [
          {title: "Default: 10 PM Eastern on the end date (or start date)", value: "eventEnd"},
          {title: "At a specific date and time", value: "custom"},
          {title: "Never automatically remove", value: "never"},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "expiresAt",
      title: "Keep on website through",
      description: "Required only when “At a specific date and time” is selected.",
      type: "datetime",
      hidden: ({parent}) => parent?.expirationMode !== "custom",
      validation: (Rule) => Rule.custom((value, context) => {
        const parent = context.parent as {expirationMode?: string} | undefined
        return parent?.expirationMode !== "custom" || value ? true : "Choose a date and time, or select a different automatic-expiration option."
      }),
    }),
    defineField({
      name: "startsAt",
      title: "Event date and time (legacy)",
      description: "This field is retained for older listings. Use Start date and Start time for new listings.",
      type: "datetime",
      readOnly: true,
      hidden: ({value}) => value === undefined,
      deprecated: {reason: "Use Start date and optional Start time instead."},
    }),
  ],
  preview: {select: {title: "title", subtitle: "startDate", media: "image"}},
})
