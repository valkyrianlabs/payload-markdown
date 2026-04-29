import type {
  GridDirectiveName,
  LayoutDirectiveDefinition,
  LayoutDirectiveName,
  LayoutName,
  LayoutToken,
} from './types.js'

import { parseDirectiveLine } from './attributes.js'
import { cellDirective } from './definitions/cell.js'
import { columnDirectives } from './definitions/columns.js'
import { sectionDirective } from './definitions/section.js'

const directiveDefinitions = [
  sectionDirective,
  ...columnDirectives,
  cellDirective,
] as const satisfies readonly LayoutDirectiveDefinition[]

const closeMarkers = new Map<string, LayoutToken>([
  [':::', { type: 'vlLayoutToken', action: 'close' }],
  [':::end', { type: 'vlLayoutToken', action: 'closeSection' }],
  [':::endcol', { type: 'vlLayoutToken', action: 'closeGrid' }],
  [':::endsection', { type: 'vlLayoutToken', action: 'closeSection' }],
])

function cloneToken(token: LayoutToken): LayoutToken {
  return { ...token }
}

function isLayoutName(name: LayoutDirectiveName): name is LayoutName {
  return Boolean(directiveDefinitions.find((definition) => definition.name === name)?.openMarker)
}

function getDirectiveDefinition(name: string): LayoutDirectiveDefinition | undefined {
  return directiveDefinitions.find((definition) => definition.name === name)
}

function isSupportedDirectiveName(name: string): name is LayoutDirectiveName {
  return directiveDefinitions.some((definition) => definition.name === name)
}

function parseMarkdownLine(text: string): LayoutToken | null {
  const trimmed = text.trim()
  const closeToken = closeMarkers.get(trimmed)

  if (closeToken) return cloneToken(closeToken)

  const parsed = parseDirectiveLine(trimmed)
  if (!parsed || parsed.rawAttributes) return null
  if (!isSupportedDirectiveName(parsed.name)) return null
  if (!isLayoutName(parsed.name)) return null

  const definition = getDirectiveDefinition(parsed.name)
  if (!definition?.openMarker || definition.openMarker !== trimmed) return null

  return {
    name: parsed.name,
    type: 'vlLayoutToken',
    action: 'open',
  }
}

export const layoutDirectiveRegistry = {
  all: directiveDefinitions,

  get: getDirectiveDefinition,

  isGridName(name: string | undefined): name is GridDirectiveName {
    return name === '2col' || name === '3col'
  },

  isSupportedDirectiveName,

  parseMarkdownLine,
}

export type { GridDirectiveName, LayoutDirectiveName, LayoutName, LayoutToken }
