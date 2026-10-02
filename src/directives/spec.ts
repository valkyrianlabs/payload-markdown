import type { DirectiveThemeGroupName } from './themes.js'
import type { LayoutDirectiveDefinition } from './types.js'

import { CALLOUT_VARIANTS } from './definitions/callout.js'
import { slugTabValue } from './definitions/tab.js'
import { slugifyHeading } from './headingAnchors.js'
import { DIRECTIVE_LABEL_ATTRIBUTES, layoutDirectiveRegistry } from './registry.js'
import {
  SHIELDS_BADGE_ORIGIN,
  SHIELDS_BADGE_QUERY_ATTRIBUTES,
  SHIELDS_BADGE_REQUIRED_ATTRIBUTES,
  SHIELDS_BADGE_TARGETS,
} from './shields.js'
import { DEFAULT_DIRECTIVE_THEMES, getDirectiveFallbackThemeName } from './themes.js'

/**
 * Version of the spec's JSON shape. Bump it on incompatible shape changes;
 * adding directives, attributes or values does not change it.
 */
export const DIRECTIVE_SPEC_VERSION = 1

export type DirectiveAttributeType = 'boolean' | 'enum' | 'number' | 'string' | 'url'

export type DirectiveSpecAttribute = {
  default?: string
  /** Value format hint for `string` attributes (`icon`: an `@pack/name` icon ref). */
  format?: 'icon'
  max?: number
  min?: number
  name: string
  /** Theme group whose names are valid (built-in themes plus configured ones). */
  themeGroup?: DirectiveThemeGroupName
  type: DirectiveAttributeType
  /** Allowed values of `enum` attributes; the literals of `boolean` attributes. */
  values?: string[]
}

export type DirectiveSpecDirective = {
  attributes: DirectiveSpecAttribute[]
  /** Close-label text the editor shows after a generic `:::` closer. */
  closeLabel?: string
  /** Markers that close this directive; empty for leaf directives. */
  closeMarkers: string[]
  description?: string
  kind: 'container' | 'leaf'
  /** Attribute that `[label]` stands for, if any. */
  labelAttribute?: string
  name: string
  /** Opening marker: `:::name` (container) or `::name` (leaf). */
  open: string
  supportsAttributes: boolean
}

export type DirectiveSpec = {
  badges: {
    intervals: string[]
    origin: string
    queryAttributes: string[]
    requiredAttributes: Record<string, string[]>
    styles: string[]
    targets: Record<string, string[]>
    types: string[]
  }
  closeMarkers: Array<{ closes: 'grid' | 'innermost' | 'section'; marker: string }>
  constraints: string[]
  directives: DirectiveSpecDirective[]
  headings: { examples: Array<[string, string]>; slug: string[] }
  package: string
  specVersion: number
  tabs: { examples: Array<{ index: number; raw: string; value: string }>; value: string[] }
  themes: Record<string, { builtIn: string[]; fallback: string }>
}

const URL_ATTRIBUTES = new Set(['href', 'src'])
const BOOLEAN_ATTRIBUTES = new Set(['disabled', 'open'])
const NUMBER_ATTRIBUTES: Record<string, { max?: number; min?: number }> = {
  cacheSeconds: { min: 0 },
  depth: { max: 6, min: 1 },
}
/** Enumerations the definitions validate in code rather than through `attributeValues`. */
const EXTRA_ENUMS: Record<string, Record<string, readonly string[]>> = {
  callout: { variant: CALLOUT_VARIANTS },
}

function isBooleanValues(values: readonly string[] | undefined): boolean {
  return Boolean(values && values.length === 2 && values.includes('true') && values.includes('false'))
}

function describeAttribute(
  definition: LayoutDirectiveDefinition,
  name: string,
): DirectiveSpecAttribute {
  const values = definition.attributeValues?.[name] ?? EXTRA_ENUMS[definition.name]?.[name]
  const themeGroup = definition.themeAttributes?.[name]
  const defaultValue = definition.defaultAttributes?.[name]
  const base = {
    name,
    ...(defaultValue !== undefined ? { default: defaultValue } : {}),
  }

  if (themeGroup) return { ...base, type: 'string', themeGroup }
  if (URL_ATTRIBUTES.has(name)) return { ...base, type: 'url' }
  if (BOOLEAN_ATTRIBUTES.has(name) || isBooleanValues(values))
    return { ...base, type: 'boolean', values: ['true', 'false'] }
  if (NUMBER_ATTRIBUTES[name]) return { ...base, ...NUMBER_ATTRIBUTES[name], type: 'number' }
  if (values) return { ...base, type: 'enum', values: [...values] }
  if (name === 'icon') return { ...base, type: 'string', format: 'icon' }

  return { ...base, type: 'string' }
}

function getCloseMarkers(definition: LayoutDirectiveDefinition): string[] {
  if (!definition.openMarker) return []
  if (layoutDirectiveRegistry.isGridName(definition.name)) return [':::', ':::endcol']
  if (definition.name === 'section') return [':::', ':::end', ':::endsection']

  return [':::']
}

function describeDirective(definition: LayoutDirectiveDefinition): DirectiveSpecDirective {
  const container = Boolean(definition.openMarker)
  const labelAttribute = DIRECTIVE_LABEL_ATTRIBUTES.get(definition.name)

  return {
    name: definition.name,
    attributes: [...(definition.allowedAttributes ?? [])]
      .sort()
      .map((name) => describeAttribute(definition, name)),
    ...(container ? { closeLabel: layoutDirectiveRegistry.getCloseLabel(definition.name) } : {}),
    closeMarkers: getCloseMarkers(definition),
    ...(definition.description ? { description: definition.description } : {}),
    kind: container ? 'container' : 'leaf',
    ...(labelAttribute ? { labelAttribute } : {}),
    open: definition.openMarker ?? `::${definition.name}`,
    supportsAttributes: Boolean(definition.supportsAttributes),
  }
}

const CLOSES = {
  close: 'innermost',
  closeGrid: 'grid',
  closeSection: 'section',
} as const

const CONSTRAINTS = [
  'Directive markers are recognised only at the start of a line of a top-level paragraph. Markers inside lists, blockquotes, tables or footnotes render as text and are reported.',
  'The marker must start the source line as plain text: inline code, emphasis, links, a backslash escape (\\:::) or a character reference never open a directive.',
  'Container syntax is :::name[label]{attributes}; leaf syntax is ::name[label]{attributes} on its own line.',
  'Attributes are written inside {…} as key="value", key=value, bare boolean keys, #id or .class; the block may span lines until the closing }.',
  'Unbraced key=value attributes after the marker are accepted for compatibility; any other text after a container marker is reported and the line renders as text.',
  'Quoted attribute values are literal except for CommonMark backslash escapes and character references, which are decoded.',
  'A generic ::: closes the innermost open container; :::endcol closes the nearest grid (2col, 3col); :::end and :::endsection close the nearest section.',
  'Opening a grid inside a section closes a grid that is already open in that section.',
  'Inside a grid, a heading shallower than the heading before the grid closes the grid; headings one level deeper than that start a new cell.',
  'Containers still open at the end of the document are closed automatically and reported.',
  'Unknown attributes, unknown theme names and invalid enum values are reported; the renderer falls back to defaults.',
  'Directive href attributes accept relative URLs and http, https, irc, ircs, mailto and xmpp URLs; other links are removed and reported.',
]

const TAB_EXAMPLES: Array<[string, number]> = [
  ['Install', 0],
  ['npmInstall', 1],
  ['Hello, World!', 2],
  ['日本', 3],
]

const HEADING_EXAMPLES = ['Getting Started', "What's New?", '日本語', 'API v2.0']

/**
 * The directive language as data: names, kinds, markers, attributes and
 * their types, theme groups, badge resolver tables, tab-value and heading
 * slug semantics, and parser constraints. Generated from the registry; the
 * build writes it to `dist/directive-spec.json` and the skill reference
 * copies are checked against it.
 */
export function getDirectiveSpec(): DirectiveSpec {
  const badge = layoutDirectiveRegistry.get('badge')
  const themes = Object.fromEntries(
    (Object.keys(DEFAULT_DIRECTIVE_THEMES) as DirectiveThemeGroupName[]).sort().map((group) => [
      group,
      {
        builtIn: DEFAULT_DIRECTIVE_THEMES[group].map((theme) => theme.name),
        fallback: getDirectiveFallbackThemeName(group),
      },
    ]),
  )

  return {
    badges: {
      intervals: [...(badge?.attributeValues?.interval ?? [])],
      origin: SHIELDS_BADGE_ORIGIN,
      queryAttributes: [...SHIELDS_BADGE_QUERY_ATTRIBUTES],
      requiredAttributes: Object.fromEntries(
        Object.entries(SHIELDS_BADGE_REQUIRED_ATTRIBUTES).map(([type, names]) => [type, [...names]]),
      ),
      styles: [...(badge?.attributeValues?.style ?? [])],
      targets: Object.fromEntries(
        Object.entries(SHIELDS_BADGE_TARGETS).map(([type, targets]) => [type, [...targets]]),
      ),
      types: [...(badge?.attributeValues?.type ?? [])],
    },
    closeMarkers: layoutDirectiveRegistry.closeMarkers.map(({ action, marker }) => ({
      closes: CLOSES[action as keyof typeof CLOSES],
      marker,
    })),
    constraints: CONSTRAINTS,
    directives: layoutDirectiveRegistry.all.map((definition) => describeDirective(definition)),
    headings: {
      slug: [
        'Lowercase; remove quotes; replace every run of characters other than a-z and 0-9 with "-"; trim "-"; an empty result becomes "section".',
        'Repeated slugs get -1, -2, … suffixes, skipping ids already emitted in the document.',
        'Only top-level headings and headings directly inside container directives get ids.',
      ],
      examples: HEADING_EXAMPLES.map((text) => [text, slugifyHeading(text)]),
    },
    package: '@valkyrianlabs/payload-markdown',
    specVersion: DIRECTIVE_SPEC_VERSION,
    tabs: {
      examples: TAB_EXAMPLES.map(([raw, index]) => ({ index, raw, value: slugTabValue(raw, index) })),
      value: [
        'A tab value comes from the value attribute, else the [label], else the label attribute, else tab-N (N is the 1-based tab position).',
        'It is slugged: split camelCase with "-", lowercase, replace runs of characters other than a-z and 0-9 with "-", trim "-". An empty slug becomes tab-N.',
        'Repeated values in one tabs block get -1, -2, … suffixes.',
        'tabs default="…" matches a tab value (after slugging) first, then a raw value or label; otherwise the first enabled tab is active.',
      ],
    },
    themes,
  }
}
