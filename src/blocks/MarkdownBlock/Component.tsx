import type { MarkdownBlockProps } from '../../types/core.js'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.js'
import { resolveMarkdownBlockDefaults } from '../../runtime/index.js'

export const MarkdownBlockComponent = ({ collectionSlug, content }: MarkdownBlockProps) => {
  const resolvedConfig = resolveMarkdownBlockDefaults(collectionSlug)

  return <MarkdownRenderer markdown={content} {...resolvedConfig} scope='blocks' />
}
