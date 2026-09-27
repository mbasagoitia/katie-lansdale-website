import {useState} from "react"
import {TrashIcon} from "@sanity/icons"
import {type DocumentActionComponent, useDocumentOperation} from "sanity"

const labels: Record<string, string> = {composer: "composer", work: "work", recording: "recording", album: "album", product: "product"}

export const DeleteMusicDocumentAction: DocumentActionComponent = (props) => {
  const [confirming, setConfirming] = useState(false)
  const {delete: deleteOperation} = useDocumentOperation(props.id, props.type)
  const label = labels[props.type] || "item"

  return {
    label: `Delete ${label}`,
    tone: "critical",
    icon: TrashIcon,
    disabled: Boolean(deleteOperation.disabled),
    onHandle: () => setConfirming(true),
    dialog: confirming ? {
      type: "confirm",
      tone: "critical",
      message: `Delete this ${label}? This cannot be undone.`,
      confirmButtonText: `Delete ${label}`,
      onCancel: () => setConfirming(false),
      onConfirm: () => { deleteOperation.execute(); setConfirming(false); props.onComplete() },
    } : null,
  }
}

DeleteMusicDocumentAction.action = "delete"
DeleteMusicDocumentAction.displayName = "DeleteMusicDocumentAction"
