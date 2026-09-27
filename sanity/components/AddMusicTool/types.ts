export type Reference = {_type: "reference"; _ref: string}

export type Composer = {
  _id: string
  name: string
  sortName?: string
}

export type Movement = {number: number; title: string}

export type Work = {
  _id: string
  title: string
  catalogNumber?: string
  arrangedBy?: string
  composer?: Composer
  movements?: Movement[]
}

export type ComposerDraft = Omit<Composer, "_id">

export type WorkDraft = {
  title: string
  subtitle?: string
  catalogNumber?: string
  yearComposed?: number
  instrumentation?: string
  arrangedBy?: string
  composerId: string
  movements: Movement[]
}

export type RecordingDraft = {
  title: string
  artist: string
  yearReleased?: number
  movementNumber?: number
  duration?: string
  mediaType: "audio" | "video"
  previewAudio?: string
  fullAudio?: string
  previewVideo?: string
  fullVideo?: string
  coverArt?: unknown
}

export type AlbumDraft = {
  title: string
  artist: string
  yearReleased?: number
  coverArt?: unknown
}

export type SaleDraft = {
  title: string
  shortDescription?: string
  price: number
  deliveryTypes: Array<"digitalDownload" | "physicalCD">
}

export type CreatedMusic = {recordingIds: string[]; workId: string}

export type AlbumPiece = {workId: string; title: string; recordingIds: string[]}

export type MusicLibraryItem = {
  _id: string
  title: string
  artist: string
  yearReleased?: number
  movementNumber?: number
  work?: {title: string; composer?: Composer}
  isListed: boolean
  productTitles: string[]
}
