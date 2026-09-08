import { defineField, defineType } from "sanity";

export default defineType({
  name: "recording",
  title: "Recordings",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Recording Title",
      description: "Example: Grave or Toccata and Fugue",
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
      description:
        "The year this recording was released. If this recording is part of an album, use the album's release year.",
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
      name: "work",
      title: "Work",
      description: "The musical work being performed.",
      type: "reference",
      to: [{ type: "work" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "movementNumber",
      title: "Movement Number",
      description:
        "Leave blank if this recording is the entire work.",
      type: "number",
    }),

    defineField({
      name: "duration",
      title: "Duration",
      description: "Example: 3:57",
      type: "string",
    }),

    defineField({
      name: "mediaType",
      title: "Media Type",
      description: "Choose whether this recording is audio or video.",
      type: "string",
      options: {
        list: [
          { title: "Audio", value: "audio" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "audio",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "previewAudio",
      title: "Preview Audio Path",
      description: "Public Supabase path for the audio preview.",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "audio",
    }),

    defineField({
      name: "fullAudio",
      title: "Full Audio Path",
      description: "Private Supabase path for the full recording.",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "audio",
    }),

    defineField({
      name: "previewVideo",
      title: "Preview Video Path",
      description: "Public Supabase path for the video preview.",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),

    defineField({
      name: "fullVideo",
      title: "Full Video Path",
      description: "Private Supabase path for the full recording.",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
  ],

  preview: {
    select: {
      title: "title",
      artist: "artist",
      yearReleased: "yearReleased",
      work: "work.title",
      media: "coverArt",
    },
    prepare({ title, artist, yearReleased, work, media }) {
      const details = [
        artist,
        yearReleased,
        work,
      ]
        .filter(Boolean)
        .join(" — ");

      return {
        title,
        subtitle: details,
        media,
      };
    },
  },
});