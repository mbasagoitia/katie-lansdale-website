export interface Product {
  _id: string;

  title: string;

  slug: {
    current: string;
  };

  shortDescription?: string;

  price: number;

  productKind: "album" | "work" | "recording" | "bundle";

  /** Legacy single delivery option retained for older products. */
  type?: "digitalDownload" | "physicalCD";

  deliveryTypes?: Array<"digitalDownload" | "physicalCD">;

  availableForPurchase: boolean;

  coverArt?: unknown;

  album?: {
    _id: string;
    title: string;
    artist?: string;
    yearReleased?: number;
    coverArt?: unknown;
  };

  work?: {
    _id: string;
    title: string;
    subtitle?: string;
    catalogNumber?: string;
    composer?: {
      name?: string;
    };
  };

  recordings: {
    _id: string;
    title: string;
    artist?: string;
    yearReleased?: number;
    duration?: string;
    mediaType: "audio" | "video";
    previewAudio?: string;
    previewVideo?: string;
    coverArt?: unknown;
  }[];
}
