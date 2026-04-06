import type { Heading, Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

type DirectiveChild = ContainerDirective['children'][number]
type GridDirectiveName = '2col' | '3col'
type LayoutDirectiveName = 'cell' | 'section' | GridDirectiveName

const GRID_DIRECTIVES = new Set<GridDirectiveName>(['2col', '3col'])
const SUPPORTED_DIRECTIVES = new Set<LayoutDirectiveName>(['2col', '3col', 'cell', 'section'])

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
    typeof node === 'object' &&
    'type' in node &&
    (node as { type?: string }).type === 'containerDirective',
  )
}

function isHeading(node: DirectiveChild): node is Heading {
  return node.type === 'heading'
}

function isSupportedDirective(name: string): name is LayoutDirectiveName {
  return SUPPORTED_DIRECTIVES.has(name as LayoutDirectiveName)
}

function isGridDirective(name: string): name is GridDirectiveName {
  return GRID_DIRECTIVES.has(name as GridDirectiveName)
}

function isStructuralDirectiveChild(node: DirectiveChild): node is ContainerDirective {
  return isContainerDirective(node) && isSupportedDirective(node.name)
}

function setDirectiveRenderData(
  node: ContainerDirective,
  tagName: 'div' | 'section',
  layout: LayoutDirectiveName,
  extraProperties?: Record<string, unknown>,
) {
  const data = (node.data ??= {})
  data.hName = tagName
  data.hProperties = {
    ...(data.hProperties ?? {}),
    dataVlLayout: layout,
    ...(extraProperties ?? {}),
  }
}

function makeCell(children: DirectiveChild[]): ContainerDirective {
  const node: ContainerDirective = {
    type: 'containerDirective',
    name: 'cell',
    attributes: {},
    children,
    data: {},
  }

  setDirectiveRenderData(node, 'div', 'cell')
  return node
}

function resolveCellHeadingDepth(node: ContainerDirective): number {
  return typeof node.data?.vlCellHeadingDepth === 'number' ? node.data.vlCellHeadingDepth : 3
}

function groupGridChildren(children: DirectiveChild[], cellHeadingDepth: number): DirectiveChild[] {
  const grouped: DirectiveChild[] = []
  let currentCell: DirectiveChild[] = []

  const flushCell = () => {
    if (currentCell.length === 0) return
    grouped.push(makeCell(currentCell))
    currentCell = []
  }

  for (const child of children) {
    if (isStructuralDirectiveChild(child)) {
      flushCell()
      grouped.push(child)
      continue
    }

    if (isHeading(child) && child.depth === cellHeadingDepth) flushCell()

    currentCell.push(child)
  }

  flushCell()
  return grouped
}

function transformDirective(node: ContainerDirective) {
  if (node.name === 'section') {
    setDirectiveRenderData(node, 'section', 'section')
    return
  }

  if (node.name === 'cell') {
    setDirectiveRenderData(node, 'div', 'cell')
    return
  }

  if (isGridDirective(node.name)) {
    const cellHeadingDepth = resolveCellHeadingDepth(node)
    node.children = groupGridChildren(node.children, cellHeadingDepth)

    setDirectiveRenderData(node, 'div', node.name, {
      dataVlCellHeadingDepth: cellHeadingDepth,
    })
  }
}

export const remarkLayoutDirectives: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isContainerDirective(node)) return
      if (!isSupportedDirective(node.name)) return
      transformDirective(node)
    })
  }
}
