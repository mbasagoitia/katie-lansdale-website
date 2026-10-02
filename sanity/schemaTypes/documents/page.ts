import {DocumentIcon} from "@sanity/icons";
import {defineArrayMember, defineField, defineType} from "sanity";
import {getSitePageById} from "../../sitePages";

const isLionsGateTrioPage = (documentId?: string) => documentId !== "page-lions-gate-trio";
const isAboutPage = (documentId?: string) => documentId !== "page-about";
const isNotAboutPage = (documentId?: string) => documentId !== "page-about";
const isHomePage = (documentId?: string) => documentId === "page-home";
const isNotHomePage = (documentId?: string) => documentId !== "page-home";
const isProjectsPage = (documentId?: string) => documentId === "page-projects-and-affiliations";

export default defineType({
  name: "page",
  title: "Pages",
  type: "document",
  icon: DocumentIcon,
  initialValue: ({documentId}) => {
    const pageId = documentId?.replace(/^drafts\./, "")
    return {
      title: getSitePageById(pageId)?.title || "Untitled page",
      ...(pageId === "page-home" ? {
        excerpt: "Official website of internationally acclaimed violinist Katie Lansdale—soloist, chamber musician, educator, and artistic leader.",
      } : {}),
    }
  },

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Legacy URL Slug",
      type: "slug",
      options: {
        source: "title",
      },
      description: "Website pages use their fixed route. This is kept only for older page documents.",
      hidden: ({value}) => value === undefined,
      readOnly: true,
      deprecated: {reason: "Website pages use fixed routes configured in the Studio."},
    }),

    defineField({
      name: "heroImage",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      hidden: ({document}) => isNotAboutPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "A short public-facing summary of this page. It may appear below the page title and in link previews; it is different from the SEO Description, which is written specifically for search-result snippets.",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "seoTitle",
      title: "SEO Title Override (optional)",
      description: "The title shown for this specific page in browser tabs and search results. Leave blank to use the sitewide SEO Title from Global Settings.",
      type: "string",
    }),

    defineField({
      name: "seoDescription",
      title: "SEO Description Override (optional)",
      description: "A search-engine summary for this specific page. Leave blank to use the sitewide SEO Description from Global Settings.",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "aboutIntroduction",
      title: "About Introduction",
      description: "The opening biography paragraph beside Katie's portrait on the About page.",
      type: "array",
      hidden: ({document}) => isAboutPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "block",
        styles: [{title: "Normal", value: "normal"}],
      })],
    }),

    defineField({
      name: "content",
      title: "Content",
      type: "array",
      hidden: ({document}) => isHomePage(document?._id?.replace(/^drafts\./, "")),
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            {title: "Normal", value: "normal"},
            {title: "Heading 2", value: "h2"},
            {title: "Heading 3", value: "h3"},
          ],
        }),
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
        }),
      ],
    }),

    defineField({
      name: "projectCards",
      title: "Projects & Affiliations",
      description: "Feature Katie's current ensembles, educational work, and artistic collaborations. These cards appear on the Projects & Affiliations page.",
      type: "array",
      hidden: ({document}) => !isProjectsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Project name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "category", title: "Category", type: "string", description: "For example: Ensemble, Workshop, or Festival."}),
          defineField({name: "description", title: "Description", type: "text", rows: 4, validation: (Rule) => Rule.required()}),
          defineField({name: "imageUrl", title: "Image URL", type: "url", description: "Optional image shown on the card. You may use a full image URL or a local path beginning with /images/.", validation: (Rule) => Rule.uri({scheme: ["http", "https"], allowRelative: true})}),
          defineField({name: "linkUrl", title: "Website or event link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "linkLabel", title: "Link label", type: "string", initialValue: "Learn more"}),
        ],
        preview: {select: {title: "title", subtitle: "category"}},
      })],
      validation: (Rule) => Rule.max(6),
    }),

    defineField({
      name: "gallery",
      title: "Photo Gallery",
      description: "Used on the homepage. Add up to two images for the fading photo display.",
      type: "array",
      hidden: ({document}) => isNotHomePage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "image",
        options: {hotspot: true},
        fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      })],
      validation: (Rule) => Rule.max(2),
    }),

    defineField({
      name: "quotes",
      title: "Quotes",
      description: "Used on the homepage quote display.",
      type: "array",
      hidden: ({document}) => isNotHomePage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "quote", title: "Quote", type: "text", rows: 3, validation: (Rule) => Rule.required()}),
          defineField({name: "attribution", title: "Attribution", type: "string"}),
        ],
        preview: {select: {title: "quote", subtitle: "attribution"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "featuredIn",
      title: "Featured In",
      description: "Used on the homepage to display publication or organization logos.",
      type: "array",
      hidden: ({document}) => isNotHomePage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "image", title: "Logo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "url", title: "Link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "name", media: "image"}},
      })],
      validation: (Rule) => Rule.max(6),
    }),

    defineField({
      name: "trioMembers",
      title: "Trio Members",
      description: "Add the ensemble members in performance order.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "instrument", title: "Instrument", type: "string", validation: (Rule) => Rule.required()}),
        ],
        preview: {select: {title: "name", subtitle: "instrument"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "trioStatement",
      title: "About the Trio",
      description: "A short introduction to Katie's work with the Lions Gate Trio.",
      type: "text",
      rows: 5,
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioQuote",
      title: "Featured Quote",
      type: "text",
      rows: 4,
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioQuoteAttribution",
      title: "Quote Attribution",
      type: "string",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioHighlight",
      title: "Current Highlight",
      description: "Feature one current release, project, or announcement.",
      type: "object",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      fields: [
        defineField({name: "title", title: "Title", type: "string"}),
        defineField({name: "description", title: "Description", type: "text", rows: 4}),
        defineField({name: "image", title: "Image", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
        defineField({name: "linkLabel", title: "Link Label", type: "string"}),
        defineField({name: "linkUrl", title: "Link URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
      ],
    }),

    defineField({
      name: "trioNews",
      title: "News",
      description: "Optional wording override for the Lions Gate Trio news item. Leave blank to show the current item pulled from the official site.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "block",
        styles: [{title: "Normal", value: "normal"}],
      })],
    }),

    defineField({
      name: "trioNewsHeading",
      title: "News Heading Override",
      description: "Leave blank to use the heading pulled from the Lions Gate Trio site.",
      type: "string",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioNewsImage",
      title: "News Image Override",
      description: "Leave blank to use the image pulled from the Lions Gate Trio site.",
      type: "image",
      options: {hotspot: true},
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioNewsLink",
      title: "News Link Override",
      description: "Leave blank to use the link pulled from the Lions Gate Trio site.",
      type: "url",
      validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

    defineField({
      name: "trioRecordings",
      title: "Selected Recordings",
      description: "Show a small, curated selection. For the complete discography, link to the Lions Gate Trio site.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "subtitle", title: "Subtitle", type: "string"}),
          defineField({name: "coverArt", title: "Cover Art", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "url", title: "Listen or Learn More URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "audioUrl", title: "Audio Recording URL", description: "Paste the direct URL of the audio recording played when this cover is selected.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "youtubeUrl", title: "YouTube Video URL (Legacy)", description: "Use Audio Recording URL for new selected recordings.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]}), hidden: ({value}) => value === undefined, deprecated: {reason: "Selected recordings now use cover art and audio players."}}),
        ],
        preview: {select: {title: "title", subtitle: "subtitle", media: "coverArt"}},
      })],
      validation: (Rule) => Rule.max(5),
    }),

    defineField({
      name: "trioEvents",
      title: "Selected Upcoming Performances",
      description: "Keep this list to a few current performances and link to the trio's complete calendar.",
      type: "array",
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "date", title: "Date", type: "date", options: {dateFormat: "MMMM D, YYYY"}, validation: (Rule) => Rule.required()}),
          defineField({name: "title", title: "Performance Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "venue", title: "Venue", type: "string"}),
          defineField({name: "location", title: "Location", type: "string"}),
          defineField({name: "url", title: "Event URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "title", subtitle: "date"}},
      })],
      validation: (Rule) => Rule.max(3),
    }),

    defineField({
      name: "trioWebsiteUrl",
      title: "Lions Gate Trio Website URL",
      type: "url",
      initialValue: "https://lionsgatetrio.org/",
      validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
      hidden: ({document}) => isLionsGateTrioPage(document?._id),
    }),

  ],

  preview: {
    select: {
      title: "title",
      media: "heroImage",
    },
  },
});
