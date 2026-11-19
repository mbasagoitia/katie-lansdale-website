import {DocumentIcon} from "@sanity/icons";
import {defineArrayMember, defineField, defineType} from "sanity";
import {getSitePageById} from "../../sitePages";
import SelectedReviewsInput from "../../components/SelectedReviewsInput";
import ExpirationDateInput from "../../components/ExpirationDateInput";

const isNotLionsGateTrioPage = (documentId?: string) => documentId !== "page-lions-gate-trio";
const isNotAboutPage = (documentId?: string) => documentId !== "page-about";
const hasPrimaryImage = (documentId?: string) => documentId === "page-about" || documentId === "page-lions-gate-trio";
const isNotHomePage = (documentId?: string) => documentId !== "page-home";
const isWatchListenPage = (documentId?: string) => documentId === "page-watch-listen";
const isProjectsPage = (documentId?: string) => documentId === "page-projects-and-affiliations";
const isDonationsPage = (documentId?: string) => documentId === "page-donations";
const isPublicationsPage = (documentId?: string) => documentId === "page-publications";
const isPhotosPressKitPage = (documentId?: string) => documentId === "page-photos-press-kit";
const isNewsEventsPage = (documentId?: string) => documentId === "page-news-and-events";
const supportsExcerpt = (documentId?: string) => ["page-contact", "page-donations", "page-lions-gate-trio", "page-photos-press-kit"].includes(documentId || "");
const supportsContent = (documentId?: string) => ["page-about", "page-contact"].includes(documentId || "");

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
      description: "Used for the page's navigation label and visible page heading where applicable.",
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
      name: "aboutTagline",
      title: "Tagline",
      description: "Tagline shown before the first biography paragraph",
      type: "text",
      rows: 2,
      hidden: ({document}) => isNotAboutPage(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "excerpt",
      title: "Short public-facing summary",
      description: "A short summary used in select page layouts. It is separate from the SEO description.",
      type: "text",
      rows: 3,
      hidden: ({document}) => !supportsExcerpt(document?._id?.replace(/^drafts\./, "")),
    }),

    defineField({
      name: "aboutIntroduction",
      title: "About Introduction",
      description: "The opening biography paragraph shown beside the portrait",
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
      hidden: ({document}) => !supportsContent(document?._id?.replace(/^drafts\./, "")),
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
          defineField({name: "image", title: "Card image", description: "Upload or choose an image from the media library.", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "imagePosition", title: "Image focal point", description: "Optional CSS position for the card crop, for example: left center, center, or right center.", type: "string"}),
          defineField({
            name: "contentAction",
            title: "Card click behavior",
            description: "Choose either a website/event link or an expanded description. A link takes visitors away from the site; an expanded description opens a detail window. If neither is selected, the card is not clickable.",
            type: "string",
            options: {layout: "radio", list: [
              {title: "Open an expanded description", value: "details"},
              {title: "Open a website or event link", value: "link"},
              {title: "No click behavior", value: "none"},
            ]},
            initialValue: "none",
          }),
          defineField({
            name: "details",
            title: "Expanded description",
            description: "Required when ‘Open an expanded description’ is selected. This text appears in the detail window; it does not appear when a website/event link is selected.",
            type: "text",
            rows: 7,
            hidden: ({parent}) => (parent?.contentAction || (parent?.linkUrl ? "link" : parent?.details ? "details" : "none")) !== "details",
            validation: (Rule) => Rule.custom((value, context) => (context.parent as {contentAction?: string} | undefined)?.contentAction !== "details" || value ? true : "Add an expanded description, or choose a different card click behavior."),
          }),
          defineField({
            name: "linkUrl",
            title: "Website or event link",
            description: "Required when ‘Open a website or event link’ is selected. An expanded description does not display when a link is used.",
            type: "url",
            validation: (Rule) => Rule.uri({scheme: ["http", "https"]}).custom((value, context) => (context.parent as {contentAction?: string} | undefined)?.contentAction !== "link" || value ? true : "Add a link, or choose a different card click behavior."),
            hidden: ({parent}) => (parent?.contentAction || (parent?.linkUrl ? "link" : parent?.details ? "details" : "none")) !== "link",
          }),
          defineField({name: "linkLabel", title: "Link label", type: "string", initialValue: "Learn more", hidden: ({parent}) => (parent?.contentAction || (parent?.linkUrl ? "link" : parent?.details ? "details" : "none")) === "none"}),
          defineField({name: "imageUrl", title: "Legacy image URL", type: "url", hidden: () => true, readOnly: true, deprecated: {reason: "Use Card image instead."}}),
        ],
        preview: {select: {title: "title", subtitle: "category", media: "image"}},
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
      name: "contactImage",
      title: "Contact form image",
      description: "Upload or choose the image displayed to the left of the contact form.",
      type: "image",
      options: {hotspot: true},
      fields: [defineField({name: "alt", title: "Alternative text", type: "string"})],
      hidden: ({document}) => document?._id?.replace(/^drafts\./, "") !== "page-contact",
    }),

    defineField({
      name: "contactFormHeading",
      title: "Contact form heading",
      type: "string",
      initialValue: "Send a note",
      hidden: ({document}) => document?._id?.replace(/^drafts\./, "") !== "page-contact",
    }),

    defineField({
      name: "contactRecipientEmail",
      title: "Form destination email",
      description: "Private. Contact-form messages are delivered to this address; it is never displayed on the website.",
      type: "string",
      hidden: ({document}) => document?._id?.replace(/^drafts\./, "") !== "page-contact",
      validation: (Rule) => Rule.email(),
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
      description: "List distinctions and awards.",
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
      description: "Approved press photos",
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
      description: "Choose three reviews to feature on this page.",
      type: "array",
      hidden: ({document}) => !isPhotosPressKitPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({type: "reference", to: [{type: "review"}]})],
      components: {input: SelectedReviewsInput},
      validation: (Rule) => Rule.custom((value, context) => {
        const pageId = context.document?._id?.replace(/^drafts\./, "")

        // This field is shared by every page document, but only the Photos &
        // Press Kit page uses it. Hidden fields still run validation in Studio.
        if (!isPhotosPressKitPage(pageId)) return true

        if (!Array.isArray(value) || value.length !== 3) {
          return "Choose exactly three reviews."
        }

        const reviewIds = value
          .map((review) => typeof review === "object" && review ? (review as {_ref?: string})._ref : undefined)
          .filter((id): id is string => Boolean(id))

        return new Set(reviewIds).size === reviewIds.length || "Choose three different reviews."
      }),
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
      description: "Add, remove, or click and drag reviews to the list.",
      type: "array",
      hidden: ({document}) => document?._id?.replace(/^drafts\./, "") !== "page-reviews",
      of: [defineArrayMember({type: "reference", to: [{type: "review"}]})],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: "newsItems",
      title: "News Items",
      description: "Add, edit, reorder, or remove news items.",
      type: "array",
      hidden: ({document}) => !isNewsEventsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "date", title: "Date", type: "date", validation: (Rule) => Rule.required()}),
          defineField({name: "time", title: "Time (optional)", type: "string"}),
          defineField({name: "description", title: "Description", type: "text", rows: 4, validation: (Rule) => Rule.required()}),
          defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "linkUrl", title: "Link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({
            name: "expirationDate",
            title: "Expiration",
            description: "Choose a date and time to unlist this news item from your website. The default expiration is 10pm on the news date.",
            type: "date",
            hidden: ({parent}) => parent?.doNotExpire,
            components: {input: ExpirationDateInput},
          }),
          defineField({name: "doNotExpire", title: "Do not automatically remove", type: "boolean", initialValue: false}),
        ],
        preview: {select: {title: "title", subtitle: "date", media: "image"}},
      })],
    }),

    defineField({
      name: "highlightedEvents",
      title: "Highlighted Events",
      description: "Add, edit, reorder, or remove upcoming/highlighted events.",
      type: "array",
      hidden: ({document}) => !isNewsEventsPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "startDate", title: "Date/Start date", type: "date", validation: (Rule) => Rule.required()}),
          defineField({name: "startTime", title: "Time", description: "Optional. For example, 7:30 PM.", type: "string"}),
          defineField({name: "endDate", title: "End date (optional)", type: "date", validation: (Rule) => Rule.custom((value, context) => {
            const startDate = (context.parent as {startDate?: string} | undefined)?.startDate
            if (!value || !startDate) return true
            if (value < startDate) return "The end date must be on or after the start date."
            const days = (Date.parse(`${value}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000
            return days <= 31 || "Keep highlighted events to 31 days or fewer."
          })}),
          defineField({name: "dateDisplay", title: "Custom date display (optional)", description: "Use for an ambiguous or nonstandard date. This replaces the automatically formatted date on the website.", type: "string"}),
          defineField({name: "description", title: "Description", type: "text", rows: 4, validation: (Rule) => Rule.required()}),
          defineField({name: "location", title: "Location (optional)", type: "string"}),
          defineField({name: "image", title: "Photo", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "linkUrl", title: "Link", type: "url", validation: (Rule) => Rule.uri({scheme: ["http", "https"]})}),
          defineField({
            name: "expirationDate",
            title: "Expiration",
            description: "Choose a date and time to unlist this event from your website. The default expiration is 10pm on the event end date, if included.",
            type: "date",
            hidden: ({parent}) => parent?.doNotExpire,
            components: {input: ExpirationDateInput},
          }),
          defineField({name: "doNotExpire", title: "Do not automatically remove", type: "boolean", initialValue: false}),
        ],
        preview: {select: {title: "title", subtitle: "startDate", media: "image"}},
      })],
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
      description: "Add any number of photos to fade in and out",
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
      description: "Show a curated selection of Lions Gate Trio recordings",
      type: "array",
      hidden: ({document}) => isNotLionsGateTrioPage(document?._id?.replace(/^drafts\./, "")),
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required()}),
          defineField({name: "composer", title: "Composer", type: "string"}),
          defineField({name: "albumName", title: "Album name", type: "string"}),
          defineField({name: "coverArt", title: "Cover Art", type: "image", options: {hotspot: true}, fields: [defineField({name: "alt", title: "Alternative text", type: "string"})]}),
          defineField({name: "audioFile", title: "Audio file", description: "Upload an audio recording to play from this card.", type: "file", options: {accept: "audio/*"}}),
        ],
        preview: {select: {title: "title", subtitle: "composer", media: "coverArt"}},
      })],
      validation: (Rule) => Rule.custom((value, context) => {
        const pageId = context.document?._id?.replace(/^drafts\./, "")
        if (!isNotLionsGateTrioPage(pageId)) {
          return Array.isArray(value) && value.length === 3
            ? true
            : "Choose exactly three selected recordings."
        }

        return true
      }),
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
