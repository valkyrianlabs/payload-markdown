import type { Field } from 'payload'

import type { MarkdownFieldOptions } from '../../types.ts'

export function markdownField(options: MarkdownFieldOptions = {}): Field {
  const {
    name = 'content',
    admin,
    defaultValue,
    label = 'Markdown',
    localized = false,
    required = false
  } = options

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
