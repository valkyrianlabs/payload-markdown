import type { MarkdownBlockProps } from '../../core/types.js'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.js'
import { resolveMarkdownBlockDefaults } from '../../runtime/index.js'

export const MarkdownBlockComponent = ({ block, collectionSlug }: MarkdownBlockProps) => {
  const resolvedConfig = resolveMarkdownBlockDefaults(collectionSlug)

  return <MarkdownRenderer markdown={block.content} {...resolvedConfig} scope='blocks' />
}
