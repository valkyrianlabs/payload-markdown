import type { Block } from 'payload'

import { blocksParams } from '../../field/BlocksParams/config.js'
import { markdownField } from '../../field/MarkdownField/config.js'

export const MarkdownBlock: Block = {
  slug: 'vlMdBlock',
  fields: [
    blocksParams(),
    markdownField({
      name: 'content',
      label: 'Markdown Content',
      required: true,
    }),
  ],
  interfaceName: 'MarkdownBlock',
  labels: {
    plural: 'Markdown Blocks',
    singular: 'Markdown Block',
  },
}
