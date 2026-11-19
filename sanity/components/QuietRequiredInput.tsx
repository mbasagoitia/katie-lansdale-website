import type {InputProps, Rule} from "sanity"

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
}

export default function QuietRequiredInput(props: InputProps) {
  const validation = (props.schemaType as {validation?: Rule[]}).validation || []
  const required = validation.some((rule) => rule._required === "required")

  return props.renderDefault({
    ...props,
    validation: required && isEmpty(props.value) ? [] : props.validation,
  } as InputProps)
}
