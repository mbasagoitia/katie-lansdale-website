import {useEffect, useMemo, useState} from "react"
import {Button, Card, Flex, Stack, Text} from "@sanity/ui"
import {useClient} from "sanity"
import {apiVersion} from "../../env"
import {listMusicLibrary} from "./services/music"
import type {MusicLibraryItem} from "./types"

type Filter = "all" | "listed" | "unlisted"

export default function MusicLibrary({onBack}: {onBack: () => void}) {
  const client = useClient({apiVersion})
  const [items, setItems] = useState<MusicLibraryItem[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { void listMusicLibrary(client).then(setItems).catch(() => setError("Your music library could not be loaded. Please try again.")) }, [client])
  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || (filter === "listed" ? item.isListed : !item.isListed)), [filter, items])

  return <Card padding={5} radius={2} shadow={1}><Stack space={5}>
    <Flex justify="space-between" align="center"><Text size={3} weight="semibold">Music library</Text><Button text="Back" mode="bleed" onClick={onBack} /></Flex>
    <Text>Recordings saved without a sale listing appear here as Not listed. Creating a sale listing marks its recording or work as Listed on website.</Text>
    <Flex gap={2} wrap="wrap">
      <Button text={`All (${items.length})`} mode={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")} />
      <Button text={`Listed on website (${items.filter((item) => item.isListed).length})`} mode={filter === "listed" ? "default" : "ghost"} onClick={() => setFilter("listed")} />
      <Button text={`Not listed (${items.filter((item) => !item.isListed).length})`} mode={filter === "unlisted" ? "default" : "ghost"} onClick={() => setFilter("unlisted")} />
    </Flex>
    {error && <Card padding={3} tone="critical"><Text>{error}</Text></Card>}
    {!error && !items.length && <Text muted>No recordings have been saved yet.</Text>}
    {visibleItems.map((item) => <Card key={item._id} padding={4} tone="transparent"><Stack space={2}>
      <Flex justify="space-between" gap={3} align="center"><Text size={2} weight="semibold">{item.title}</Text><Text size={1} weight="semibold">{item.isListed ? "Listed on website" : "Not listed"}</Text></Flex>
      <Text size={1} muted>{[item.work?.composer?.name, item.work?.title, item.artist, item.yearReleased].filter(Boolean).join(" — ")}</Text>
      {item.productTitles.length > 0 && <Text size={1} muted>{`For sale as: ${item.productTitles.join(", ")}`}</Text>}
    </Stack></Card>)}
  </Stack></Card>
}
