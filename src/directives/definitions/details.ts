import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'

const DEFAULT_DETAILS_TITLE = 'Details'

function getTitle(node: ContainerDirective): string {
  const title = node.attributes?.title

  return typeof title === 'string' && title.trim() ? title.trim() : DEFAULT_DETAILS_TITLE
}

export const detailsDirective: LayoutDirectiveDefinition = {
  name: 'details',
  allowedAttributes: ['open', 'theme', 'title'],
  applyHast(node, config, { mergeClassNames }) {
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : DEFAULT_DETAILS_TITLE
    const theme = resolveDirectiveTheme(
      'details',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )
    const children = node.children

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
    )

    node.children = [
      {
        type: 'element',
        children: [{ type: 'text', value: title }],
        properties: {
          className: ['cursor-pointer text-sm font-semibold tracking-wide'],
        },
        tagName: 'summary',
      },
      {
        type: 'element',
        children,
        properties: {
          className: ['mt-3 space-y-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0'],
          dataDirectiveBody: 'details',
        },
        tagName: 'div',
      },
    ]
  },
  defaultAttributes: {
    title: DEFAULT_DETAILS_TITLE,
  },
  description: 'Native disclosure block for optional details.',
  editor: {
    detail: 'Static directive',
    label: 'Details',
    snippet: ':::details {title="${Details}"}\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'details',
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
      dataTitle: getTitle(node),
      open: node.attributes?.open === 'true',
    }
  },
  kind: 'details',
  openMarker: ':::details',
  public: true,
  supportsAttributes: true,
  tagName: 'details',
  themeAttributes: {
    theme: 'details',
  },
}
