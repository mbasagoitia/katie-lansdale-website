import {useEffect, useState} from "react"
import {Button, Card, Flex, Stack, Text, TextInput} from "@sanity/ui"
import {useClient} from "sanity"
import {apiVersion} from "../../env"
import {AlbumForm, Choice, SaleForm} from "./components"
import {createAlbum, createAlbumProduct, listAlbumPieces} from "./services/music"
import type {AlbumDraft, AlbumPiece, SaleDraft, Work} from "./types"

type CatalogWork = Work & {recordings: {_id: string; title: string; movementNumber?: number}[]}
type Step = "intro" | "album" | "pieces" | "sale-question" | "sale" | "complete"

export default function CreateAlbumWorkflow({onCancel}: {onCancel: () => void}) {
  const client = useClient({apiVersion})
  const [step, setStep] = useState<Step>("intro")
  const [album, setAlbum] = useState<AlbumDraft>({title: "", artist: "Katie Lansdale"})
  const [pieces, setPieces] = useState<AlbumPiece[]>([])
  const [works, setWorks] = useState<CatalogWork[]>([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [term, setTerm] = useState("")
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [sale, setSale] = useState<SaleDraft>({title: "", price: 0, deliveryTypes: ["digitalDownload"]})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recordingIds = pieces.flatMap((piece) => piece.recordingIds)
  useEffect(() => { if (step === "pieces") void listAlbumPieces(client).then(setWorks).catch(() => setError("The music catalog could not be loaded. Please try again.")) }, [client, step])
  const uploadCoverArt = async (file: File) => { setError(null); try { const asset = await client.assets.upload("image", file); setAlbum((current) => ({...current, coverArt: {_type: "image", asset: {_type: "reference", _ref: asset._id}}})) } catch { setError("The album artwork could not be uploaded. Please try again.") } }
  const finishAlbum = async () => { if (!album.title.trim() || !recordingIds.length) return; setSaving(true); try { const created = await createAlbum(client, album, recordingIds); setAlbumId(created._id); setStep("sale-question") } catch { setError("The album could not be saved. Please try again.") } finally { setSaving(false) } }
  const saveSale = async () => { if (!albumId || !sale.title || sale.price < 0) return; setSaving(true); try { await createAlbumProduct(client, sale, albumId, recordingIds); setStep("complete") } catch { setError("The sale listing could not be saved. Please try again.") } finally { setSaving(false) } }
  const normalizedTerm = term.trim().toLocaleLowerCase()
  const filteredWorks = works.filter((work) => !normalizedTerm || [work.title, work.composer?.name].filter(Boolean).some((value) => value!.toLocaleLowerCase().includes(normalizedTerm)))
  const addPiece = (work: CatalogWork) => { setPieces([...pieces, {workId: work._id, title: work.title, recordingIds: work.recordings.map((recording) => recording._id)}]); setShowCatalog(false) }
  const back = () => { if (step === "intro") return onCancel(); setStep(({album: "intro", pieces: "album", "sale-question": "pieces", sale: "sale-question", complete: "sale-question"} as Partial<Record<Step, Step>>)[step] ?? "intro") }
  return <Card padding={5} radius={2} shadow={1}><Stack space={5}><Flex justify="space-between" align="center"><Text size={3} weight="semibold">{step === "sale" ? "List for sale" : "Create an album"}</Text><Flex gap={2}><Button text="Back" mode="bleed" onClick={back} /><Button text="Cancel" mode="bleed" onClick={onCancel} /></Flex></Flex>{error && <Card padding={3} tone="critical"><Text>{error}</Text></Card>}
    {step === "intro" && <Stack space={4}><Text size={3} weight="semibold">Create an album from music you have already uploaded</Text><Text>Use this tool to collect existing recordings into an album for presentation and/or sale. To upload a new recording, return to Add a recording.</Text><Button text="I understand — create an album" tone="primary" onClick={() => setStep("album")} /></Stack>}
    {step === "album" && <Stack space={4}><AlbumForm draft={album} onChange={setAlbum} onCoverArtSelected={uploadCoverArt} /><Button text="Choose pieces" tone="primary" disabled={!album.title.trim() || !album.artist.trim()} onClick={() => setStep("pieces")} /></Stack>}
    {step === "pieces" && <Stack space={4}><Text>Add pieces that you have uploaded to this album.</Text>{pieces.map((piece) => <Card key={piece.workId} padding={3} tone="transparent"><Flex justify="space-between" align="center"><Text>{piece.title}</Text><Button text="Remove" mode="bleed" tone="critical" onClick={() => setPieces(pieces.filter((item) => item.workId !== piece.workId))} /></Flex></Card>)}{showCatalog && <><TextInput placeholder="Filter by composer or work name" value={term} onChange={(event) => setTerm(event.currentTarget.value)} />{filteredWorks.filter((work) => work.recordings.length && !pieces.some((piece) => piece.workId === work._id)).map((work) => <Stack key={work._id} space={2}><Text size={2} weight="semibold">{work.composer?.name ?? "Unknown composer"}</Text><Choice title={work.title} description={work.recordings.map((recording) => recording.title).join(" — ")} onClick={() => addPiece(work)} /></Stack>)}</>}<Button text={pieces.length ? "Add another piece" : "Add a piece"} tone="primary" disabled={!filteredWorks.some((work) => work.recordings.length && !pieces.some((piece) => piece.workId === work._id))} onClick={() => setShowCatalog(true)} /><Button text="I’m finished" disabled={!pieces.length} loading={saving} onClick={finishAlbum} /></Stack>}
    {step === "sale-question" && <Stack space={4}><Text>Would you like to make this album available for purchase?</Text><Choice title="Set up for sale" description="Create a customer-facing listing now." onClick={() => {setSale({...sale, title: album.title}); setStep("sale")}} /><Choice title="Save for later" description="Keep the album in your library without a listing." onClick={() => setStep("complete")} /></Stack>}
    {step === "sale" && <Stack space={4}><SaleForm draft={sale} onChange={setSale} /><Button text="Create sale listing" tone="primary" loading={saving} disabled={!sale.title || sale.price < 0} onClick={saveSale} /></Stack>}
    {step === "complete" && <Stack space={4}><Text size={3} weight="semibold">Success — your album has been saved.</Text><Text>{albumId ? "Your album is ready for use." : ""}</Text><Button text="Return to Add Music" tone="primary" onClick={onCancel} /></Stack>}
  </Stack></Card>
}
