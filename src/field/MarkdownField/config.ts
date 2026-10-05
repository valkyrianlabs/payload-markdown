import type { Field } from 'payload'

import type { MarkdownFieldOptions } from '../../types.ts'

/**
 * Default maximum length of a markdown field, in characters. Payload text
 * fields otherwise inherit `config.defaultMaxTextLength` (40,000), which long
 * documentation pages exceed. The limit is enforced by validation only; the
 * database column type is unchanged (varchar/text without a length).
 */
export const DEFAULT_MARKDOWN_MAX_LENGTH = 1_000_000

/** Import-map specifier of the markdown field's admin component. */
export const PAYLOAD_MARKDOWN_FIELD_COMPONENT = '@valkyrianlabs/payload-markdown/server#PayloadMarkdownField'

/**
 * Key under field-level `custom` that marks a markdown field, so server code
 * (for example the MCP tools) can find markdown fields in any config.
 */
export const PAYLOAD_MARKDOWN_FIELD_CUSTOM_KEY = 'payloadMarkdownField'

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
        Field: PAYLOAD_MARKDOWN_FIELD_COMPONENT,
      },
    },
    custom: { [PAYLOAD_MARKDOWN_FIELD_CUSTOM_KEY]: true },
    defaultValue,
    label,
    localized,
    maxLength,
    required,
  }
}
