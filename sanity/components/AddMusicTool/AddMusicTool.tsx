import {useState} from "react"
import {Card, Container, Stack, Text} from "@sanity/ui"
import AddRecordingWorkflow from "./AddRecordingWorkflow"
import {Choice} from "./components"
import CreateAlbumWorkflow from "./CreateAlbumWorkflow"
import MusicLibrary from "./MusicLibrary"

export default function AddMusicTool() {
  const [mode, setMode] = useState<"landing" | "recording" | "album" | "library">("landing")
  const reset = () => setMode("landing")
  return <Container width={2} padding={5}><Stack space={5}>
    {mode === "landing" && <Card padding={5} radius={2} shadow={1}><Stack space={5}><Text size={4} weight="bold">Add Music</Text><Text size={2}>What would you like to do?</Text><Choice title="Add a recording" description="Add a new recording" onClick={() => setMode("recording")} /><Choice title="Create an album" description="Start an album, then add one or more pieces to it" onClick={() => setMode("album")} /><Choice title="View music library" description="See recordings that are listed on the website or saved for later" onClick={() => setMode("library")} /></Stack></Card>}
    {mode === "recording" && <AddRecordingWorkflow onCancel={reset} onComplete={reset} />}
    {mode === "album" && <CreateAlbumWorkflow onCancel={reset} />}
    {mode === "library" && <MusicLibrary onBack={reset} />}
  </Stack></Container>
}
