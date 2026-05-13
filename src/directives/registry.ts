import type {
  GridDirectiveName,
  LayoutDirectiveDefinition,
  LayoutName,
  LayoutToken,
  MarkdownDirectiveName,
} from './types.js'

import { normalizePayloadMarkdownIconRef } from '../icons/refs.js'
import { getUnknownAttributeWarnings } from './attributeDiagnostics.js'
import { parseDirectiveLine } from './attributes.js'
import { buttonDirective } from './definitions/button.js'
import { buttonsDirective } from './definitions/buttons.js'
import { calloutDirective } from './definitions/callout.js'
import { cardDirective } from './definitions/card.js'
import { cardsDirective } from './definitions/cards.js'
import { cellDirective } from './definitions/cell.js'
import { columnDirectives } from './definitions/columns.js'
import { detailsDirective } from './definitions/details.js'
import { sectionDirective } from './definitions/section.js'
import { stepsDirective } from './definitions/steps.js'
import { tabDirective } from './definitions/tab.js'
import { tabsDirective } from './definitions/tabs.js'
import { tocDirective } from './definitions/toc.js'

const directiveDefinitions = [
  sectionDirective,
  ...columnDirectives,
  cellDirective,
  buttonDirective,
  buttonsDirective,
  calloutDirective,
  detailsDirective,
  tocDirective,
  stepsDirective,
  cardsDirective,
  cardDirective,
  tabsDirective,
  tabDirective,
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

const preferredLabelAttributes = new Map<string, string>([
  ['callout', 'title'],
  ['card', 'title'],
  ['details', 'title'],
  ['tab', 'label'],
  ['toc', 'title'],
])

function getLabelConflictDiagnostics(
  name: string,
  label: string | undefined,
  attributes: Record<string, boolean | string>,
): string[] {
  const labelAttribute = preferredLabelAttributes.get(name)
  if (!labelAttribute) return []

  const normalizedLabel = label?.trim()
  const attributeTitle = attributes[labelAttribute]
  if (!normalizedLabel || typeof attributeTitle !== 'string' || !attributeTitle.trim()) return []
  if (normalizedLabel === attributeTitle.trim()) return []

  return [
    `Directive has both [Label] and ${labelAttribute}. [Label] is preferred; remove one to avoid ambiguity.`,
  ]
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
    (trimmed.startsWith(`${definition.openMarker} `) ||
      trimmed.startsWith(`${definition.openMarker}[`) ||
      trimmed.startsWith(`${definition.openMarker}{`))

  if (!exactMatch && !attributedMatch)
    return {
      diagnostics: [],
      token: null,
    }

  const diagnostics = [
    ...parsed.warnings,
    ...getUnknownAttributeWarnings(parsed.name, definition.allowedAttributes, parsed.attributes),
    ...getLabelConflictDiagnostics(parsed.name, parsed.label, parsed.attributes),
    ...(typeof parsed.attributes.icon === 'string'
      ? [normalizePayloadMarkdownIconRef(parsed.attributes.icon).warning].filter(
          (warning): warning is string => Boolean(warning),
        )
      : []),
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
    label: parsed.label,
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
