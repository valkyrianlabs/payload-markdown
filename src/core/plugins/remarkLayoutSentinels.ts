import type { Content, Heading, Paragraph, Root, Text } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

type LayoutName = '2col' | '3col' | 'section'
type LayoutNode = ContainerDirective | Root

type LayoutFrame = {
  cellHeadingDepth?: number
  name: 'root' | LayoutName
  node: LayoutNode
  parentHeadingDepth?: number
}

type Sentinel =
  | { name: LayoutName; type: 'open' }
  | { type: 'close' }
  | { type: 'closeGrid' }
  | { type: 'closeSection' }

function isParagraph(node: Content): node is Paragraph {
  return node.type === 'paragraph'
}

function isHeading(node: Content): node is Heading {
  return node.type === 'heading'
}

function isText(node: Paragraph['children'][number]): node is Text {
  return node.type === 'text'
}

function getParagraphText(node: Paragraph): null | string {
  if (!node.children.every(isText)) return null
  return node.children
    .map((child) => child.value)
    .join('')
    .trim()
}

function getSentinel(node: Content): null | Sentinel {
  if (!isParagraph(node)) return null

  const text = getParagraphText(node)
  if (!text) return null

  if (text === '%%VL_OPEN:section%%') return { name: 'section', type: 'open' }
  if (text === '%%VL_OPEN:2col%%') return { name: '2col', type: 'open' }
  if (text === '%%VL_OPEN:3col%%') return { name: '3col', type: 'open' }
  if (text === '%%VL_CLOSE%%') return { type: 'close' }
  if (text === '%%VL_CLOSE_GRID%%') return { type: 'closeGrid' }
  if (text === '%%VL_CLOSE_SECTION%%') return { type: 'closeSection' }

  return null
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

function getChildren(node: LayoutNode): Content[] {
  return node.children as Content[]
}

function top<T>(arr: T[]): T {
  return arr[arr.length - 1]
}

function isGridName(name: LayoutFrame['name']): name is '2col' | '3col' {
  return name === '2col' || name === '3col'
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

export const remarkLayoutSentinels: Plugin<[], Root> = () => {
  return (tree: Root, file) => {
    const input = [...tree.children]
    const rebuiltRoot: Root = { ...tree, children: [] }
    const stack: LayoutFrame[] = [{ name: 'root', node: rebuiltRoot }]
    const warnings: string[] = []

    let currentHeadingDepth: number | undefined

    const append = (node: Content) => getChildren(top(stack).node).push(node)

    for (const node of input) {
      const sentinel = getSentinel(node)

      if (sentinel) {
        if (sentinel.type === 'open') {
          if (sentinel.name === 'section') {
            const next = makeDirective('section')
            append(next)
            stack.push({ name: 'section', node: next })
            continue
          }

          // Opening a new grid while already inside a grid inside a section
          // rolls over to a sibling grid automatically.
          closeActiveGridInsideSection(stack)

          const parentDepth = currentHeadingDepth ?? 1
          const cellDepth = parentDepth + 1
          const next = makeDirective(sentinel.name, parentDepth, cellDepth)

          append(next)
          stack.push({
            name: sentinel.name,
            cellHeadingDepth: cellDepth,
            node: next,
            parentHeadingDepth: parentDepth,
          })
          continue
        }

        if (sentinel.type === 'close') {
          if (stack.length === 1) {
            warnings.push('Encountered ::: with no open layout block.')
            continue
          }

          closeTop(stack)
          continue
        }

        if (sentinel.type === 'closeGrid') {
          if (!closeActiveGrid(stack)) {
            warnings.push('Encountered :::endcol with no open grid.')
            continue
          }

          continue
        }

        if (sentinel.type === 'closeSection') {
          if (!closeThroughSection(stack))
            warnings.push('Encountered :::end or :::endsection with no open section.')

          continue
        }
      }

      if (isHeading(node)) {
        const currentFrame = top(stack)

        if (isGridName(currentFrame.name)) {
          const parentDepth = currentFrame.parentHeadingDepth

          // Same-level heading as the parent section remains inside the grid.
          // Only a true ascent above the parent depth auto-closes the grid.
          if (typeof parentDepth === 'number' && node.depth < parentDepth) {
            closeTop(stack)
          }
        }

        currentHeadingDepth = node.depth
        append(node)
        continue
      }

      append(node)
    }

    while (stack.length > 1) {
      warnings.push(`Auto-closing unclosed layout block: ${top(stack).name}`)
      stack.pop()
    }

    tree.children = rebuiltRoot.children

    for (const warning of warnings) file.message(warning)
  }
}
