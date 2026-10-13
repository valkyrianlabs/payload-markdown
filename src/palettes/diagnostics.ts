import type { MarkdownRenderConfig } from '../types/core.js'

import { getPaletteRegistry } from './index.js'

const LISTED_PALETTES = 12

/** The unknown-palette message, shared by the renderer and the editor lint. */
export function formatUnknownPaletteMessage(name: string, directive: string, known: readonly string[]): string {
  const names = [...known].sort()
  const listed = names.slice(0, LISTED_PALETTES).join(', ')
  const more = names.length > LISTED_PALETTES ? `, … (${names.length} in total)` : ''

  return `Unknown palette "${name}" on "${directive}". It renders without that palette. ${
    names.length > 0 ? `Known palettes: ${listed}${more}.` : 'No palettes are configured.'
  }`
}

/** Warning for a palette name the render cannot resolve, or `undefined` when it is known. */
export function getUnknownPaletteWarning(
  name: string,
  directive: string,
  config: Pick<MarkdownRenderConfig, 'palettes'>,
): string | undefined {
  const registry = getPaletteRegistry(config.palettes)

  return registry.get(name) ? undefined : formatUnknownPaletteMessage(name, directive, registry.names())
}
