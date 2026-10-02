import type { Paragraph } from 'mdast'

import type { ScannedDirectiveLine } from './lineScanner.js'

import { createSourceIndex, scanDirectiveLineAt, splitParagraphIntoLines } from './lineScanner.js'
import { layoutDirectiveRegistry } from './registry.js'
import { parseDirectiveSourceTree } from './sourceTree.js'

export type DirectiveCloseLabel = {
  from: number
  kind: 'suffix' | 'widget'
  label: string
  line: number
  to: number
}

type OpenFrame = {
  name: string
  /** Heading depth the grid was opened under (grids only). */
  parentHeadingDepth?: number
}

type CloseLabelState = {
  currentHeadingDepth?: number
  labels: DirectiveCloseLabel[]
  stack: OpenFrame[]
}

function findNearestFrameIndex(stack: OpenFrame[], predicate: (frame: OpenFrame) => boolean) {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (predicate(frame)) return index
  }

  return -1
}

const isGridFrame = (frame: OpenFrame) => layoutDirectiveRegistry.isGridName(frame.name)

function applyContainerLine(state: CloseLabelState, scanned: ScannedDirectiveLine) {
  const { labels, stack } = state
  const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(scanned.text).token
  const markerEnd = scanned.from + 3

  if (!token) return

  if (token.action === 'open') {
    const isGrid = layoutDirectiveRegistry.isGridName(token.name)

    if (isGrid) {
      // remarkCompileLayouts closes an open grid inside the nearest section.
      const gridIndex = findNearestFrameIndex(stack, isGridFrame)
      const sectionIndex = findNearestFrameIndex(stack, (frame) => frame.name === 'section')

      if (gridIndex >= 0 && sectionIndex >= 0 && gridIndex > sectionIndex) stack.splice(gridIndex)
    }

    stack.push({
      name: token.name,
      ...(isGrid ? { parentHeadingDepth: state.currentHeadingDepth ?? 1 } : {}),
    })
    return
  }

  if (token.action === 'close') {
    const frame = stack.pop()

    if (frame)
      labels.push({
        from: markerEnd,
        kind: 'widget',
        label: layoutDirectiveRegistry.getCloseLabel(frame.name),
        line: scanned.startLine,
        to: markerEnd,
      })
    return
  }

  const isGridClose = token.action === 'closeGrid'
  const frameIndex = findNearestFrameIndex(stack, (frame) =>
    isGridClose ? isGridFrame(frame) : frame.name === 'section',
  )

  if (frameIndex >= 0) stack.splice(frameIndex)

  labels.push({
    from: markerEnd,
    kind: 'suffix',
    label: isGridClose ? 'endcol' : scanned.text.slice(3) || 'endsection',
    line: scanned.startLine,
    to: scanned.from + scanned.text.length,
  })
}

/** Mirrors remarkCompileLayouts: a heading shallower than a grid's parent heading closes the grid. */
function applyHeading(state: CloseLabelState, depth: number) {
  const top = state.stack[state.stack.length - 1]

  if (
    top &&
    isGridFrame(top) &&
    typeof top.parentHeadingDepth === 'number' &&
    depth < top.parentHeadingDepth
  )
    state.stack.pop()

  state.currentHeadingDepth = depth
}

function applyParagraph(
  state: CloseLabelState,
  paragraph: Paragraph,
  index: ReturnType<typeof createSourceIndex>,
) {
  const lines = splitParagraphIntoLines(paragraph)

  for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
    const scanned = scanDirectiveLineAt(lines, lineIndex, index)
    if (!scanned) continue

    if (scanned.kind === 'container') applyContainerLine(state, scanned)

    lineIndex = scanned.phrasingEnd
  }
}

/**
 * Editor-only labels for directive closers: a widget naming the block a bare
 * `:::` closes, and a suffix mark on `:::endcol`, `:::end` and `:::endsection`.
 *
 * Directive lines are found with the renderer's front end and shared line
 * scanner, so markers inside code blocks, lists, blockquotes, HTML or inline
 * code are not treated as closers, and the block a `:::` closes follows the
 * renderer's layout stack (including grids closed by a shallower heading or
 * by a new grid inside the same section).
 */
export function getDirectiveCloseLabels(markdown: string): DirectiveCloseLabel[] {
  const state: CloseLabelState = { labels: [], stack: [] }
  const index = createSourceIndex(markdown)
  const tree = parseDirectiveSourceTree(markdown)

  for (const node of tree.children) {
    if (node.type === 'paragraph') applyParagraph(state, node, index)
    else if (node.type === 'heading') applyHeading(state, node.depth)
  }

  return state.labels
}
