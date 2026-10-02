import type { MarkdownBlockProps } from '../../types/core.js'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.js'

export const MarkdownBlockComponent = ({ collectionSlug, content, settings }: MarkdownBlockProps) => {
  // MarkdownRenderer resolves the block-scope defaults for collectionSlug
  // itself; resolving them here as well merged class names twice (CORE-18).
  return (
    <MarkdownRenderer
      collectionSlug={collectionSlug}
      markdown={content}
      scope='blocks'
      settings={settings}
    />
  )
}
