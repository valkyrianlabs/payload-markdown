import type { Heading } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'

import type {
  DirectiveChild,
  GridDirectiveName,
  LayoutDirectiveDefinition,
  LayoutDirectiveTransformContext,
} from '../types.js'

import { makeCellDirective } from './cell.js'

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

function isLayoutBoundaryDirective(name: string): boolean {
  return name === 'section' || name === '2col' || name === '3col' || name === 'cell'
}

function isStructuralDirectiveChild(
  node: DirectiveChild,
  context: LayoutDirectiveTransformContext,
): node is ContainerDirective {
  return (
    isContainerDirective(node) &&
    context.isSupportedDirectiveName(node.name) &&
    isLayoutBoundaryDirective(node.name)
  )
}

function resolveCellHeadingDepth(node: ContainerDirective): number {
  return typeof node.data?.vlCellHeadingDepth === 'number' ? node.data.vlCellHeadingDepth : 3
}

function groupGridChildren(
  children: DirectiveChild[],
  cellHeadingDepth: number,
  context: LayoutDirectiveTransformContext,
): DirectiveChild[] {
  const grouped: DirectiveChild[] = []
  let currentCell: DirectiveChild[] = []

  const flushCell = () => {
    if (currentCell.length === 0) return
    grouped.push(makeCellDirective(currentCell))
    currentCell = []
  }

  for (const child of children) {
    if (isStructuralDirectiveChild(child, context)) {
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

function createColumnDirective(name: GridDirectiveName, columns: 2 | 3): LayoutDirectiveDefinition {
  return {
    name,
    applyHast(node, config, { groupChildrenIntoCells, mergeClassNames }) {
      node.properties.className = mergeClassNames(
        'grid',
        'grid-cols-1',
        columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
        'gap-6',
        'w-full',
      )

      const hasExplicitCells = node.children.some(
        (child) =>
          child.type === 'element' && child.properties?.dataVlLayout === 'cell',
      )

      if (!hasExplicitCells)
        node.children = groupChildrenIntoCells(node.children, config.columnClassName)
    },
    editor: {
      detail: 'Layout directive',
      label: `${columns}-column layout`,
      snippet:
        columns === 2
          ? `:::${name}\n\n### ${'${First column}'}\n\n${'${Content}'}\n\n### ${'${Second column}'}\n\n${'${Content}'}\n:::endcol\n${'${}'}`
          : `:::${name}\n\n### ${'${First column}'}\n\n${'${Content}'}\n\n### ${'${Second column}'}\n\n${'${Content}'}\n\n### ${'${Third column}'}\n\n${'${Content}'}\n:::endcol\n${'${}'}`,
    },
    getMdastRenderProperties(node) {
      return {
        dataVlCellHeadingDepth: resolveCellHeadingDepth(node),
      }
    },
    kind: 'grid',
    openMarker: `:::${name}`,
    public: true,
    tagName: 'div',
    transformMdast(node, context) {
      const cellHeadingDepth = resolveCellHeadingDepth(node)
      node.children = groupGridChildren(node.children, cellHeadingDepth, context)
    },
  }
}

export const twoColumnDirective = createColumnDirective('2col', 2)
export const threeColumnDirective = createColumnDirective('3col', 3)
export const columnDirectives = [twoColumnDirective, threeColumnDirective]
