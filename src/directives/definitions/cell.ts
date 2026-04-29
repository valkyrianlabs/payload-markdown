import type { ContainerDirective } from 'mdast-util-directive'

import type { DirectiveChild, LayoutDirectiveDefinition } from '../types.js'

import { setDirectiveRenderData } from '../renderData.js'

export const cellDirective: LayoutDirectiveDefinition = {
  name: 'cell',
  applyHast(node, config, { mergeClassNames }) {
    node.properties.className = mergeClassNames(
      'flex',
      'flex-col',
      'w-full',
      'gap-2',
      '[&>h2]:text-2xl',
      '[&>h2]:my-4',
      '[&>h3]:text-xl',
      '[&>h3]:my-3',
      '[&>h4]:text-lg',
      '[&>h4]:my-2',
      config.columnClassName,
    )
  },
  editor: {
    label: 'Layout cell',
    snippet: ':::cell\n\n:::\n',
  },
  kind: 'cell',
  openMarker: ':::cell',
  tagName: 'div',
}

export function makeCellDirective(children: DirectiveChild[]): ContainerDirective {
  const node: ContainerDirective = {
    name: 'cell',
    type: 'containerDirective',
    attributes: {},
    children,
    data: {},
  }

  setDirectiveRenderData(node, cellDirective)

  return node
}
