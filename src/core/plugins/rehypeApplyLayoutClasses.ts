import type { Element, ElementContent, Root } from 'hast'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownConfig } from '../types.js'

function compactClassNames(...values: Array<string | undefined>): string[] {
  return values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? [])
}

function mergeClassNames(...values: Array<string | undefined>): string[] {
  const tokens = compactClassNames(...values)
  const seen = new Set<string>()
  const out: string[] = []

  for (let i = tokens.length - 1; i >= 0; --i) {
    const token = tokens[i]
    if (seen.has(token)) continue
    seen.add(token)
    out.push(token)
  }

  return out.reverse()
}

function isElement(node: unknown): node is Element {
  return Boolean(
    node && typeof node === 'object' && 'type' in node && (node as Element).type === 'element',
  )
}

function isCellBoundary(node: ElementContent): boolean {
  return isElement(node) && ['h2', 'h3', 'h4'].includes(node.tagName)
}

function wrapAsCell(children: ElementContent[], columnClassName?: string): Element {
  return {
    type: 'element',
    children,
    properties: {
      className: mergeClassNames(
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
        columnClassName,
      ),
      dataVlLayout: 'cell',
    },
    tagName: 'div',
  }
}

function groupChildrenIntoCells(
  children: ElementContent[],
  columnClassName?: string,
): ElementContent[] {
  const groups: ElementContent[][] = []
  let current: ElementContent[] = []

  for (const child of children) {
    if (isCellBoundary(child) && current.length > 0) {
      groups.push(current)
      current = [child]
      continue
    }

    current.push(child)
  }

  if (current.length > 0) groups.push(current)

  return groups.map((group) => wrapAsCell(group, columnClassName))
}

export const rehypeApplyLayoutClasses: Plugin<[MarkdownConfig?], Root> = ({
  columnClassName,
  sectionClassName,
}: MarkdownConfig = {}) => {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!isElement(node)) return

      const marker = node.properties?.dataVlLayout

      if (marker === 'section') {
        node.properties.className = mergeClassNames(
          'bg-black/50',
          'w-full',
          'backdrop-blur-2xl',
          'rounded-xl',
          'p-6',
          'my-8',
          'space-y-6',
          '[&>h1]:my-2',
          '[&>h1]:text-4xl',
          '[&>h1]:font-semibold',
          sectionClassName,
        )
        return
      }

      if (marker === 'cell') {
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
          columnClassName,
        )
        return
      }

      if (marker === '2col' || marker === '3col') {
        node.properties.className = mergeClassNames(
          'grid',
          'grid-cols-1',
          marker === '2col' ? 'md:grid-cols-2' : 'md:grid-cols-3',
          'gap-6',
          'w-full',
        )

        const hasExplicitCells = node.children.some(
          (child) => isElement(child) && child.properties?.dataVlLayout === 'cell',
        )

        if (!hasExplicitCells)
          node.children = groupChildrenIntoCells(node.children, columnClassName)

        return
      }
    })
  }
}
