import type {
  GridDirectiveName,
  LayoutDirectiveDefinition,
  LayoutName,
  LayoutToken,
  MarkdownDirectiveName,
} from './types.js'

import { parseDirectiveLine } from './attributes.js'
import { calloutDirective } from './definitions/callout.js'
import { cellDirective } from './definitions/cell.js'
import { columnDirectives } from './definitions/columns.js'
import { detailsDirective } from './definitions/details.js'
import { sectionDirective } from './definitions/section.js'
import { stepsDirective } from './definitions/steps.js'
import { tocDirective } from './definitions/toc.js'

const directiveDefinitions = [
  sectionDirective,
  ...columnDirectives,
  cellDirective,
  calloutDirective,
  detailsDirective,
  tocDirective,
  stepsDirective,
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

type ParseMarkdownLineResult = {
  diagnostics: string[]
  token: LayoutToken | null
}

function isLayoutName(name: MarkdownDirectiveName): name is LayoutName {
  return Boolean(directiveDefinitions.find((definition) => definition.name === name)?.openMarker)
}

function getDirectiveDefinition(name: string): LayoutDirectiveDefinition | undefined {
  return directiveDefinitions.find((definition) => definition.name === name)
}

function isSupportedDirectiveName(name: string): name is MarkdownDirectiveName {
  return directiveDefinitions.some((definition) => definition.name === name)
}

function getPublicDefinitions(): LayoutDirectiveDefinition[] {
  return directiveDefinitions.filter((definition) => definition.public)
}

function findUnknownAttributes(
  definition: LayoutDirectiveDefinition,
  attributes: Record<string, boolean | string>,
): string[] {
  if (!definition.allowedAttributes) return []

  return Object.keys(attributes).filter((attribute) => !definition.allowedAttributes?.includes(attribute))
}

function parseMarkdownLineDetailed(text: string): ParseMarkdownLineResult {
  const trimmed = text.trim()
  const closeToken = closeMarkers.get(trimmed)

  if (closeToken)
    return {
      diagnostics: [],
      token: cloneToken(closeToken),
    }

  const parsed = parseDirectiveLine(trimmed)
  if (!parsed)
    return {
      diagnostics: trimmed.startsWith(':::')
        ? ['Malformed directive marker.']
        : [],
      token: null,
    }

  if (!isSupportedDirectiveName(parsed.name))
    return {
      diagnostics: [`Unknown directive "${parsed.name}".`],
      token: null,
    }

  if (!isLayoutName(parsed.name))
    return {
      diagnostics: [],
      token: null,
    }

  const definition = getDirectiveDefinition(parsed.name)
  if (!definition?.openMarker)
    return {
      diagnostics: [],
      token: null,
    }

  if (!definition.supportsAttributes && parsed.rawAttributes)
    return {
      diagnostics: [`Directive "${parsed.name}" does not support attributes.`],
      token: null,
    }

  const exactMatch = definition.openMarker === trimmed
  const attributedMatch =
    definition.supportsAttributes &&
    trimmed.startsWith(`${definition.openMarker} `)

  if (!exactMatch && !attributedMatch)
    return {
      diagnostics: [],
      token: null,
    }

  const diagnostics = [
    ...parsed.warnings,
    ...findUnknownAttributes(definition, parsed.attributes).map(
      (attribute) => `Unknown attribute "${attribute}" on "${parsed.name}".`,
    ),
    ...(definition.validateAttributes?.({
      name: parsed.name,
      attributes: parsed.attributes,
    }) ?? []),
  ]

  const token: LayoutToken = {
    name: parsed.name,
    type: 'vlLayoutToken',
    action: 'open',
    attributes: parsed.attributes,
  }

  return {
    diagnostics,
    token,
  }
}

function parseMarkdownLine(text: string): LayoutToken | null {
  return parseMarkdownLineDetailed(text).token
}

export const layoutDirectiveRegistry = {
  all: directiveDefinitions,

  get: getDirectiveDefinition,

  getPublicDefinitions,

  isGridName(name: string | undefined): name is GridDirectiveName {
    return name === '2col' || name === '3col'
  },

  isSupportedDirectiveName,

  parseMarkdownLine,

  parseMarkdownLineDetailed,
}

export type { GridDirectiveName, LayoutName, LayoutToken, MarkdownDirectiveName }
