import type { MarkdownBlockProps } from '../../core/types.d.ts'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.tsx'
import { resolveMarkdownBlockDefaults } from '../../runtime/index.ts'

export const MarkdownBlockComponent = ({ block, collectionSlug }: MarkdownBlockProps) => {
  const resolvedConfig = resolveMarkdownBlockDefaults(collectionSlug)

  return <MarkdownRenderer markdown={block.content} {...resolvedConfig} scope='blocks' />
}
