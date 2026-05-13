import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'

export const CARD_BODY_CLASS_NAMES = 'space-y-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0'
export const CARD_TITLE_CLASS_NAMES = 'mb-3 text-lg font-semibold tracking-tight'
export const CARD_LINK_SCOPES = ['full', 'title'] as const
export const DEFAULT_CARD_LINK_SCOPE = 'full'

type CardLinkScope = (typeof CARD_LINK_SCOPES)[number]

function isCardLinkScope(value: unknown): value is CardLinkScope {
  return typeof value === 'string' && CARD_LINK_SCOPES.includes(value as CardLinkScope)
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

function getLinkScope(node: ContainerDirective): CardLinkScope {
  const value = node.attributes?.linkScope

  return isCardLinkScope(value) ? value : DEFAULT_CARD_LINK_SCOPE
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

function makeTitle(title: string, href?: string, newTab = false): Element {
  const children: ElementContent[] = href
    ? [
        {
          type: 'element',
          children: [{ type: 'text', value: title }],
          properties: getLinkProperties(href, newTab),
          tagName: 'a',
        },
      ]
    : [{ type: 'text', value: title }]

  return {
    type: 'element',
    children,
    properties: {
      className: [CARD_TITLE_CLASS_NAMES],
      dataDirectiveTitle: 'card',
    },
    tagName: 'h3',
  }
}

function makeFullCardLink(href: string, title: string | undefined, newTab: boolean): Element {
  return {
    type: 'element',
    children: [],
    properties: {
      ...getLinkProperties(href, newTab),
      ariaLabel: title ? `Open ${title}` : 'Open card',
      className: [
        'absolute inset-0 z-10 rounded-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
      ],
      dataDirectiveLink: 'card',
    },
    tagName: 'a',
  }
}

function makeEyebrow(eyebrow: string): Element {
  return {
    type: 'element',
    children: [{ type: 'text', value: eyebrow }],
    properties: {
      className: ['mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'],
      dataDirectiveEyebrow: 'card',
    },
    tagName: 'p',
  }
}

export const cardDirective: LayoutDirectiveDefinition = {
  name: 'card',
  allowedAttributes: ['eyebrow', 'href', 'linkScope', 'newTab', 'theme', 'title'],
  applyHast(node, config, { mergeClassNames }) {
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined
    const href = typeof node.properties.dataHref === 'string' ? node.properties.dataHref : undefined
    const linkScope =
      typeof node.properties.dataLinkScope === 'string' && isCardLinkScope(node.properties.dataLinkScope)
        ? node.properties.dataLinkScope
        : DEFAULT_CARD_LINK_SCOPE
    const newTab = node.properties.dataNewTab === 'true'
    const eyebrow =
      typeof node.properties.dataEyebrow === 'string' ? node.properties.dataEyebrow : undefined
    const theme = resolveDirectiveTheme(
      'card',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )
    const children = node.children

    node.properties.dataTheme = theme.name
    if (href) {
      node.properties.dataLinkScope = linkScope
      node.properties.dataNewTab = newTab ? 'true' : 'false'
    }
    node.properties.className = mergeClassNames(
      'not-prose',
      href && linkScope === 'full' ? 'relative cursor-pointer [&_a:not([data-directive-link])]:relative [&_a:not([data-directive-link])]:z-20' : undefined,
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
    )
    node.children = [
      ...(href && linkScope === 'full' ? [makeFullCardLink(href, title, newTab)] : []),
      ...(eyebrow ? [makeEyebrow(eyebrow)] : []),
      ...(title ? [makeTitle(title, href && linkScope === 'title' ? href : undefined, newTab)] : []),
      {
        type: 'element',
        children,
        properties: {
          className: [CARD_BODY_CLASS_NAMES],
          dataDirectiveBody: 'card',
        },
        tagName: 'div',
      },
    ]
  },
  attributeValues: {
    linkScope: CARD_LINK_SCOPES,
    newTab: ['true', 'false'],
  },
  defaultAttributes: {
    linkScope: DEFAULT_CARD_LINK_SCOPE,
    newTab: 'false',
  },
  description: 'Card content block with optional title, eyebrow, and card link.',
  editor: {
    detail: 'Layout directive',
    label: 'Card',
    snippet: ':::card {title="${Title}"}\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'card',
      dataEyebrow: getAttribute(node, 'eyebrow'),
      dataHref: getAttribute(node, 'href'),
      dataLinkScope: getLinkScope(node),
      dataNewTab: getBooleanAttribute(node, 'newTab') ? 'true' : 'false',
      dataTheme: getAttribute(node, 'theme'),
      dataTitle: getAttribute(node, 'title'),
    }
  },
  kind: 'card',
  openMarker: ':::card',
  public: true,
  supportsAttributes: true,
  tagName: 'article',
  themeAttributes: {
    theme: 'card',
  },
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.linkScope === 'string' && !isCardLinkScope(attributes.linkScope))
      warnings.push(
        `Invalid card linkScope "${attributes.linkScope}". Falling back to "${DEFAULT_CARD_LINK_SCOPE}".`,
      )

    return warnings
  },
}
