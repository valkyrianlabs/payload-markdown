import type { Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownRenderConfig } from '../../types/core.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { parseIconEntries } from '../../icons/entries.js'
import { getUnknownPaletteWarning } from '../../palettes/diagnostics.js'
import { getPaletteRegistry } from '../../palettes/index.js'
import { type DiagnosticFile, reportDiagnostic } from '../diagnostics.js'

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function validateDirective(node: ContainerDirective, file: DiagnosticFile, config: MarkdownRenderConfig) {
  const allowed = layoutDirectiveRegistry.get(node.name)?.allowedAttributes
  if (!allowed) return

  const place = node.data?.vlPlace
  const names = new Set<string>()

  for (const attribute of ['palette', 'iconPalette'])
    if (allowed.includes(attribute)) {
      const name = getAttribute(node, attribute)
      if (name) names.add(name)
    }

  if (allowed.includes('icon')) {
    const { entries, warnings } = parseIconEntries(getAttribute(node, 'icon'))

    for (const warning of warnings) reportDiagnostic(file, warning, { code: 'icon-option', place, source: 'icon' })
    for (const entry of entries) if (entry.palette) names.add(entry.palette)
  }

  for (const name of names) {
    const warning = getUnknownPaletteWarning(name, node.name, config)
    if (warning) reportDiagnostic(file, warning, { code: 'unknown-palette', place, source: 'theme' })
  }
}

/**
 * Reports palette references the render cannot resolve (`palette`,
 * `iconPalette`, and `palette=` on icon entries) and configured palettes that
 * were ignored because they are invalid. Unknown palettes render unpainted.
 */
export const remarkValidatePalettes: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree, file) => {
    for (const warning of getPaletteRegistry(config.palettes).warnings)
      reportDiagnostic(file, warning, { code: 'palette-config', source: 'theme' })

    visit(tree, (node) => {
      if (isContainerDirective(node)) validateDirective(node, file, config)
    })
  }
}
