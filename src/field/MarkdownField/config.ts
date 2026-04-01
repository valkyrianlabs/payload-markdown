import type { Field, TextField } from 'payload'

export type MarkdownFieldOptions = {
  admin?: Partial<TextField['admin']>
  defaultValue?: string
  label?: string
  localized?: boolean
  name: string
  required?: boolean
}

export function markdownField(options: MarkdownFieldOptions): Field {
  const { name, admin, defaultValue, label, localized = false, required = false } = options

  return {
    name,
    type: 'text',
    admin: {
      ...admin,
      components: {
        ...(admin?.components || {}),
        Field: '@valkyrianlabs/payload-markdown/server#PayloadMarkdownField',
      },
    },
    defaultValue,
    label,
    localized,
    required,
  }
}
