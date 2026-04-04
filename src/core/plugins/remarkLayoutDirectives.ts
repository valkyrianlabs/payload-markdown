import type { Heading, Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownConfig } from '../types.d.js'

type DirectiveChild = ContainerDirective['children'][number]
type LayoutDirectiveName = '2col' | '3col' | 'cell' | 'section'

const GRID_DIRECTIVES = new Set<LayoutDirectiveName>(['2col', '3col'])
const SUPPORTED_DIRECTIVES = new Set<LayoutDirectiveName>(['2col', '3col', 'cell', 'section'])

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
    typeof node === 'object' &&
    'type' in node &&
    (node as { type?: string }).type === 'containerDirective',
  )
}

function isSupportedDirective(name: string): name is LayoutDirectiveName {
  return SUPPORTED_DIRECTIVES.has(name as LayoutDirectiveName)
}

function isGridDirective(name: string): name is Extract<LayoutDirectiveName, '2col' | '3col'> {
  return GRID_DIRECTIVES.has(name as LayoutDirectiveName)
}

function isHeading(node: DirectiveChild): node is Heading {
  return node.type === 'heading'
}

function makeCell(children: DirectiveChild[]): ContainerDirective {
  return {
    name: 'cell',
    type: 'containerDirective',
    attributes: {},
    children,
    data: {
      hName: 'div',
      hProperties: {
        className: ['flex', 'flex-col', 'gap-2', '[&>h2]:text-2xl', '[&>h2]:my-4'],
      },
    },
  }
}

function groupGridChildren(children: DirectiveChild[]): DirectiveChild[] {
  const out: DirectiveChild[] = []
  let cell: DirectiveChild[] = []

  const flush = () => {
    if (cell.length === 0) return
    out.push(makeCell(cell))
    cell = []
  }

  for (const child of children) {
    if (isHeading(child) && child.depth === 2) {
      flush()
      cell.push(child)
      continue
    }

    if (cell.length > 0) {
      cell.push(child)
      continue
    }

    out.push(child)
  }

  flush()
  return out
}

export const remarkLayoutDirectives: Plugin<[MarkdownConfig?], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isContainerDirective(node)) return
      if (!isSupportedDirective(node.name)) return

      const data = (node.data ??= {})

      if (node.name === 'section') {
        data.hName = 'section'
        data.hProperties = {
          dataVlLayout: 'section',
        }
        return
      }

      if (node.name === 'cell') {
        data.hName = 'div'
        data.hProperties = {
          dataVlLayout: 'cell',
        }
        return
      }

      if (isGridDirective(node.name)) {
        node.children = groupGridChildren(node.children)

        data.hName = 'div'
        data.hProperties = {
          dataVlLayout: node.name,
        }
      }
    })
  }
}
