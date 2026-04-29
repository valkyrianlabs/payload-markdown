import type { Heading, Root, RootContent } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import type { LayoutName, LayoutToken } from '../../directives/types.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'

type LayoutNode = ContainerDirective | Root

type AppendableRootContent = Exclude<RootContent, LayoutToken>

type LayoutFrame = {
  cellHeadingDepth?: number
  name: 'root' | LayoutName
  node: LayoutNode
  parentHeadingDepth?: number
}

function isHeading(node: RootContent): node is Heading {
  return node.type === 'heading'
}

function isLayoutToken(node: RootContent): node is LayoutToken {
  return node.type === 'vlLayoutToken'
}

function isAppendableRootContent(node: RootContent): node is AppendableRootContent {
  return node.type !== 'vlLayoutToken'
}

function makeDirective(
  name: LayoutName,
  parentHeadingDepth?: number,
  cellHeadingDepth?: number,
): ContainerDirective {
  return {
    name,
    type: 'containerDirective',
    attributes: {},
    children: [],
    data: {
      vlCellHeadingDepth: cellHeadingDepth,
      vlParentHeadingDepth: parentHeadingDepth,
    },
  }
}

function getChildren(node: LayoutNode): AppendableRootContent[] {
  return node.children as AppendableRootContent[]
}

function top<T>(arr: T[]): T {
  return arr[arr.length - 1]
}

function isGridName(name: LayoutFrame['name']): name is '2col' | '3col' {
  return layoutDirectiveRegistry.isGridName(name)
}

function findNearestSectionIndex(stack: LayoutFrame[]): number {
  for (let i = stack.length - 1; i >= 0; --i) if (stack[i]?.name === 'section') return i

  return -1
}

function findNearestGridIndex(stack: LayoutFrame[]): number {
  for (let i = stack.length - 1; i >= 0; --i) if (isGridName(stack[i]?.name)) return i

  return -1
}

function closeTop(stack: LayoutFrame[]) {
  if (stack.length > 1) stack.pop()
}

function closeActiveGrid(stack: LayoutFrame[]): boolean {
  const gridIndex = findNearestGridIndex(stack)
  if (gridIndex < 0) return false

  while (stack.length - 1 >= gridIndex) stack.pop()

  return true
}

function closeActiveGridInsideSection(stack: LayoutFrame[]): boolean {
  const gridIndex = findNearestGridIndex(stack)
  const sectionIndex = findNearestSectionIndex(stack)

  if (gridIndex < 0 || sectionIndex < 0) return false
  if (gridIndex < sectionIndex) return false

  while (stack.length - 1 >= gridIndex) stack.pop()

  return true
}

function closeThroughSection(stack: LayoutFrame[]): boolean {
  const sectionIndex = findNearestSectionIndex(stack)
  if (sectionIndex < 0) return false

  while (stack.length - 1 >= sectionIndex) stack.pop()

  return true
}

export const remarkCompileLayouts: Plugin<[], Root> = () => {
  return (tree, file) => {
    const input = [...tree.children]
    const rebuiltRoot: Root = { ...tree, children: [] }
    const stack: LayoutFrame[] = [{ name: 'root', node: rebuiltRoot }]
    const warnings: string[] = []

    let currentHeadingDepth: number | undefined

    const append = (node: AppendableRootContent) => getChildren(top(stack).node).push(node)

    for (const node of input) {
      if (isLayoutToken(node)) {
        if (node.action === 'open') {
          if (node.name === 'section') {
            const next = makeDirective('section')
            append(next)
            stack.push({ name: 'section', node: next })
            continue
          }

          if (node.name === 'cell') {
            const next = makeDirective('cell')
            append(next)
            stack.push({ name: 'cell', node: next })
            continue
          }

          closeActiveGridInsideSection(stack)

          const parentDepth = currentHeadingDepth ?? 1
          const cellDepth = parentDepth + 1
          const next = makeDirective(node.name, parentDepth, cellDepth)

          append(next)
          stack.push({
            name: node.name,
            cellHeadingDepth: cellDepth,
            node: next,
            parentHeadingDepth: parentDepth,
          })
          continue
        }

        if (node.action === 'close') {
          if (stack.length === 1) {
            warnings.push('Encountered ::: with no open layout block.')
            continue
          }

          closeTop(stack)
          continue
        }

        if (node.action === 'closeGrid') {
          if (!closeActiveGrid(stack)) {
            warnings.push('Encountered :::endcol with no open grid.')
            continue
          }

          continue
        }

        if (node.action === 'closeSection') {
          if (!closeThroughSection(stack))
            warnings.push('Encountered :::end or :::endsection with no open section.')

          continue
        }
      }

      if (isHeading(node)) {
        const currentFrame = top(stack)

        if (isGridName(currentFrame.name)) {
          const parentDepth = currentFrame.parentHeadingDepth

          if (typeof parentDepth === 'number' && node.depth < parentDepth) closeTop(stack)
        }

        currentHeadingDepth = node.depth
        append(node)
        continue
      }

      if (isAppendableRootContent(node)) append(node)
    }

    while (stack.length > 1) {
      warnings.push(`Auto-closing unclosed layout block: ${top(stack).name}`)
      stack.pop()
    }

    tree.children = rebuiltRoot.children

    for (const warning of warnings) file.message(warning)
  }
}
