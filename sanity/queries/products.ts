import { groq } from "next-sanity";

export const allProductsQuery = groq`
*[_type == "product" && active == true] | order(title asc) {
  _id,
  title,
  slug,
  shortDescription,
  price,
  coverImage,

  recordings[]->{
    _id,
    title,
    duration,
    previewAudio,
    previewVideo
  }
}
`;