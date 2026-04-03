import type { MarkdownBlockProps } from '../../core/types.d.ts'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.tsx'
import { resolveMarkdownConfig } from '../../hooks/resolveMarkdownConfig.ts'

export const MarkdownBlockComponent = ({ block, defaults, overrides } : MarkdownBlockProps) => {
  const config = resolveMarkdownConfig(defaults, overrides)

  return (
    <div className="mx-auto max-w-3xl">
      <MarkdownRenderer {...config} markdown={block.content} wrapperClassName="w-full" />
    </div>
  )
}
