import {useRef, useState} from "react"
import type {ChangeEvent} from "react"
import {Button, Stack, Text} from "@sanity/ui"
import {set, type StringInputProps, useClient, useFormValue} from "sanity"
import {apiVersion} from "../env"
import {generateRecordingPreview, uploadRecordingMedia} from "@/lib/supabase/storage"

type MediaType = "audio" | "video"
type MediaKind = "full" | "preview"

function RecordingMediaInput({kind, mediaType, ...props}: StringInputProps & {kind: MediaKind; mediaType: MediaType}) {
  const input = useRef<HTMLInputElement>(null)
  const client = useClient({apiVersion})
  const fullPath = useFormValue([mediaType === "audio" ? "fullAudio" : "fullVideo"]) as string | undefined
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFile = Boolean(props.value)
  const isPreview = kind === "preview"
  const busy = uploading || generating
  const fileLabel = `${isPreview ? "preview" : "full"} ${mediaType}`

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const result = await uploadRecordingMedia(file, kind, client.config().token)
      if (result.mediaType !== mediaType) throw new Error(`Choose a ${mediaType} file for this recording.`)
      props.onChange(set(result.path))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The file could not be uploaded.")
    } finally {
      setUploading(false)
      event.currentTarget.value = ""
    }
  }

  async function generatePreview() {
    if (!fullPath) return
    setGenerating(true)
    setError(null)
    try {
      const previewPath = await generateRecordingPreview(fullPath, mediaType, client.config().token)
      props.onChange(set(previewPath))
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Preview generation failed.")
    } finally {
      setGenerating(false)
    }
  }

  return <Stack space={3}>
    <Text size={1} muted>{isPreview ? "Optional. Upload a custom preview, or generate one after a full recording is uploaded." : "Choose a file from your computer. It is saved to Supabase automatically."}</Text>
    <input ref={input} type="file" accept={`${mediaType}/*`} onChange={(event) => void upload(event)} style={{display: "none"}} />
    <Button text={hasFile ? `Replace ${fileLabel} file` : `Upload ${fileLabel} file`} loading={uploading} disabled={props.readOnly || busy} onClick={() => input.current?.click()} />
    {isPreview && fullPath && <Button text={hasFile ? "Preview ready" : "Generate 30-second preview"} tone="primary" loading={generating} disabled={props.readOnly || busy || hasFile} onClick={() => void generatePreview()} />}
    {hasFile && <Text size={1} muted>{isPreview ? "Preview ready." : "Full recording uploaded."}</Text>}
    {isPreview && !fullPath && <Text size={1} muted>Upload the full recording before generating a preview.</Text>}
    {error && <Text size={1} style={{color: "var(--card-critical-fg-color)"}}>{error}</Text>}
  </Stack>
}

export function FullAudioInput(props: StringInputProps) { return <RecordingMediaInput {...props} kind="full" mediaType="audio" /> }
export function PreviewAudioInput(props: StringInputProps) { return <RecordingMediaInput {...props} kind="preview" mediaType="audio" /> }
export function FullVideoInput(props: StringInputProps) { return <RecordingMediaInput {...props} kind="full" mediaType="video" /> }
export function PreviewVideoInput(props: StringInputProps) { return <RecordingMediaInput {...props} kind="preview" mediaType="video" /> }
