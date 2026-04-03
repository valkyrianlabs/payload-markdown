import type { GlobalConfig } from 'payload'

import { blocksParams } from '../../field/BlocksParams/config.ts'

export type MarkdownBlockGlobalOptions = {
  label?: string
  slug?: string
}

export function markdownBlockGlobal(options: MarkdownBlockGlobalOptions = {}): GlobalConfig {
  const { slug = 'vl-markdown-block-global', label = 'Markdown Block Global Settings' } = options

  return {
    slug,
    access: {
      read: () => true,
    },
    fields: [blocksParams()],
    label,
  }
}
