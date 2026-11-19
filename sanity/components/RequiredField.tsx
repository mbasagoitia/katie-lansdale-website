import type {FieldProps, Rule} from "sanity"

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
}

function isRequired(props: FieldProps) {
  const validation = (props.schemaType as {validation?: Rule[]}).validation || []
  return validation.some((rule) => rule._required === "required")
}

/** Adds a clear required marker without alarming editors about an untouched empty field. */
export default function RequiredField(props: FieldProps) {
  const required = isRequired(props)
  const title = required ? <>{props.title} <span style={{color: "#d12f2f"}} aria-hidden="true">*</span></> : props.title

  return props.renderDefault({
    ...props,
    title,
    validation: required && isEmpty(props.value) ? [] : props.validation,
  } as unknown as FieldProps)
}
