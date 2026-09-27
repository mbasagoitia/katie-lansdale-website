import {useEffect, useMemo, useState} from "react"
import {Button, Card, Flex, Stack, Text} from "@sanity/ui"
import {useClient} from "sanity"
import {usePaneRouter} from "sanity/structure"
import {apiVersion} from "../../env"
import {deleteRecording, listMusicLibrary} from "./services/music"
import type {MusicLibraryItem} from "./types"

type Filter = "all" | "listed" | "unlisted"

export default function MusicLibrary({onBack}: {onBack: () => void}) {
  const client = useClient({apiVersion})
  const {navigateIntent} = usePaneRouter()
  const [items, setItems] = useState<MusicLibraryItem[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { void listMusicLibrary(client).then(setItems).catch(() => setError("Your uploads could not be loaded. Please try again.")) }, [client])
  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || (filter === "listed" ? item.isListed : !item.isListed)), [filter, items])
  const groups = groupUploads(visibleItems)

  async function removeRecording(item: MusicLibraryItem) {
    if (!window.confirm(`Delete recording “${item.title}”? This permanently removes the uploaded recording, but does not delete its work.`)) return
    setDeletingId(item._id)
    setError(null)
    try {
      await deleteRecording(client, item._id)
      setItems((current) => current.filter((recording) => recording._id !== item._id))
    } catch {
      setError("The recording could not be deleted. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  return <Card padding={5} radius={2} shadow={1}><Stack space={5}>
    <Flex justify="space-between" align="center"><Text size={3} weight="semibold">Uploads</Text><Button text="Back" mode="bleed" onClick={onBack} /></Flex>
    <Text>Uploads are grouped by composer, then work. “Listed for sale” means there is an active product listing; uploads without one remain available to list later.</Text>
    <Flex gap={2} wrap="wrap">
      <Button text={`All uploads (${items.length})`} mode={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")} />
      <Button text={`Listed for sale (${items.filter((item) => item.isListed).length})`} mode={filter === "listed" ? "default" : "ghost"} onClick={() => setFilter("listed")} />
      <Button text={`Not listed for sale (${items.filter((item) => !item.isListed).length})`} mode={filter === "unlisted" ? "default" : "ghost"} onClick={() => setFilter("unlisted")} />
    </Flex>
    {error && <Card padding={3} tone="critical"><Text>{error}</Text></Card>}
    {!error && !items.length && <Text muted>No uploads have been saved yet.</Text>}
    {groups.map((composer) => <Stack key={composer.name} space={3}><Text size={2} weight="semibold">{composer.name}</Text>{composer.works.map((work) => <Card key={work.id} padding={4} tone="transparent"><Stack space={3}>
      <Text size={2} weight="semibold">{work.title}</Text>
      {work.recordings.map((item) => <Flex key={item._id} justify="space-between" gap={3} align="center"><Stack space={2}><Text>{item.title}</Text><Text size={1} muted>{[item.artist, item.yearReleased, item.isListed ? "Listed for sale" : "Upload only"].filter(Boolean).join(" — ")}</Text>{item.productTitles.length > 0 && <Text size={1} muted>{`For sale as: ${item.productTitles.join(", ")}`}</Text>}</Stack><Flex gap={2}><Button text="Edit recording" mode="ghost" onClick={() => navigateIntent("edit", {id: item._id, type: "recording"})} /><Button text="Delete recording" tone="critical" mode="ghost" loading={deletingId === item._id} disabled={Boolean(deletingId)} onClick={() => void removeRecording(item)} /></Flex></Flex>)}
    </Stack></Card>)}</Stack>)}
  </Stack></Card>
}

function groupUploads(items: MusicLibraryItem[]) {
  const composers = new Map<string, {name: string; works: Map<string, {id: string; title: string; recordings: MusicLibraryItem[]}>}>()
  items.forEach((item) => {
    const composerName = item.work?.composer?.name || "Unknown composer"
    const workId = item.work?.title || "Unassigned work"
    const composer = composers.get(composerName) || {name: composerName, works: new Map()}
    const work = composer.works.get(workId) || {id: workId, title: item.work?.title || "Unassigned work", recordings: []}
    work.recordings.push(item)
    composer.works.set(workId, work)
    composers.set(composerName, composer)
  })
  return Array.from(composers.values()).map((composer) => ({name: composer.name, works: Array.from(composer.works.values())}))
}
