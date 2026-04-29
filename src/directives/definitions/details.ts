import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

const DEFAULT_DETAILS_TITLE = 'Details'

function getTitle(node: ContainerDirective): string {
  const title = node.attributes?.title

  return typeof title === 'string' && title.trim() ? title.trim() : DEFAULT_DETAILS_TITLE
}

export const detailsDirective: LayoutDirectiveDefinition = {
  name: 'details',
  allowedAttributes: ['open', 'title'],
  applyHast(node, _config, { mergeClassNames }) {
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : DEFAULT_DETAILS_TITLE
    const children = node.children

    node.properties.className = mergeClassNames(
      'my-6 rounded-xl border border-border bg-black/5 px-4 py-3 dark:bg-white/5',
      'not-prose',
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
      dataTitle: getTitle(node),
      open: node.attributes?.open === 'true',
    }
  },
  kind: 'details',
  openMarker: ':::details',
  public: true,
  supportsAttributes: true,
  tagName: 'details',
}
