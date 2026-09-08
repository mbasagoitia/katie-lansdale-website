import { defineField, defineType } from "sanity";

export default defineType({
  name: "work",
  title: "Works",
  type: "document",
  

  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "The name of the work (e.g. Sonata No. 2 in A Minor).",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      description: "Optional subtitle or nickname.",
      type: "string",
    }),

    defineField({
      name: "catalogNumber",
      title: "Catalog Number",
      description: "Examples: BWV 1003, Op. 27 No. 2, K. 525",
      type: "string",
    }),

    defineField({
      name: "composer",
      title: "Composer",
      type: "reference",
      to: [{ type: "composer" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "yearComposed",
      title: "Year Composed",
      type: "number",
    }),

    defineField({
      name: "instrumentation",
      title: "Instrumentation",
      description: "Example: Solo Violin",
      type: "string",
    }),

    defineField({
      name: "movements",
      title: "Movements",
      description: "Add each movement in performance order.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "number",
              title: "Movement Number",
              type: "number",
            }),
            defineField({
              name: "title",
              title: "Movement Title",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "title",
              number: "number",
            },
            prepare({ title, number }) {
              return {
                title: `${number}. ${title}`,
              };
            },
          },
        },
      ],
    }),
  ],

preview: {
  select: {
    title: "title",
    composer: "composer.name",
  },
  prepare({ title, composer }) {
    return {
      title,
      subtitle: composer,
    };
  },
},
});