import type { Block } from 'payload'

import { blocksParams } from '../../field/BlocksParams/config.ts'
import { markdownField } from '../../field/MarkdownField/config.ts'

export const MarkdownBlock: Block = {
  slug: 'vlMdBlock',
  fields: [
    markdownField({
      name: 'content',
      label: 'Markdown Content',
      required: true
    }),
    blocksParams()
  ],
  labels: {
    plural: 'Markdown Blocks',
    singular: 'Markdown Block'
  },
}
