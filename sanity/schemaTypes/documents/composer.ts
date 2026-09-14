import { defineField, defineType } from "sanity";

export default defineType({
  name: "composer",
  title: "Composers",
  type: "document",

  fields: [

  defineField({
    name: "name",
    title: "Name",
    type: "string",
    validation: Rule => Rule.required()
  }),

  defineField({
    name: "sortName",
    title: "Sort Name",
    description:
    "Used for alphabetical sorting (e.g. 'Bach, Johann Sebastian').",
    type: "string",
  }),

  defineField({
    name: "birthYear",
    title: "Birth Year (Deprecated)",
    type: "number",
    readOnly: true,
    hidden: ({value}) => value === undefined,
    deprecated: {reason: "This information is no longer collected for new composers."},
  }),

  defineField({
    name: "deathYear",
    title: "Death Year (Deprecated)",
    type: "number",
    readOnly: true,
    hidden: ({value}) => value === undefined,
    deprecated: {reason: "This information is no longer collected for new composers."},
  }),

]
});
