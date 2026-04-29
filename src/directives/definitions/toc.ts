import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

export const DEFAULT_TOC_DEPTH = 3
export const DEFAULT_TOC_TITLE = 'On this page'

export function resolveTocDepth(node: ContainerDirective): number {
  const value = node.attributes?.depth
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : DEFAULT_TOC_DEPTH

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6 ? parsed : DEFAULT_TOC_DEPTH
}

export function resolveTocTitle(node: ContainerDirective): string {
  const title = node.attributes?.title

  return typeof title === 'string' && title.trim() ? title.trim() : DEFAULT_TOC_TITLE
}

export const tocDirective: LayoutDirectiveDefinition = {
  name: 'toc',
  allowedAttributes: ['depth', 'title'],
  applyHast(node, _config, { mergeClassNames }) {
    node.properties.className = mergeClassNames(
      'not-prose my-6 rounded-xl border border-border bg-black/5 px-4 py-3 dark:bg-white/5',
    )
  },
  defaultAttributes: {
    depth: String(DEFAULT_TOC_DEPTH),
    title: DEFAULT_TOC_TITLE,
  },
  description: 'Table of contents generated from document headings.',
  editor: {
    detail: 'Docs directive',
    label: 'Table of contents',
    snippet: ':::toc {title="${On this page}" depth="${3}"}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    const title = resolveTocTitle(node)

    return {
      ariaLabel: title,
      dataDirective: 'toc',
      dataTitle: title,
    }
  },
  kind: 'toc',
  openMarker: ':::toc',
  public: true,
  supportsAttributes: true,
  tagName: 'nav',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (
      typeof attributes.depth === 'string' &&
      (!Number.isInteger(Number.parseInt(attributes.depth, 10)) ||
        Number.parseInt(attributes.depth, 10) < 1 ||
        Number.parseInt(attributes.depth, 10) > 6)
    )
      warnings.push(`Invalid toc depth "${attributes.depth}". Falling back to "${DEFAULT_TOC_DEPTH}".`)

    return warnings
  },
}
