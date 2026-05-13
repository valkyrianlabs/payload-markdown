import type { LayoutName } from './types.js'

import { layoutDirectiveRegistry } from './registry.js'

export type DirectiveCloseLabel = {
  from: number
  kind: 'suffix' | 'widget'
  label: string
  line: number
  to: number
}

type OpenFrame = {
  name: LayoutName
}

function isFenceLine(trimmed: string): boolean {
  return trimmed.startsWith('```') || trimmed.startsWith('~~~')
}

function findNearestFrameIndex(stack: OpenFrame[], predicate: (frame: OpenFrame) => boolean) {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (predicate(frame)) return index
  }

  return -1
}

function getCloseLabel(name: LayoutName): string {
  return layoutDirectiveRegistry.isGridName(name) ? 'endcol' : `end${name}`
}

function makeExplicitLabel(
  label: string,
  line: number,
  markerFrom: number,
  markerTo: number,
): DirectiveCloseLabel {
  return {
    from: markerFrom + 3,
    kind: 'suffix',
    label,
    line,
    to: markerTo,
  }
}

function makeWidgetLabel(
  label: string,
  line: number,
  markerFrom: number,
): DirectiveCloseLabel {
  return {
    from: markerFrom + 3,
    kind: 'widget',
    label,
    line,
    to: markerFrom + 3,
  }
}

export function getDirectiveCloseLabels(markdown: string): DirectiveCloseLabel[] {
  const labels: DirectiveCloseLabel[] = []
  const stack: OpenFrame[] = []
  const lines = markdown.split(/\r?\n/)
  let offset = 0
  let inFence = false

  for (let index = 0; index < lines.length; ++index) {
    const line = lines[index]
    const trimmed = line.trim()
    const lineStart = offset
    const markerStart = line.indexOf(':::')
    const markerFrom = markerStart >= 0 ? lineStart + markerStart : lineStart
    const markerTo = markerFrom + trimmed.length

    if (isFenceLine(trimmed)) {
      inFence = !inFence
      offset += line.length + 1
      continue
    }

    if (!inFence && trimmed.startsWith(':::')) {
      const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(trimmed).token

      if (token?.action === 'open') stack.push({ name: token.name })

      if (token?.action === 'close') {
        const frame = stack.pop()
        if (frame) labels.push(makeWidgetLabel(getCloseLabel(frame.name), index + 1, markerFrom))
      }

      if (token?.action === 'closeGrid') {
        const frameIndex = findNearestFrameIndex(stack, (frame) =>
          layoutDirectiveRegistry.isGridName(frame.name),
        )

        if (frameIndex >= 0) stack.splice(frameIndex)
        labels.push(makeExplicitLabel('endcol', index + 1, markerFrom, markerTo))
      }

      if (token?.action === 'closeSection') {
        const frameIndex = findNearestFrameIndex(stack, (frame) => frame.name === 'section')

        if (frameIndex >= 0) stack.splice(frameIndex)
        labels.push(
          makeExplicitLabel(trimmed.slice(3) || 'endsection', index + 1, markerFrom, markerTo),
        )
      }
    }

    offset += line.length + 1
  }

  return labels
}
