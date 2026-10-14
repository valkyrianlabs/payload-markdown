import type { Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownRenderConfig } from '../../types/core.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { getExtraIconWarnings, parseIconEntries } from '../../icons/entries.js'
import { collectPaletteNames, getUnknownPaletteWarning } from '../../palettes/diagnostics.js'
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

function validateDirective(node: ContainerDirective, file: DiagnosticFile, config: MarkdownRenderConfig) {
  const allowed = layoutDirectiveRegistry.get(node.name)?.allowedAttributes
  if (!allowed) return

  const place = node.data?.vlPlace

  if (allowed.includes('icon')) {
    const icon = node.attributes?.icon
    const { entries, warnings } = parseIconEntries(typeof icon === 'string' ? icon : undefined)

    for (const warning of [...warnings, ...getExtraIconWarnings(node.name, entries)])
      reportDiagnostic(file, warning, { code: 'icon-option', place, source: 'icon' })
  }

  for (const name of collectPaletteNames(allowed, node.attributes)) {
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
