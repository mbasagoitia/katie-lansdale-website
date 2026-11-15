import {DocumentIcon} from "@sanity/icons";
import {defineArrayMember, defineField, defineType} from "sanity";
import {getSitePageById} from "../../sitePages";

const isNotLionsGateTrioPage = (documentId?: string) => documentId !== "page-lions-gate-trio";
const isNotAboutPage = (documentId?: string) => documentId !== "page-about";
const hasPrimaryImage = (documentId?: string) => documentId === "page-about" || documentId === "page-lions-gate-trio";
const isHomePage = (documentId?: string) => documentId === "page-home";
const isNotHomePage = (documentId?: string) => documentId !== "page-home";
const isWatchListenPage = (documentId?: string) => documentId === "page-watch-listen";
const isProjectsPage = (documentId?: string) => documentId === "page-projects-and-affiliations";
const isDonationsPage = (documentId?: string) => documentId === "page-donations";
const isPublicationsPage = (documentId?: string) => documentId === "page-publications";
const isPhotosPressKitPage = (documentId?: string) => documentId === "page-photos-press-kit";

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
      description: "Used for this page's navigation label, visible page heading where the design includes one, and default browser/search title. The page URL remains unchanged.",
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
      title: "Primary image",
      description: "Upload the portrait for About or the hero image for Lions Gate Trio. Replace it by uploading another image, or use the Remove control to return to the default image.",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      hidden: ({document}) => !hasPrimaryImage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "excerpt",
      title: "Intro / excerpt",
      description: "On the About page, this is the tagline shown before the first biography paragraph. On other pages, it can be used as a short public-facing summary. It is separate from the SEO Description.",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "aboutIntroduction",
      title: "About Introduction",
      description: "The opening biography paragraph beside Katie's portrait on the About page.",
      type: "array",
      hidden: ({document}) => isNotAboutPage(document?._id?.replace(/^drafts\./, "")),
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
          defineField({name: "details", title: "Expanded description", description: "Optional longer description shown when a visitor opens this project card.", type: "text", rows: 7}),
          defineField({name: "imageUrl", title: "Image URL", type: "url", description: "Optional image shown on the card. You may use a full image URL or a local path beginning with /images/.", validation: (Rule) => Rule.uri({scheme: ["http", "https"], allowRelative: true})}),
          defineField({name: "imagePosition", title: "Image focal point", description: "Optional CSS position for the card crop, for example: left center, center, or right center.", type: "string"}),
          defineField({name: "linkUrl", title: "Website or event link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "linkLabel", title: "Link label", type: "string", initialValue: "Learn more"}),
        ],
        preview: {select: {title: "title", subtitle: "category"}},
      })],
      validation: (Rule) => Rule.max(6),
    }),

    defineField({
      name: "donationOptions",
      title: "Ways to Donate",
      description: "Add each organization or fund visitors can support. A QR code is generated automatically from the donation link; upload a custom code only if you prefer one.",
      type: "array",
      hidden: ({document}) => !isDonationsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Fund or project name", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "organization", title: "Organization", type: "string"}),
          defineField({name: "description", title: "Description", type: "text", rows: 4}),
          defineField({name: "donationUrl", title: "Donation link", description: "Paste the full donation-page URL. Leave blank until the fund is ready to receive gifts.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "linkLabel", title: "Donation button label", type: "string", initialValue: "Donate online"}),
          defineField({name: "qrCode", title: "Custom QR code (optional)", description: "If blank, the website automatically creates a scannable QR code from the donation link.", type: "image", options: {hotspot: false}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
        ],
        preview: {select: {title: "title", subtitle: "organization", media: "qrCode"}},
      })],
      validation: (Rule) => Rule.max(4),
    }),

    defineField({
      name: "publications",
      title: "Published Writing",
      description: "List articles and other published work. These entries are presented as citations, not links.",
      type: "array",
      hidden: ({document}) => !isPublicationsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Article title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "publication", title: "Publication", type: "string"}),
          defineField({name: "date", title: "Issue date or year", type: "string"}),
          defineField({name: "subtitle", title: "Subtitle", type: "string"}),
          defineField({name: "collaborators", title: "Byline or collaborators", type: "string"}),
          defineField({name: "description", title: "Short description (optional)", type: "text", rows: 3}),
        ],
        preview: {select: {title: "title", subtitle: "publication"}},
      })],
      validation: (Rule) => Rule.max(20),
    }),

    defineField({
      name: "presentations",
      title: "Presentations",
      description: "List lectures, workshops, and conference presentations.",
      type: "array",
      hidden: ({document}) => !isPublicationsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Presentation title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "event", title: "Event or institution", type: "string"}),
          defineField({name: "date", title: "Date or year", type: "string"}),
          defineField({name: "description", title: "Notes (optional)", type: "text", rows: 3}),
        ],
        preview: {select: {title: "title", subtitle: "event"}},
      })],
      validation: (Rule) => Rule.max(20),
    }),

    defineField({
      name: "honors",
      title: "Honors & Awards",
      description: "List distinctions and awards relevant to Katie’s artistic work.",
      type: "array",
      hidden: ({document}) => !isPublicationsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Honor or award", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "organization", title: "Presenting organization", type: "string"}),
          defineField({name: "date", title: "Date or year", type: "string"}),
          defineField({name: "description", title: "Description (optional)", type: "text", rows: 3}),
        ],
        preview: {select: {title: "title", subtitle: "organization"}},
      })],
      validation: (Rule) => Rule.max(12),
    }),

    defineField({
      name: "pressKitShortBio",
      title: "Short Bio",
      description: "A concise biography for presenters, programs, and media listings.",
      type: "text",
      rows: 5,
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "pressKitLongBio",
      title: "Long Bio",
      description: "A full biography for concert presenters and press materials.",
      type: "array",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "block",
        styles: [{title: "Normal", value: "normal"}],
      })],
    }),

    defineField({
      name: "pressKitPhotos",
      title: "Press Photos",
      description: "Approved color and black-and-white press photos. Visitors can open a larger view from the website.",
      type: "array",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})], validation: (Rule) => Rule.required()}),
          defineField({name: "label", title: "Photo label", type: "string", description: "For example: Headshot 1 — color."}),
        ],
        preview: {select: {title: "label", media: "image"}},
      })],
      validation: (Rule) => Rule.max(12),
    }),

    defineField({
      name: "selectedReviews",
      title: "Selected reviews",
      description: "Choose exactly three reviews from the Reviews list to feature on this page. Their wording is edited in Reviews, not here.",
      type: "array",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({type: "reference", to: [{type: "review"}]})],
      validation: (Rule) => Rule.required().length(3).unique(),
    }),

    defineField({
      name: "pressKitContactLabel",
      title: "Get in touch label",
      type: "string",
      initialValue: "For presenters & media",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "pressKitContactHeading",
      title: "Get in touch heading",
      type: "string",
      initialValue: "Get in touch",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "pressKitContactLinkLabel",
      title: "Contact link label",
      type: "string",
      initialValue: "Contact",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "pressKitContactDescription",
      title: "Get in touch description",
      type: "text",
      rows: 4,
      initialValue: "For booking, interview requests, additional materials, or permission to use press images, please get in touch.",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "reviews",
      title: "Reviews in display order",
      description: "Choose reviews from the Reviews list and drag them into the order they should appear on the Reviews page.",
      type: "array",
      hidden: ({document}) => document?._id?.replace(/^drafts\./, "") !== "page-reviews",
      of: [defineArrayMember({type: "reference", to: [{type: "review"}]})],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: "watchListenAlbums",
      title: "Album display order",
      description: "Choose the albums to feature and drag them into their website order. Create or edit albums, tracks, prices, and downloads in the Music Store tool; this list controls display only.",
      type: "array",
      hidden: ({document}) => !isWatchListenPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "reference",
        to: [{type: "product"}],
        options: {filter: "productKind == 'album'"},
      })],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: "watchListenSingles",
      title: "Singles display order",
      description: "Choose the standalone videos to feature and drag them into their website order. Create or edit music in the Music Store tool; this list controls display only.",
      type: "array",
      hidden: ({document}) => !isWatchListenPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "reference",
        to: [{type: "product"}],
      })],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: "gallery",
      title: "Photo Gallery",
      description: "Used on the homepage. Add any number of photos; they fade in one at a time, alternating left and right in this order.",
      type: "array",
      hidden: ({document}) => isNotHomePage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "image",
        options: {hotspot: true},
        fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      })],
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
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
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
      name: "trioAboutLabel",
      title: "About section label",
      type: "string",
      initialValue: "The Trio",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioAboutHeading",
      title: "About section heading",
      type: "string",
      initialValue: "A shared musical life",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioStatement",
      title: "About section description",
      description: "The description beside the ‘A shared musical life’ heading.",
      type: "text",
      rows: 5,
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioQuote",
      title: "Featured Quote",
      type: "text",
      rows: 4,
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioQuoteAttribution",
      title: "Quote Attribution",
      type: "string",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioHighlight",
      title: "Current Highlight",
      description: "Feature one current release, project, or announcement.",
      type: "object",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
      fields: [
        defineField({name: "title", title: "Title", type: "string"}),
        defineField({name: "description", title: "Description", type: "text", rows: 4}),
        defineField({name: "image", title: "Image", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
        defineField({name: "linkLabel", title: "Link Label", type: "string"}),
        defineField({name: "linkUrl", title: "Link URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
      ],
    }),

    defineField({
      name: "trioHighlightLabel",
      title: "Current highlight label",
      type: "string",
      initialValue: "Current highlight",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioNewsLabel",
      title: "News section label",
      type: "string",
      initialValue: "News",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioNewsItems",
      title: "News items",
      description: "Add, edit, delete, or drag to reorder Lions Gate Trio news items.",
      type: "array",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "description", title: "Description", type: "text", rows: 5}),
          defineField({name: "image", title: "Image", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "linkLabel", title: "Link label", type: "string", initialValue: "Learn more"}),
          defineField({name: "linkUrl", title: "Link URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
        ],
        preview: {select: {title: "title", subtitle: "description", media: "image"}},
      })],
    }),

    defineField({
      name: "trioRecordings",
      title: "Selected Recordings",
      description: "Show a small, curated selection. For the complete discography, link to the Lions Gate Trio site.",
      type: "array",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "composer", title: "Composer", type: "string"}),
          defineField({name: "albumName", title: "Album name", type: "string"}),
          defineField({name: "subtitle", title: "Legacy subtitle", type: "string", hidden: ({value}) => value === undefined, deprecated: {reason: "Use Composer and Album name for new recordings."}}),
          defineField({name: "coverArt", title: "Cover Art", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "audioFile", title: "Audio file", description: "Upload an audio recording to play from this card.", type: "file", options: {accept: "audio/*"}}),
          defineField({name: "url", title: "Listen or Learn More URL", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "audioUrl", title: "Audio Recording URL (optional)", description: "Use this only for an externally hosted audio recording. Upload an Audio file for new recordings.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({name: "youtubeUrl", title: "YouTube Video URL (Legacy)", description: "Use Audio Recording URL for new selected recordings.", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]}), hidden: ({value}) => value === undefined, deprecated: {reason: "Selected recordings now use cover art and audio players."}}),
        ],
        preview: {select: {title: "title", subtitle: "composer", media: "coverArt"}},
      })],
      validation: (Rule) => Rule.max(5),
    }),

    defineField({
      name: "trioEvents",
      title: "Custom upcoming performances",
      description: "These appear alongside performances pulled from the Lions Gate Trio calendar. Add, edit, delete, or drag to reorder them here.",
      type: "array",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "date", title: "Date", type: "date", options: {dateFormat: "MMMM D, YYYY"}, validation: (Rule) => Rule.required()}),
          defineField({name: "title", title: "Performance Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "venue", title: "Venue", type: "string"}),
          defineField({name: "location", title: "Location", type: "string"}),
          defineField({name: "description", title: "Description", type: "text", rows: 4}),
          defineField({name: "image", title: "Image", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
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
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioListenLabel",
      title: "Listen section label",
      type: "string",
      initialValue: "Listen",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioListenHeading",
      title: "Listen section heading",
      type: "string",
      initialValue: "Selected recordings",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioListenLinkLabel",
      title: "Listen section link label",
      type: "string",
      initialValue: "Full discography",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioEventsLabel",
      title: "Performances section label",
      type: "string",
      initialValue: "On stage",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioEventsHeading",
      title: "Performances section heading",
      type: "string",
      initialValue: "Upcoming performances",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioEventsLinkLabel",
      title: "Performances section link label",
      type: "string",
      initialValue: "Full calendar",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioCtaText",
      title: "Bottom callout text",
      type: "text",
      rows: 3,
      initialValue: "For complete concert information, recordings, and news, visit the Lions Gate Trio official website.",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "trioCtaLinkLabel",
      title: "Bottom callout link label",
      type: "string",
      initialValue: "Visit LionsGateTrio.org",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "seoTitle",
      title: "SEO Title Override (optional)",
      description: "The title shown for this specific page in browser tabs and search results. Leave blank to use this page's Title.",
      type: "string",
    }),

    defineField({
      name: "seoDescription",
      title: "SEO Description Override (optional)",
      description: "A search-engine summary for this specific page. Leave blank to use the sitewide SEO Description from Global Settings.",
      type: "text",
      rows: 3,
    }),

  ],

  preview: {
    select: {
      title: "title",
      media: "heroImage",
    },
  },
});
