import type { Element } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'
import { DEFAULT_CARD_LINK_SCOPE } from './card.js'

export const CARD_GRID_COLUMNS = ['1', '2', '3', '4', 'auto'] as const
export const DEFAULT_CARD_GRID_COLUMNS = '3'
export const CARDS_LINK_SCOPES = ['section', 'card', 'title'] as const
export const DEFAULT_CARDS_LINK_SCOPE = 'section'
export const FALLBACK_CARDS_LINK_SCOPE = 'card'

export type CardGridColumns = (typeof CARD_GRID_COLUMNS)[number]
export type CardsLinkScope = (typeof CARDS_LINK_SCOPES)[number]

const cardGridColumnClasses: Record<CardGridColumns, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  auto: 'grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]',
}

function isCardGridColumns(value: unknown): value is CardGridColumns {
  return typeof value === 'string' && CARD_GRID_COLUMNS.includes(value as CardGridColumns)
}

function isCardsLinkScope(value: unknown): value is CardsLinkScope {
  return typeof value === 'string' && CARDS_LINK_SCOPES.includes(value as CardsLinkScope)
}

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getBooleanAttribute(node: ContainerDirective, name: string): boolean {
  const attributes = node.attributes as
    | null
    | Record<string, boolean | null | string | undefined>
    | undefined
  const value = attributes?.[name]

  if (value === true) return true
  if (typeof value !== 'string') return false

  return value === 'true'
}

function hasAttribute(node: ContainerDirective, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(node.attributes ?? {}, name)
}

function getCardsLinkScope(node: ContainerDirective): CardsLinkScope {
  const value = node.attributes?.linkScope

  if (typeof value !== 'string') return DEFAULT_CARDS_LINK_SCOPE

  return isCardsLinkScope(value) ? value : FALLBACK_CARDS_LINK_SCOPE
}

function getLinkProperties(href: string, newTab: boolean): Element['properties'] {
  return {
    href,
    ...(newTab
      ? {
          rel: 'noopener noreferrer',
          target: '_blank',
        }
      : {}),
  }
}

function makeSectionLink(href: string, newTab: boolean): Element {
  return {
    type: 'element',
    children: [],
    properties: {
      ...getLinkProperties(href, newTab),
      ariaLabel: 'Open card section',
      className: [
        'absolute inset-0 z-10 rounded-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
      ],
      dataDirectiveLink: 'cards',
    },
    tagName: 'a',
  }
}

function hasCardLinkOverride(node: ContainerDirective): boolean {
  return ['href', 'linkScope', 'newTab'].some((name) => hasAttribute(node, name))
}

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

export function resolveCardGridColumns(node: ContainerDirective): CardGridColumns {
  const columns = node.attributes?.columns

  return isCardGridColumns(columns) ? columns : DEFAULT_CARD_GRID_COLUMNS
}

export const cardsDirective: LayoutDirectiveDefinition = {
  name: 'cards',
  allowedAttributes: ['cardTheme', 'columns', 'href', 'linkScope', 'newTab', 'theme'],
  applyHast(node, config, { mergeClassNames }) {
    const columns =
      typeof node.properties.dataColumns === 'string'
        ? node.properties.dataColumns
        : DEFAULT_CARD_GRID_COLUMNS
    const href = typeof node.properties.dataHref === 'string' ? node.properties.dataHref : undefined
    const linkScope =
      typeof node.properties.dataLinkScope === 'string' && isCardsLinkScope(node.properties.dataLinkScope)
        ? node.properties.dataLinkScope
        : DEFAULT_CARDS_LINK_SCOPE
    const newTab = node.properties.dataNewTab === 'true'
    const theme = resolveDirectiveTheme(
      'cards',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )
    const cardTheme =
      typeof node.properties.dataCardTheme === 'string' ? node.properties.dataCardTheme : undefined
    const childLinkScope = linkScope === 'title' ? 'title' : DEFAULT_CARD_LINK_SCOPE

    for (const child of node.children) {
      if (child.type !== 'element' || child.properties?.dataVlLayout !== 'card') continue

      if (typeof child.properties.dataTheme !== 'string' && cardTheme)
        child.properties.dataTheme = cardTheme

      if (href && linkScope === 'section') {
        delete child.properties.dataHref
        delete child.properties.dataLinkScope
        delete child.properties.dataNewTab
        continue
      }

      if (!href) continue

      if (typeof child.properties.dataHref !== 'string') child.properties.dataHref = href
      if (typeof child.properties.dataLinkScope !== 'string')
        child.properties.dataLinkScope = childLinkScope
      if (typeof child.properties.dataNewTab !== 'string')
        child.properties.dataNewTab = newTab ? 'true' : 'false'
    }

    node.properties.dataTheme = theme.name
    if (href) {
      node.properties.dataLinkScope = linkScope
      node.properties.dataNewTab = newTab ? 'true' : 'false'
    }
    node.properties.className = mergeClassNames(
      'not-prose my-8 grid gap-4',
      href && linkScope === 'section' ? 'relative cursor-pointer [&_a:not([data-directive-link])]:relative [&_a:not([data-directive-link])]:z-20' : undefined,
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
      cardGridColumnClasses[isCardGridColumns(columns) ? columns : DEFAULT_CARD_GRID_COLUMNS],
    )

    if (href && linkScope === 'section') node.children = [makeSectionLink(href, newTab), ...node.children]
  },
  attributeValues: {
    columns: CARD_GRID_COLUMNS,
    linkScope: CARDS_LINK_SCOPES,
    newTab: ['true', 'false'],
  },
  defaultAttributes: {
    columns: DEFAULT_CARD_GRID_COLUMNS,
    linkScope: DEFAULT_CARDS_LINK_SCOPE,
    newTab: 'false',
  },
  description: 'Responsive card grid for docs and landing-page content.',
  editor: {
    detail: 'Layout directive',
    label: 'Cards',
    snippet:
      ':::cards{\n  columns="${3}"\n}\n\n:::card[${Title}]\n${Content}\n:::\n\n:::card[${Title}]\n${Content}\n:::\n\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    const href = getAttribute(node, 'href')

    return {
      dataCardTheme: typeof node.attributes?.cardTheme === 'string' ? node.attributes.cardTheme : undefined,
      dataColumns: resolveCardGridColumns(node),
      dataDirective: 'cards',
      dataHref: href,
      dataLinkScope: href || hasAttribute(node, 'linkScope') ? getCardsLinkScope(node) : undefined,
      dataNewTab: href && hasAttribute(node, 'newTab')
        ? getBooleanAttribute(node, 'newTab') ? 'true' : 'false'
        : undefined,
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
    }
  },
  kind: 'cards',
  openMarker: ':::cards',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  themeAttributes: {
    cardTheme: 'card',
    theme: 'cards',
  },
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.columns === 'string' && !isCardGridColumns(attributes.columns))
      warnings.push(
        `Invalid cards columns "${attributes.columns}". Falling back to "${DEFAULT_CARD_GRID_COLUMNS}".`,
      )

    if (typeof attributes.linkScope === 'string' && !isCardsLinkScope(attributes.linkScope))
      warnings.push(
        `Invalid cards linkScope "${attributes.linkScope}". Falling back to "${FALLBACK_CARDS_LINK_SCOPE}".`,
      )

    return warnings
  },
  validateMdast(node) {
    const warnings: string[] = []

    if (getAttribute(node, 'href') && getCardsLinkScope(node) === 'section') {
      const hasOverrides = node.children.some(
        (child) => isContainerDirective(child) && child.name === 'card' && hasCardLinkOverride(child),
      )

      if (hasOverrides)
        warnings.push(
          'Directive "cards" with linkScope="section" ignores child "card" link overrides.',
        )
    }

    return warnings
  },
}
