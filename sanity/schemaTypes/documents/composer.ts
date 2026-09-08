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
    title: "Birth Year",
    type: "number"
  }),

  defineField({
    name: "deathYear",
    title: "Death Year",
    type: "number"
  }),

]
});