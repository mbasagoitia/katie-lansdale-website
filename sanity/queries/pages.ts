import {groq} from "next-sanity"

export const pageByIdQuery = groq`
  *[_id == $id][0]{
    _id,
    title,
    excerpt,
    heroImage,
    content[]{
      ...,
      _type == "image" => {..., asset->{_id, url, metadata {dimensions}}}
    },
    gallery[]{_key, alt, asset->{_id, url, metadata {dimensions}}},
    quotes[]{_key, quote, attribution},
    featuredIn[]{_key, name, url, image{alt, asset->{_id, url, metadata {dimensions}}}},
    seoTitle,
    seoDescription
  }
`

export const siteSettingsQuery = groq`
  *[_id == "site-settings"][0]{siteTitle, tagline, copyright}
`
