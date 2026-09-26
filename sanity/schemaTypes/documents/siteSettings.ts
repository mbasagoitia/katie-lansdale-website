import {CogIcon} from "@sanity/icons";
import {defineField, defineType} from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  initialValue: {
    siteTitle: "Katie Lansdale",
    tagline: "Violinist",
    copyright: "© 2026 Katie Lansdale. All rights reserved.",
  },

  fields: [
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
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "favicon",
      title: "Favicon",
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
