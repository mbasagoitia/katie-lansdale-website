import { defineField, defineType } from "sanity";
import {FullAudioInput, FullVideoInput, PreviewAudioInput, PreviewVideoInput} from "../../components/RecordingMediaInput";

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
      description: "Inferred automatically from the uploaded media file.",
      type: "string",
      hidden: true,
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
      title: "Preview audio",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "audio",
      components: {input: PreviewAudioInput},
    }),

    defineField({
      name: "fullAudio",
      title: "Full audio",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "audio",
      components: {input: FullAudioInput},
    }),

    defineField({
      name: "previewVideo",
      title: "Preview video",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      components: {input: PreviewVideoInput},
    }),

    defineField({
      name: "fullVideo",
      title: "Full video",
      type: "string",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      components: {input: FullVideoInput},
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
