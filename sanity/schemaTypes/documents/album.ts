import { defineField, defineType } from "sanity";
import AddRecordingsByWork from "@/sanity/components/AddMusicTool/components/AddRecordingWorkflow/AddRecordingsByWork/AddRecordingsByWork";

export default defineType({
  name: "album",
  title: "Albums",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "artist",
      title: "Artist",
      description: "The performer or recording artist.",
      type: "string",
      initialValue: "Katie Lansdale",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "yearReleased",
      title: "Year Released",
      type: "number",
    }),

    defineField({
      name: "coverArt",
      title: "Cover Art",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "recordings",
      title: "Recordings",
      description:
        "Recordings included on this album, in performance order.",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "recording" }],
        },
      ],
      components: {
        input: AddRecordingsByWork,
      },
      validation: (Rule) => Rule.min(1),
    }),
  ],

  preview: {
    select: {
      title: "title",
      artist: "artist",
      yearReleased: "yearReleased",
      media: "coverArt",
    },
    prepare({ title, artist, yearReleased, media }) {
      return {
        title,
        subtitle: `${artist}${yearReleased ? ` — ${yearReleased}` : ""}`,
        media,
      };
    },
  },
});