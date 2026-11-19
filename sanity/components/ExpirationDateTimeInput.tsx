import {useEffect} from "react"
import {set, type StringInputProps, useFormValue} from "sanity"
import {tenPmEasternIso} from "../lib/easternTime"

type Listing = {
  date?: string
  startDate?: string
  endDate?: string
  expirationMode?: "expire" | "never"
}

/** Starts expiring listings at 10 PM Eastern on their relevant date, while keeping the time editable. */
export default function ExpirationDateTimeInput(props: StringInputProps) {
  const {onChange, path, renderDefault, value} = props
  const parent = useFormValue(path.slice(0, -1)) as Listing | undefined
  const defaultDate = parent?.endDate || parent?.startDate || parent?.date

  useEffect(() => {
    if (parent?.expirationMode !== "never" && !value && defaultDate) onChange(set(tenPmEasternIso(defaultDate)))
  }, [defaultDate, onChange, parent?.expirationMode, value])

  return renderDefault(props)
}
