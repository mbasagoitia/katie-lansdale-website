import { groq } from "next-sanity";

export const allProductsQuery = groq`
*[_type == "product" && availableForPurchase == true] | order(productKind asc, title asc) {
  _id,
  title,
  slug,
  shortDescription,
  price,
  productKind,
  deliveryTypes,
  type,
  availableForPurchase,
  "coverArt": coalesce(album->coverArt, recordings[0]->coverArt),
  album->{
    _id,
    title,
    artist,
    yearReleased,
    coverArt
  },
  work->{
    _id,
    title,
    subtitle,
    catalogNumber,
    arrangedBy,
    composer->{name}
  },

  recordings[]->{
    _id,
    title,
    artist,
    yearReleased,
    duration,
    mediaType,
    previewAudio,
    previewVideo,
    coverArt
  }
}
`;
