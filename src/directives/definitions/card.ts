import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

export const CARD_CLASS_NAMES =
  'group rounded-2xl border border-border bg-black/5 p-5 shadow-sm transition-colors dark:bg-white/5'
export const CARD_BODY_CLASS_NAMES = 'space-y-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0'
export const CARD_TITLE_CLASS_NAMES = 'mb-3 text-lg font-semibold tracking-tight'

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function makeTitle(title: string, href?: string): Element {
  const children: ElementContent[] = href
    ? [
        {
          type: 'element',
          children: [{ type: 'text', value: title }],
          properties: {
            href,
          },
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
  allowedAttributes: ['eyebrow', 'href', 'title'],
  applyHast(node, _config, { mergeClassNames }) {
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined
    const href = typeof node.properties.dataHref === 'string' ? node.properties.dataHref : undefined
    const eyebrow =
      typeof node.properties.dataEyebrow === 'string' ? node.properties.dataEyebrow : undefined
    const children = node.children

    node.properties.className = mergeClassNames('not-prose', CARD_CLASS_NAMES)
    node.children = [
      ...(eyebrow ? [makeEyebrow(eyebrow)] : []),
      ...(title ? [makeTitle(title, href)] : []),
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
  description: 'Card content block with optional title, eyebrow, and title link.',
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
      dataTitle: getAttribute(node, 'title'),
    }
  },
  kind: 'card',
  openMarker: ':::card',
  public: true,
  supportsAttributes: true,
  tagName: 'article',
}
