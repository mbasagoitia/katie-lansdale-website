import type {SanityClient} from "sanity"
import type {AlbumDraft, ComposerDraft, RecordingDraft, SaleDraft, WorkDraft} from "../types"

const ref = (id: string) => ({_type: "reference" as const, _ref: id})

export async function searchComposers(client: SanityClient, term: string) {
  return client.fetch<{_id: string; name: string; sortName?: string}[]>(
    `*[_type == "composer" && (name match $term || sortName match $term)] | order(sortName asc, name asc)[0...20]{_id, name, sortName}`,
    {term: `*${term}*`},
  )
}

export async function listComposers(client: SanityClient) {
  return client.fetch<{_id: string; name: string; sortName?: string}[]>(
    `*[_type == "composer"] | order(coalesce(sortName, name) asc){_id, name, sortName}`,
  )
}

export async function searchWorks(client: SanityClient, term: string) {
  return client.fetch<import("../types").Work[]>(
    `*[_type == "work" && (title match $term || catalogNumber match $term)] | order(title asc)[0...20]{_id, title, catalogNumber, movements[]{number, title}, composer->{_id, name, sortName}}`,
    {term: `*${term}*`},
  )
}

export async function listWorks(client: SanityClient) {
  return client.fetch<import("../types").Work[]>(
    `*[_type == "work"] | order(composer->sortName asc, composer->name asc, title asc){_id, title, catalogNumber, movements[]{number, title}, composer->{_id, name, sortName}}`,
  )
}

export async function listAlbumPieces(client: SanityClient) {
  return client.fetch<(import("../types").Work & {recordings: {_id: string; title: string; movementNumber?: number}[]})[]>(
    `*[_type == "work"] | order(composer->sortName asc, composer->name asc, title asc){_id, title, catalogNumber, movements[]{number, title}, composer->{_id, name, sortName}, "recordings": *[_type == "recording" && work._ref == ^._id] | order(movementNumber asc, title asc){_id, title, movementNumber}}`,
  )
}

export async function listMusicLibrary(client: SanityClient) {
  return client.fetch<import("../types").MusicLibraryItem[]>(
    `*[_type == "recording"] | order(work->composer->sortName asc, work->composer->name asc, work->title asc, movementNumber asc, title asc){
      _id,
      title,
      artist,
      yearReleased,
      movementNumber,
      work->{title, composer->{_id, name, sortName}},
      "productTitles": *[_type == "product" && availableForPurchase == true && (references(^._id) || work._ref == ^.work._ref)].title
    } | order(count(productTitles) desc){
      ...,
      "isListed": count(productTitles) > 0
    }`,
  )
}

export async function createComposer(client: SanityClient, draft: ComposerDraft) {
  return client.create({_type: "composer", ...draft, sortName: draft.name})
}

export async function createWork(client: SanityClient, draft: WorkDraft) {
  const {composerId, movements, ...fields} = draft
  return client.create({_type: "work", ...fields, composer: ref(composerId), movements})
}

export async function updateWorkMovements(client: SanityClient, workId: string, movements: WorkDraft["movements"]) {
  return client.patch(workId).set({movements}).commit()
}

export async function createRecording(client: SanityClient, workId: string, draft: RecordingDraft) {
  return client.create({_type: "recording", ...draft, work: ref(workId)})
}

export async function createAlbum(client: SanityClient, draft: AlbumDraft, recordingIds: string[]) {
  return client.create({_type: "album", ...draft, recordings: recordingIds.map(ref)})
}

export async function createRecordingProduct(client: SanityClient, draft: SaleDraft, recordingIds: string[]) {
  return client.create({_type: "product", ...draft, type: draft.deliveryTypes[0], slug: {_type: "slug", current: toSlug(draft.title)}, productKind: "recording", availableForPurchase: true, recordings: recordingIds.map(ref)})
}

export async function createAlbumProduct(client: SanityClient, draft: SaleDraft, albumId: string, recordingIds: string[]) {
  return client.create({_type: "product", ...draft, type: draft.deliveryTypes[0], slug: {_type: "slug", current: toSlug(draft.title)}, productKind: "album", availableForPurchase: true, album: ref(albumId), recordings: recordingIds.map(ref)})
}

export async function createWorkProduct(client: SanityClient, draft: SaleDraft, workId: string, recordingIds: string[]) {
  return client.create({_type: "product", ...draft, type: draft.deliveryTypes[0], slug: {_type: "slug", current: toSlug(draft.title)}, productKind: "work", availableForPurchase: true, work: ref(workId), recordings: recordingIds.map(ref)})
}

function toSlug(title: string) {
  return title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}
