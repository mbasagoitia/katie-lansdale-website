import { defineQuery, groq } from "next-sanity";

const productProjection = groq`
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
    composer->{name},
    movements[]{_key, number, title}
  },

  recordings[]->{
    _id,
    title,
    artist,
    yearReleased,
    duration,
    movementNumber,
    mediaType,
    previewAudio,
    previewVideo,
    coverArt,
    work->{
      _id,
      title,
      subtitle,
      catalogNumber,
      arrangedBy,
      composer->{name},
      movements[]{_key, number, title}
    }
  }
`;

export const allProductsQuery = defineQuery(groq`
*[_type == "product" && availableForPurchase == true] | order(productKind asc, title asc) {
  ${productProjection}
}
`);

export const productBySlugQuery = defineQuery(groq`
*[_type == "product" && availableForPurchase == true && slug.current == $slug][0] {
  ${productProjection}
}
`);
