import type { Field } from 'payload'

import type { MarkdownFieldOptions } from '../../types.ts'

/**
 * Default maximum length of a markdown field, in characters. Payload text
 * fields otherwise inherit `config.defaultMaxTextLength` (40,000), which long
 * documentation pages exceed. The limit is enforced by validation only; the
 * database column type is unchanged (varchar/text without a length).
 */
export const DEFAULT_MARKDOWN_MAX_LENGTH = 1_000_000

export function markdownField(options: MarkdownFieldOptions = {}): Field {
  const {
    name = 'content',
    admin,
    defaultValue,
    label = 'Markdown',
    localized = false,
    maxLength = DEFAULT_MARKDOWN_MAX_LENGTH,
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
    maxLength,
    required,
  }
}
