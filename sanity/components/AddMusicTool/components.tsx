import {useRef, useState} from "react"
import type {ChangeEvent} from "react"
import {Button, Card, Flex, Grid, Stack, Text, TextInput} from "@sanity/ui"
import {generateRecordingPreview, uploadRecordingMedia} from "@/lib/supabase/storage"
import type {AlbumDraft, ComposerDraft, Movement, RecordingDraft, SaleDraft} from "./types"

export function Choice({title, description, onClick}: {title: string; description?: string; onClick: () => void}) { return <Card as="button" type="button" padding={4} radius={2} shadow={1} tone="primary" onClick={onClick} style={{textAlign: "left", cursor: "pointer"}}><Stack space={description ? 3 : 1}><Text size={3} weight="semibold">{title}</Text>{description && <Text size={2}>{description}</Text>}</Stack></Card> }
export function Field({label, value, onChange, type = "text", placeholder, required = false}: {label: string; value: string | number | undefined; onChange: (value: string) => void; type?: "text" | "number"; placeholder?: string; required?: boolean}) { return <Stack space={2}><Text size={1} weight="medium">{label}{required && " *"}</Text><TextInput type={type} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.currentTarget.value)} /></Stack> }

export function NewComposerForm({onSave, onBack}: {onSave: (draft: ComposerDraft) => Promise<void>; onBack: () => void}) { const [draft, setDraft] = useState<ComposerDraft>({name: ""}); const [saving, setSaving] = useState(false); const save = async () => { if (!draft.name.trim()) return; setSaving(true); await onSave({...draft, name: draft.name.trim()}); setSaving(false) }; return <Card padding={4} radius={2} shadow={1} tone="transparent"><Stack space={4}><Text size={2} weight="semibold">Add a new composer</Text><Field label="Composer name (last, first)" placeholder="Bach, Johann Sebastian" required value={draft.name} onChange={(name) => setDraft({...draft, name})} /><Flex gap={3}><Button text="Back" mode="ghost" onClick={onBack} /><Button text="Add composer" tone="primary" loading={saving} disabled={!draft.name.trim()} onClick={save} /></Flex></Stack></Card> }

export function MovementEditor({movements, onChange, firstPlaceholder = ""}: {movements: Movement[]; onChange: (movements: Movement[]) => void; firstPlaceholder?: string}) { return <Stack space={3}>{movements.map((movement, index) => <Flex key={movement.number} gap={3} align="center"><Text style={{minWidth: 82}}>Movement {index + 1}</Text><TextInput value={movement.title} placeholder={index === 0 ? firstPlaceholder : ""} onChange={(event) => onChange(movements.map((item, itemIndex) => itemIndex === index ? {...item, title: event.currentTarget.value} : item))} /><Button text="Remove" mode="bleed" tone="critical" onClick={() => onChange(movements.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({...item, number: itemIndex + 1})))} /></Flex>)}<Button text="+ Add another movement" mode="ghost" onClick={() => onChange([...movements, {number: movements.length + 1, title: ""}])} /></Stack> }

export function MediaFields({draft, onChange, sanityToken}: {draft: RecordingDraft; onChange: (draft: RecordingDraft) => void; sanityToken?: string}) {
  const previewInput = useRef<HTMLInputElement>(null)
  const fullInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<"preview" | "full" | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const upload = async (kind: "preview" | "full", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    setUploading(kind); setError(null)
    try {
      const selectedType = file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : null
      if (!selectedType) throw new Error("Choose an audio or video file.")
      const hasExistingMedia = Boolean(draft.previewAudio || draft.fullAudio || draft.previewVideo || draft.fullVideo)
      if (hasExistingMedia && draft.mediaType !== selectedType) throw new Error("Preview and full files must both be audio or both be video.")
      const result = await uploadRecordingMedia(file, kind, sanityToken)
      const pathField = kind === "preview" ? result.mediaType === "audio" ? "previewAudio" : "previewVideo" : result.mediaType === "audio" ? "fullAudio" : "fullVideo"
      onChange({...draft, mediaType: result.mediaType, [pathField]: result.path, duration: result.duration ?? draft.duration})
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "The file could not be uploaded.") }
    finally { setUploading(null); event.currentTarget.value = "" }
  }
  const generatePreview = async () => {
    const fullPath = draft.mediaType === "video" ? draft.fullVideo : draft.fullAudio
    if (!fullPath) return
    setGenerating(true); setError(null)
    try {
      const previewPath = await generateRecordingPreview(fullPath, draft.mediaType, sanityToken)
      const previewField = draft.mediaType === "video" ? "previewVideo" : "previewAudio"
      onChange({...draft, [previewField]: previewPath})
    } catch (generationError) { setError(generationError instanceof Error ? generationError.message : "Preview generation failed.") }
    finally { setGenerating(false) }
  }
  const mediaLabel = draft.mediaType === "video" ? "video" : draft.mediaType === "audio" ? "audio" : "media"
  const previewPath = draft.mediaType === "video" ? draft.previewVideo : draft.previewAudio
  const fullPath = draft.mediaType === "video" ? draft.fullVideo : draft.fullAudio
  return <Stack space={3}><Text>Upload your {mediaLabel}. File type and duration are detected automatically.</Text><input ref={previewInput} type="file" accept="audio/*,video/*" onChange={(event) => void upload("preview", event)} style={{display: "none"}} /><input ref={fullInput} type="file" accept="audio/*,video/*" onChange={(event) => void upload("full", event)} style={{display: "none"}} /><Flex gap={3} wrap="wrap"><Button text={fullPath ? "Replace full recording" : "Upload full recording"} loading={uploading === "full"} onClick={() => fullInput.current?.click()} /><Button text={previewPath ? "Replace custom preview" : "Upload custom preview"} loading={uploading === "preview"} onClick={() => previewInput.current?.click()} /><Button text="Generate 30-second preview" tone="primary" disabled={!fullPath || uploading === "full"} loading={generating} onClick={() => void generatePreview()} /></Flex>{!fullPath && <Text size={1} muted>Upload a full recording to enable automatic preview generation.</Text>}{generating && <Text size={1} muted>Generating your 30-second preview. This can take a moment.</Text>}{previewPath && <Text size={1} muted>Preview ready.</Text>}{fullPath && <Text size={1} muted>Full recording uploaded.</Text>}{draft.duration && <Text size={1} muted>Duration detected: {draft.duration}</Text>}{error && <Text size={1} style={{color: "var(--card-critical-fg-color)"}}>{error}</Text>}</Stack>
}

export function CoverArtField({label = "Cover art", onSelected, selected}: {label?: string; onSelected: (file: File) => void; selected: boolean}) { const fileInput = useRef<HTMLInputElement>(null); const select = (event: ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; if (file) onSelected(file) }; return <Stack space={2}><Text size={1} weight="medium">{label}</Text><input ref={fileInput} type="file" accept="image/*" onChange={select} style={{display: "none"}} /><Button text={`Choose ${label.toLocaleLowerCase()}`} onClick={() => fileInput.current?.click()} />{selected && <Text size={1} muted>Artwork selected.</Text>}</Stack> }

export function AlbumForm({draft, onChange, onCoverArtSelected}: {draft: AlbumDraft; onChange: (draft: AlbumDraft) => void; onCoverArtSelected: (file: File) => void}) { return <Stack space={4}><Field label="Album title" required value={draft.title} onChange={(title) => onChange({...draft, title})} /><Field label="Artist" required value={draft.artist} onChange={(artist) => onChange({...draft, artist})} /><Field label="Release year" type="number" value={draft.yearReleased} onChange={(value) => onChange({...draft, yearReleased: value ? Number(value) : undefined})} /><CoverArtField label="Album cover art" selected={Boolean(draft.coverArt)} onSelected={onCoverArtSelected} /></Stack> }
export function SaleForm({draft, onChange}: {draft: SaleDraft; onChange: (draft: SaleDraft) => void}) { const toggle = (value: SaleDraft["deliveryTypes"][number]) => { const selected = draft.deliveryTypes.includes(value); if (selected && draft.deliveryTypes.length === 1) return; onChange({...draft, deliveryTypes: selected ? draft.deliveryTypes.filter((item) => item !== value) : [...draft.deliveryTypes, value]}) }; return <Stack space={4}><Field label="Listing title" required value={draft.title} onChange={(title) => onChange({...draft, title})} /><Field label="Short description" value={draft.shortDescription} onChange={(shortDescription) => onChange({...draft, shortDescription})} /><Field label="Price (USD)" required type="number" value={draft.price} onChange={(value) => onChange({...draft, price: Number(value)})} /><Text size={1} weight="medium">Product types *</Text><Flex gap={3}><Button text="Digital download" mode={draft.deliveryTypes.includes("digitalDownload") ? "default" : "ghost"} onClick={() => toggle("digitalDownload")} /><Button text="Physical CD" mode={draft.deliveryTypes.includes("physicalCD") ? "default" : "ghost"} onClick={() => toggle("physicalCD")} /></Flex></Stack> }
export function SharedRecordingDetails({artist, yearReleased, coverArtSelected, onArtistChange, onYearChange, onCoverArtSelected}: {artist: string; yearReleased?: number; coverArtSelected: boolean; onArtistChange: (value: string) => void; onYearChange: (value: number | undefined) => void; onCoverArtSelected: (file: File) => void}) { return <Stack space={4}><Text size={2} weight="semibold">Recording details</Text><Field label="Artist" required value={artist} onChange={onArtistChange} /><Grid columns={2} gap={3}><Field label="Release year" type="number" value={yearReleased} onChange={(value) => onYearChange(value ? Number(value) : undefined)} /></Grid><CoverArtField selected={coverArtSelected} onSelected={onCoverArtSelected} /></Stack> }
