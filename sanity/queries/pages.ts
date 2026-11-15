import {groq} from "next-sanity"

export const pageByIdQuery = groq`
  *[_id == $id][0]{
    _id,
    title,
    excerpt,
    heroImage{alt, asset->{_id, url, metadata {dimensions}}},
    aboutIntroduction,
    content[]{
      ...,
      _type == "image" => {..., asset->{_id, url, metadata {dimensions}}}
    },
    gallery[]{_key, alt, asset->{_id, url, metadata {dimensions}}},
    quotes[]{_key, quote, attribution},
    featuredIn[]{_key, name, url, image{alt, asset->{_id, url, metadata {dimensions}}}},
    trioMembers[]{_key, name, instrument},
    trioAboutLabel,
    trioAboutHeading,
    trioStatement,
    trioQuote,
    trioQuoteAttribution,
    trioHighlight{title, description, image{alt, asset->{_id, url, metadata {dimensions}}}, linkLabel, linkUrl},
    trioHighlightLabel,
    trioNewsLabel,
    trioNewsItems[]{_key, title, description, image{alt, asset->{_id, url, metadata {dimensions}}}, linkUrl, linkLabel},
    trioNews,
    trioNewsHeading,
    trioNewsImage{alt, asset->{_id, url, metadata {dimensions}}},
    trioNewsLink,
    trioRecordings[]{_key, title, composer, albumName, subtitle, coverArt{alt, asset->{_id, url, metadata {dimensions}}}, coverArtUrl, url, audioUrl, audioFile{asset->{url}}, youtubeUrl},
    trioEvents[]{_key, date, title, venue, location, description, image{alt, asset->{_id, url, metadata {dimensions}}}, imageUrl, imageAlt, url},
    trioWebsiteUrl,
    trioListenLabel,
    trioListenHeading,
    trioListenLinkLabel,
    trioEventsLabel,
    trioEventsHeading,
    trioEventsLinkLabel,
    trioCtaText,
    trioCtaLinkLabel,
    projectCards[]{_key, title, category, description, details, contentAction, image{alt, asset->{_id, url, metadata {dimensions}}}, imageUrl, imagePosition, linkUrl, linkLabel},
    donationOptions[]{_key, title, organization, description, donationUrl, linkLabel, qrCode{alt, asset->{_id, url, metadata {dimensions}}}},
    contactImage{alt, asset->{_id, url, metadata {dimensions}}},
    contactFormHeading,
    publications[]{_key, title, publication, date, subtitle, collaborators, description},
    presentations[]{_key, title, event, date, description},
    honors[]{_key, title, organization, date, description},
    pressKitShortBio,
    pressKitLongBio,
    pressKitPhotos[]{_key, label, image{alt, asset->{_id, url, metadata {dimensions}}}},
    reviews[]->{_id, quote, attribution},
    selectedReviews[]->{_id, quote, attribution},
    pressKitContactLabel,
    pressKitContactHeading,
    pressKitContactLinkLabel,
    pressKitContactDescription,
    watchListenAlbums[]{_key, _ref},
    watchListenSingles[]{_key, _ref},
    seoTitle,
    seoDescription
  }
`

export const pageNavigationQuery = groq`
  *[_type == "page" && _id in $ids]{_id, title}
`

export const siteSettingsQuery = groq`
  *[_id == "site-settings"][0]{siteTitle, tagline, copyright, seoTitle, seoDescription, backgroundImage{alt, asset->{_id, url, metadata {dimensions}}}}
`
