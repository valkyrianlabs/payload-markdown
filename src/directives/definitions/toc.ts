import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'

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
  allowedAttributes: ['depth', 'theme', 'title'],
  applyHast(node, config, { mergeClassNames }) {
    const theme = resolveDirectiveTheme(
      'toc',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
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
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
      dataTitle: title,
    }
  },
  kind: 'toc',
  openMarker: ':::toc',
  public: true,
  supportsAttributes: true,
  tagName: 'nav',
  themeAttributes: {
    theme: 'toc',
  },
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
