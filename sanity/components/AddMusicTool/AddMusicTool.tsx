import {useState} from "react"
import {Card, Container, Stack, Text} from "@sanity/ui"
import AddRecordingWorkflow from "./AddRecordingWorkflow"
import {Choice} from "./components"
import CreateAlbumWorkflow from "./CreateAlbumWorkflow"

export default function AddMusicTool() {
  const [mode, setMode] = useState<"landing" | "recording" | "album">("landing")
  const reset = () => setMode("landing")
  return <Container width={2} padding={5}><Stack space={5}>
    {mode === "landing" && <Card padding={5} radius={2} shadow={1}><Stack space={5}><Text size={4} weight="bold">Add Music</Text><Text size={2}>What would you like to add?</Text><Choice title="Add a recording" description="Add a new recording" onClick={() => setMode("recording")} /><Choice title="Create an album" description="Start an album, then add one or more pieces to it" onClick={() => setMode("album")} /></Stack></Card>}
    {mode === "recording" && <AddRecordingWorkflow onCancel={reset} onComplete={reset} />}
    {mode === "album" && <CreateAlbumWorkflow onCancel={reset} />}
  </Stack></Container>
}
