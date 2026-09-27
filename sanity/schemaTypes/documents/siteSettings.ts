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
      name: "copyright",
      title: "Copyright Text",
      type: "string",
    })
  ],

  preview: {
    prepare() {
      return {
        title: "Site Settings",
      };
    },
  },
});
