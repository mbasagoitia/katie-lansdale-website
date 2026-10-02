import {CogIcon} from "@sanity/icons";
import {defineField, defineType} from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  initialValue: {
    title: "Global Settings",
    siteTitle: "Katie Lansdale",
    tagline: "Violinist",
    copyright: "© 2026 Katie Lansdale. All rights reserved.",
    seoTitle: "Katie Lansdale | Violinist",
    seoDescription: "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
  },

  fields: [
    defineField({
      name: "title",
      title: "Document Title",
      type: "string",
      initialValue: "Global Settings",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),

    defineField({
      name: "favicon",
      title: "Favicon",
      description: "The small icon shown in browser tabs and bookmarks. Upload a simple square image for the clearest result.",
      type: "image",
    }),

    defineField({
      name: "backgroundImage",
      title: "Website Background Image",
      description: "The image behind the main content card on every page. Choose a wide, textured image that remains readable around the edges.",
      type: "image",
      options: {hotspot: true},
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
    }),

    defineField({
      name: "copyright",
      title: "Copyright Text",
      type: "string",
    }),

    defineField({
      name: "seoTitle",
      title: "SEO Title",
      description: "The sitewide title shown in search results and browser tabs. It should name Katie and identify her work as a violinist.",
      type: "string",
    }),

    defineField({
      name: "seoDescription",
      title: "SEO Description",
      description: "The sitewide search-engine summary. Unlike a page Excerpt, this is written to encourage a searcher to visit the website.",
      type: "text",
      rows: 3,
    }),
  ],

  preview: {
    prepare() {
      return {
        title: "Site Settings",
      };
    },
  },
});
