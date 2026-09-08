export interface Product {
  _id: string;

  title: string;

  slug: {
    current: string;
  };

  shortDescription?: string;

  price: number;

  productKind: "album" | "work" | "recording" | "bundle";

  type: "digitalDownload" | "physicalCD";

  availableForPurchase: boolean;

  album?: {
    _id: string;
    title: string;
  };

  work?: {
    _id: string;
    title: string;
    subtitle?: string;
    catalogNumber?: string;
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
  }[];
}