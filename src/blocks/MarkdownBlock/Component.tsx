import type { MarkdownBlockProps } from '../../types/core.js'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.js'
import { resolveMarkdownBlockParams } from './params.js'

export const MarkdownBlockComponent = ({
  collectionSlug,
  content,
  'md-params': params,
  settings,
}: MarkdownBlockProps) => {
  // MarkdownRenderer resolves the block-scope defaults for collectionSlug
  // itself; resolving them here as well merged class names twice (CORE-18).
  // Enabled per-block params are the highest-precedence layer: set fields
  // override the global and collection defaults, empty fields inherit them.
  return (
    <MarkdownRenderer
      collectionSlug={collectionSlug}
      markdown={content}
      overrides={resolveMarkdownBlockParams(params)}
      scope='blocks'
      settings={settings}
    />
  )
}
