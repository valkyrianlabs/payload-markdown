import type { Element } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { IconEntry } from '../icons/entries.js'
import type { MarkdownRenderConfig } from '../types/core.js'

import { buttonPaletteStyle, directivePaletteStyle, getPaletteRegistry } from '../palettes/index.js'

/** Attributes every palette-aware directive accepts. */
export const PALETTE_ATTRIBUTES = ['iconPalette', 'palette'] as const

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** Render properties carrying `palette` / `iconPalette` from mdast to hast. */
export function getPaletteRenderProperties(node: ContainerDirective) {
  return {
    dataIconPalette: getAttribute(node, 'iconPalette'),
    dataPalette: getAttribute(node, 'palette'),
  }
}

function readProperty(node: Element, name: 'dataIconPalette' | 'dataPalette'): string | undefined {
  const value = node.properties[name]

  return typeof value === 'string' && value ? value : undefined
}

/**
 * The palette an icon of this directive is painted with: its own entry, then
 * the directive's `iconPalette`, then the directive's `palette`.
 */
export function resolveIconPaletteName(node: Element, entry?: IconEntry): string | undefined {
  return entry?.palette ?? readProperty(node, 'dataIconPalette') ?? readProperty(node, 'dataPalette')
}

/**
 * Scopes the directive's palette to it: the palette colours become the public
 * `--pmd-*` tokens (or button tokens) on the directive element, which the
 * default themes read first. Unknown palettes were reported during validation
 * and leave the directive unchanged.
 */
export function applyDirectivePalette(
  node: Element,
  config: MarkdownRenderConfig,
  kind: 'button' | 'surface' = 'surface',
): void {
  const name = readProperty(node, 'dataPalette')
  if (!name) return

  const palette = getPaletteRegistry(config.palettes).get(name)
  if (!palette) return

  const style = kind === 'button' ? buttonPaletteStyle(palette) : directivePaletteStyle(palette)
  if (style) node.properties.style = style
}
