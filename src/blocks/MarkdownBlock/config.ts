import type { Block } from 'payload'

import { vlMdConfig } from '../../field/Config/config.js'
import { markdownField } from '../../field/MarkdownField/config.js'

export const MarkdownBlock: Block = {
  slug: 'vlMdBlock',
  fields: [
    vlMdConfig(),
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
