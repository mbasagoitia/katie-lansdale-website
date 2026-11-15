import { defineField, defineType } from "sanity";

type ProductKind =
  | "album"
  | "work"
  | "recording"
  | "bundle";

export default defineType({
  name: "product",
  title: "Products",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Product Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      validation: (Rule) => Rule.min(0).required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "productKind",
      title: "Product Kind",
      description:
        "What is the customer purchasing?",
      type: "string",
      options: {
        list: [
          { title: "Entire Album", value: "album" },
          { title: "Individual Work", value: "work" },
          { title: "Individual Recording", value: "recording" },
          { title: "Custom Collection", value: "bundle" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "type",
      title: "Product Type (Deprecated)",
      type: "string",
      readOnly: true,
      hidden: true,
      deprecated: {reason: "Use Delivery Options. This hidden field is kept for existing products."},
    }),

    defineField({
      name: "deliveryTypes",
      title: "Delivery Options",
      description: "Products are delivered as digital downloads.",
      type: "array",
      of: [{type: "string"}],
      options: {
        list: [
          {title: "Digital Download", value: "digitalDownload"},
        ],
      },
      validation: (Rule) => Rule.required().min(1).unique(),
    }),

    defineField({
      name: "availableForPurchase",
      title: "Available for Purchase",
      type: "boolean",
      initialValue: true,
    }),

    defineField({
      name: "album",
      title: "Album",
      description:
        "Optional reference to the album associated with this product.",
      type: "reference",
      to: [{ type: "album" }],
      hidden: ({ parent }) =>
        parent?.productKind !== "album",
    }),

    defineField({
      name: "work",
      title: "Work",
      description:
        "For a complete-piece product, select the work whose recordings this product includes.",
      type: "reference",
      to: [{ type: "work" }],
      hidden: ({ parent }) =>
        parent?.productKind !== "work",
    }),

    defineField({
      name: "recordings",
      title: "Recordings Included",
      description:
        "The specific recordings the customer receives after purchase.",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "recording" }],
        },
      ],
      validation: (Rule) =>
        Rule.required().min(1),
    }),
  ],

  preview: {
    select: {
      title: "title",
      productKind: "productKind",
      deliveryTypes: "deliveryTypes",
      type: "type",
      album: "album.title",
      work: "work.title",
      recordings: "recordings",
    },

  prepare({
    title,
    productKind,
    deliveryTypes,
    type,
    album,
    work,
    recordings,
  }: {
    title: string;
    productKind: ProductKind;
    deliveryTypes?: string[];
    type: string;
    album?: string;
    work?: string;
    recordings?: unknown[];
  }) {
      const productType = (deliveryTypes?.length
        ? deliveryTypes
        : type ? [type] : ["digitalDownload"])
        .map(() => "Digital Download")
        .join(" + ");

      const kindLabel = {
        album: "Album",
        work: "Work",
        recording: "Recording",
        bundle: "Collection",
      }[productKind] || "Product";

      const item =
        album ||
        work ||
        (recordings?.length
          ? `${recordings.length} recording${
              recordings.length === 1 ? "" : "s"
            }`
          : "No recordings selected");

      return {
        title,
        subtitle: `${kindLabel} — ${productType} — ${item}`,
      };
    },
  },
});
