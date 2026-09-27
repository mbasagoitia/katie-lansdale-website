import {useState} from "react"
import {Card, Container, Stack, Text} from "@sanity/ui"
import AddRecordingWorkflow from "./AddRecordingWorkflow"
import {Choice} from "./components"
import CreateAlbumWorkflow from "./CreateAlbumWorkflow"
import MusicLibrary from "./MusicLibrary"
import ProductLibrary from "./ProductLibrary"

export default function AddMusicTool() {
  const [mode, setMode] = useState<"landing" | "recording" | "album" | "library" | "products">("landing")
  const reset = () => setMode("landing")
  return <Container width={2} padding={5}><Stack space={5}>
    {mode === "landing" && <Card padding={5} radius={2} shadow={1}><Stack space={5}><Text size={4} weight="bold">Music Store</Text><Text size={2}>What would you like to do?</Text><Choice title="Add a recording" description="Add a new work or a new recording of an existing work" onClick={() => setMode("recording")} /><Choice title="Create an album" description="Start an album, then add one or more pieces to it" onClick={() => setMode("album")} /><Choice title="View uploads" description="Browse recordings you have uploaded, whether or not they are listed for sale" onClick={() => setMode("library")} /><Choice title="Manage products" description="List uploads for sale or delete product listings without removing their source music" onClick={() => setMode("products")} /></Stack></Card>}
    {mode === "recording" && <AddRecordingWorkflow onCancel={reset} onComplete={reset} />}
    {mode === "album" && <CreateAlbumWorkflow onCancel={reset} />}
    {mode === "library" && <MusicLibrary onBack={reset} />}
    {mode === "products" && <ProductLibrary onBack={reset} />}
  </Stack></Container>
}
