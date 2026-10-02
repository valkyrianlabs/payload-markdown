import type { Element, ElementContent, Root } from 'hast'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { ResolvedDirectiveTheme } from '../../directives/themes.js'
import type { MarkdownRenderConfig } from '../../types/core.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'

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

function wrapAsCell(
  children: ElementContent[],
  columnClassName?: string,
  cellTheme?: ResolvedDirectiveTheme,
): Element {
  return {
    type: 'element',
    children,
    properties: {
      className: mergeClassNames(
        cellTheme?.hookClassName ??
          'flex flex-col w-full gap-2 [&>h2]:text-2xl [&>h2]:my-4 [&>h3]:text-xl [&>h3]:my-3 [&>h4]:text-lg [&>h4]:my-2',
        cellTheme?.modifierClassName,
        cellTheme?.classes,
        columnClassName,
      ),
      dataTheme: cellTheme?.name,
      dataVlLayout: 'cell',
    },
    tagName: 'div',
  }
}

function groupChildrenIntoCells(
  children: ElementContent[],
  columnClassName?: string,
  cellTheme?: ResolvedDirectiveTheme,
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

  return groups.map((group) => wrapAsCell(group, columnClassName, cellTheme))
}

function createIdRegistry(tree: Root) {
  const used = new Set<string>()

  visit(tree, 'element', (node) => {
    const id = node.properties?.id
    if (typeof id === 'string' && id) used.add(id)
  })

  return (bases: string[]): string[] => {
    for (let suffix = 0; ; ++suffix) {
      const ids = bases.map((base) => (suffix === 0 ? base : `${base}-${suffix}`))

      if (ids.every((id) => !used.has(id))) {
        for (const id of ids) used.add(id)
        return ids
      }
    }
  }
}

export const rehypeApplyLayoutClasses: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree: Root) => {
    const reserveIds = createIdRegistry(tree)

    visit(tree, 'element', (node) => {
      if (!isElement(node)) return

      const marker = node.properties?.dataVlLayout
      if (typeof marker !== 'string') return

      const definition = layoutDirectiveRegistry.get(marker)
      if (!definition?.applyHast) return

      definition.applyHast(node, config, {
        groupChildrenIntoCells,
        mergeClassNames,
        reserveIds,
      })
    })
  }
}
