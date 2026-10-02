import type { Nodes, Paragraph, PhrasingContent, Root, Text } from 'mdast'

import { hasUnclosedDirectiveAttributeBlock } from './attributes.js'

/**
 * Shared directive line scanner.
 *
 * Directives are line-oriented: a directive marker is only recognised when a
 * paragraph line *in the source* starts with `:::` (container) or `::name`
 * (leaf), and the first node of that line is a plain text node. Inline code,
 * emphasis, links or escapes that merely render as `:::` never open a
 * directive (CORE-2). The directive text handed to the parsers is the raw
 * source slice of the line, so labels and attribute values are not
 * pre-mangled by markdown inline parsing (CORE-19).
 *
 * The renderer (remarkDirectiveLines) and the editor linter both use this
 * module, so they agree on which lines are directives.
 */

export type DirectiveLineKind = 'container' | 'leaf'

export type SourceIndex = {
  lines: string[]
  /** Offset of the first character of each 1-based line (index 0 unused). */
  lineStarts: number[]
}

export type PhrasingLine = {
  children: PhrasingContent[]
  endLine?: number
  /** Present when the line starts with a plain text piece. */
  leadingText?: string
  startLine?: number
}

export type ScannedDirectiveLine = {
  endLine: number
  /** Offset of the marker's first colon. */
  from: number
  kind: DirectiveLineKind
  /** Index of the first and last phrasing line consumed by the directive. */
  phrasingEnd: number
  phrasingStart: number
  startLine: number
  /** Raw source text of the directive, trimmed (may span lines). */
  text: string
  /** End offset of the directive's first source line. */
  to: number
}

export function createSourceIndex(source: string): SourceIndex {
  const lines = source.split(/\r?\n/)
  const lineStarts = [0]
  let offset = 0

  for (const line of lines) {
    lineStarts.push(offset)
    offset += line.length
    if (source[offset] === '\r') offset += 1
    offset += 1
  }

  return { lines: ['', ...lines], lineStarts }
}

export function getSourceLine(index: SourceIndex, line: number): string | undefined {
  return line >= 1 && line < index.lines.length ? index.lines[line] : undefined
}

function makeText(value: string): Text {
  return { type: 'text', value }
}

/**
 * Splits a paragraph into lines at newlines inside top-level text nodes (the
 * same split the original lift/button/badge scanners used) and annotates each
 * line with the source line range it covers.
 */
export function splitParagraphIntoLines(paragraph: Paragraph): PhrasingLine[] {
  const lines: PhrasingLine[] = [{ children: [] }]
  const current = () => lines[lines.length - 1]

  const noteLines = (line: PhrasingLine, start: number | undefined, end: number | undefined) => {
    if (line.children.length === 0) line.startLine = start
    line.endLine = end
  }

  for (const child of paragraph.children) {
    if (child.type !== 'text') {
      noteLines(current(), child.position?.start.line, child.position?.end.line)
      current().children.push(child)
      continue
    }

    const parts = child.value.split(/\r?\n/)
    const start = child.position?.start.line
    const end = child.position?.end.line
    // Character references such as `&#10;` put newlines into the value that do
    // not exist in the source; line numbers are unknown in that case.
    const mapped =
      typeof start === 'number' && typeof end === 'number' && end - start === parts.length - 1

    for (let index = 0; index < parts.length; ++index) {
      if (index > 0) lines.push({ children: [] })
      if (!parts[index]) continue

      const line = current()
      const sourceLine = mapped ? (start) + index : undefined

      if (line.children.length === 0) line.leadingText = parts[index]
      noteLines(line, sourceLine, sourceLine)
      line.children.push(makeText(parts[index]))
    }
  }

  return lines
}

function getPhrasingLineSource(index: SourceIndex, line: PhrasingLine): string | undefined {
  if (typeof line.startLine !== 'number' || typeof line.endLine !== 'number') return undefined
  if (line.endLine < line.startLine) return undefined

  const parts: string[] = []

  for (let number = line.startLine; number <= line.endLine; ++number) {
    const sourceLine = getSourceLine(index, number)
    if (typeof sourceLine !== 'string') return undefined
    parts.push(sourceLine)
  }

  return parts.join('\n')
}

const LEAF_MARKER_PATTERN = /^::[\w-]/

export function getDirectiveMarkerKind(text: string): DirectiveLineKind | undefined {
  const trimmed = text.trimStart()

  if (trimmed.startsWith(':::')) return 'container'
  if (LEAF_MARKER_PATTERN.test(trimmed)) return 'leaf'

  return undefined
}

/**
 * Returns the directive candidate that starts at phrasing line `lineIndex`, or
 * `undefined` when that line is ordinary prose.
 */
export function scanDirectiveLineAt(
  lines: PhrasingLine[],
  lineIndex: number,
  index: SourceIndex,
): ScannedDirectiveLine | undefined {
  const line = lines[lineIndex]
  if (!line?.leadingText || typeof line.startLine !== 'number') return undefined

  const leadingKind = getDirectiveMarkerKind(line.leadingText)
  if (!leadingKind) return undefined

  const firstSource = getPhrasingLineSource(index, line)
  if (typeof firstSource !== 'string') return undefined

  // The raw source must start with the marker too: `\:::x` (escaped) or a
  // marker produced by a character reference is prose.
  const kind = getDirectiveMarkerKind(firstSource)
  if (kind !== leadingKind) return undefined

  const firstSourceLine = getSourceLine(index, line.startLine) ?? ''
  const markerColumn = firstSourceLine.indexOf(':')
  const from = index.lineStarts[line.startLine] + Math.max(0, markerColumn)
  const to = index.lineStarts[line.startLine] + firstSourceLine.length

  let text = firstSource
  let phrasingEnd = lineIndex
  let endLine = line.endLine ?? line.startLine

  if (hasUnclosedDirectiveAttributeBlock(firstSource)) {
    let expanded = firstSource

    for (let next = lineIndex + 1; next < lines.length; ++next) {
      const nextSource = getPhrasingLineSource(index, lines[next])

      if (typeof nextSource !== 'string') break
      if (nextSource.trim().startsWith('::')) break

      expanded += `\n${nextSource}`

      if (!hasUnclosedDirectiveAttributeBlock(expanded)) {
        text = expanded
        phrasingEnd = next
        endLine = lines[next].endLine ?? endLine
        break
      }
    }
  }

  return {
    endLine,
    from,
    kind,
    phrasingEnd,
    phrasingStart: lineIndex,
    startLine: line.startLine,
    text: text.trim(),
    to,
  }
}

/** Rebuilds paragraph children from phrasing lines, re-inserting newlines. */
export function joinPhrasingLines(lines: PhrasingLine[]): PhrasingContent[] {
  const children: PhrasingContent[] = []

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) children.push(makeText('\n'))
    children.push(...line.children)
  })

  return children
}

export type NestedDirectiveContainer = 'blockquote' | 'footnote' | 'list item' | 'table'

export type NestedDirectiveMarker = {
  container: NestedDirectiveContainer
  from: number
  line: number
  marker: string
  to: number
}

function getMarkerName(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^(:{2,3}[\w-]*)/)

  return match?.[1] ?? trimmed.slice(0, 3)
}

function getContainerName(node: Nodes): NestedDirectiveContainer | undefined {
  switch (node.type) {
    case 'blockquote':
      return 'blockquote'
    case 'footnoteDefinition':
      return 'footnote'
    case 'listItem':
      return 'list item'
    case 'table':
      return 'table'
    default:
      return undefined
  }
}

/**
 * Directive markers are only recognised at the top level of the document.
 * This finds marker lines inside lists, blockquotes, tables and footnotes, so
 * the renderer and the editor can report them instead of silently printing
 * literal `:::` text (CORE-9).
 */
export function findNestedDirectiveMarkers(tree: Root, index: SourceIndex): NestedDirectiveMarker[] {
  const markers: NestedDirectiveMarker[] = []

  const inspectLines = (paragraph: Paragraph, container: NestedDirectiveContainer) => {
    for (const line of splitParagraphIntoLines(paragraph)) {
      if (!line.leadingText || !getDirectiveMarkerKind(line.leadingText)) continue

      const lineNumber = line.startLine ?? paragraph.position?.start.line ?? 1
      const sourceLine = getSourceLine(index, lineNumber) ?? ''
      const lineStart = index.lineStarts[lineNumber] ?? 0
      const column = sourceLine.indexOf(line.leadingText.trimStart().slice(0, 3))

      markers.push({
        container,
        from: lineStart + Math.max(0, column),
        line: lineNumber,
        marker: getMarkerName(line.leadingText),
        to: lineStart + sourceLine.length,
      })
    }
  }

  const walk = (node: Nodes, container: NestedDirectiveContainer | undefined) => {
    const nextContainer = getContainerName(node) ?? container

    if (node.type === 'paragraph') {
      if (nextContainer) inspectLines(node, nextContainer)
      return
    }

    if (node.type === 'tableCell') {
      inspectLines({ type: 'paragraph', children: node.children, position: node.position }, 'table')
      return
    }

    if ('children' in node) for (const child of node.children as Nodes[]) walk(child, nextContainer)
  }

  for (const child of tree.children) walk(child, undefined)

  return markers
}

export function getNestedDirectiveMarkerDiagnostic(marker: NestedDirectiveMarker): string {
  return `Directive marker "${marker.marker}" inside a ${marker.container} is not supported and is rendered as text. Directives must start at the beginning of a top-level line.`
}
