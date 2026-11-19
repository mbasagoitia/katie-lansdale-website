import {useEffect} from "react"
import {set, type StringInputProps, useFormValue} from "sanity"

type Listing = {
  date?: string
  startDate?: string
  endDate?: string
  expirationMode?: "expire" | "never"
}

/** Keeps the default expiration date aligned with the listing date on new items. */
export default function ExpirationDateInput(props: StringInputProps) {
  const {onChange, path, renderDefault, value} = props
  const parent = useFormValue(path.slice(0, -1)) as Listing | undefined
  const usesDefaultDate = parent?.expirationMode !== "never"
  const defaultDate = parent?.endDate || parent?.startDate || parent?.date

  useEffect(() => {
    if (usesDefaultDate && !value && defaultDate) onChange(set(defaultDate))
  }, [defaultDate, onChange, usesDefaultDate, value])

  return renderDefault(props)
}
