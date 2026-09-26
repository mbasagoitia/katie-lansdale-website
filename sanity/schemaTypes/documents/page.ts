import {DocumentIcon} from "@sanity/icons";
import {defineArrayMember, defineField, defineType} from "sanity";
import {getSitePageById} from "../../sitePages";

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
