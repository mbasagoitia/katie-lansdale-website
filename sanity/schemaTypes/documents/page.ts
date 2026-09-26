import {DocumentIcon} from "@sanity/icons";
import {defineArrayMember, defineField, defineType} from "sanity";
import {getSitePageById} from "../../sitePages";

const isLionsGateTrioPage = (documentId?: string) => documentId !== "page-lions-gate-trio";

export default defineType({
  name: "page",
  title: "Pages",
  type: "document",
  icon: DocumentIcon,
  initialValue: ({documentId}) => ({
    title: getSitePageById(documentId)?.title || "Untitled page",
  }),

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Legacy URL Slug",
      type: "slug",
      options: {
        source: "title",
      },
      description: "Website pages use their fixed route. This is kept only for older page documents.",
      hidden: ({value}) => value === undefined,
      readOnly: true,
      deprecated: {reason: "Website pages use fixed routes configured in the Studio."},
    }),

    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "Short summary used in previews and SEO.",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            {title: "Normal", value: "normal"},
            {title: "Heading 2", value: "h2"},
            {title: "Heading 3", value: "h3"},
          ],
        }),
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
        }),
      ],
    }),

    defineField({
      name: "gallery",
      title: "Photo Gallery",
      description: "Used on the homepage. Add up to two images for the fading photo display.",
      type: "array",
      of: [defineArrayMember({
        type: "image",
        options: {hotspot: true},
        fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      })],
      validation: (Rule) => Rule.max(2),
    }),

    defineField({
      name: "quotes",
      title: "Quotes",
      description: "Used on the homepage quote display.",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "quote", title: "Quote", type: "text", rows: 3, validation: (Rule) => Rule.required()}),
          defineField({name: "attribution", title: "Attribution", type: "string"}),
        ],
        preview: {select: {title: "quote", subtitle: "attribution"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "featuredIn",
      title: "Featured In",
      description: "Used on the homepage to display publication or organization logos.",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "image", title: "Logo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "url", title: "Link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "name", media: "image"}},
      })],
      validation: (Rule) => Rule.max(6),
    }),

    defineField({
      name: "trioMembers",
      title: "Trio Members",
      description: "Add the ensemble members in performance order.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "instrument", title: "Instrument", type: "string", validation: (Rule) => Rule.required()}),
        ],
        preview: {select: {title: "name", subtitle: "instrument"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "trioStatement",
      title: "About the Trio",
      description: "A short introduction to Katie's work with the Lions Gate Trio.",
      type: "text",
      rows: 5,
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioQuote",
      title: "Featured Quote",
      type: "text",
      rows: 4,
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioQuoteAttribution",
      title: "Quote Attribution",
      type: "string",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioHighlight",
      title: "Current Highlight",
      description: "Feature one current release, project, or announcement.",
      type: "object",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      fields: [
        defineField({name: "title", title: "Title", type: "string"}),
        defineField({name: "description", title: "Description", type: "text", rows: 4}),
        defineField({name: "image", title: "Image", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
        defineField({name: "linkLabel", title: "Link Label", type: "string"}),
        defineField({name: "linkUrl", title: "Link URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
      ],
    }),

    defineField({
      name: "trioNews",
      title: "News",
      description: "Optional wording override for the Lions Gate Trio news item. Leave blank to show the current item pulled from the official site.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "block",
        styles: [{title: "Normal", value: "normal"}],
      })],
    }),

    defineField({
      name: "trioNewsHeading",
      title: "News Heading Override",
      description: "Leave blank to use the heading pulled from the Lions Gate Trio site.",
      type: "string",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioNewsImage",
      title: "News Image Override",
      description: "Leave blank to use the image pulled from the Lions Gate Trio site.",
      type: "image",
      options: {hotspot: true},
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioNewsLink",
      title: "News Link Override",
      description: "Leave blank to use the link pulled from the Lions Gate Trio site.",
      type: "url",
      validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioRecordings",
      title: "Selected Recordings",
      description: "Show a small, curated selection. For the complete discography, link to the Lions Gate Trio site.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "subtitle", title: "Subtitle", type: "string"}),
          defineField({name: "coverArt", title: "Cover Art", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "url", title: "Listen or Learn More URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "youtubeUrl", title: "YouTube Video URL", description: "Paste a YouTube watch or share URL to display the performance on this page.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "title", subtitle: "subtitle", media: "coverArt"}},
      })],
      validation: (Rule) => Rule.max(5),
    }),

    defineField({
      name: "trioEvents",
      title: "Selected Upcoming Performances",
      description: "Keep this list to a few current performances and link to the trio's complete calendar.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "date", title: "Date", type: "date", options: {dateFormat: "MMMM D, YYYY"}, validation: (Rule) => Rule.required()}),
          defineField({name: "title", title: "Performance Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "venue", title: "Venue", type: "string"}),
          defineField({name: "location", title: "Location", type: "string"}),
          defineField({name: "url", title: "Event URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "title", subtitle: "date"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "trioWebsiteUrl",
      title: "Lions Gate Trio Website URL",
      type: "url",
      initialValue: "https://lionsgatetrio.org/",
      validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
    }),

    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "heroImage",
    },
  },
});
