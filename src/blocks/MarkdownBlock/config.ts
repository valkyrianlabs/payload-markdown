import type { Block } from 'payload'

import { markdownField } from '../../field/MarkdownField/config.ts'

export const MarkdownBlock: Block = {
  slug: '@valkyrianlabs/markdown-block',
  fields: [
    markdownField({
      name: 'content',
      label: 'Markdown Content',
      required: true
    })
  ],
  labels: {
    plural: 'Markdown Blocks',
    singular: 'Markdown Block'
  },
}
