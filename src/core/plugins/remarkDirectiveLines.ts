import type { Paragraph, Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'

import type { PhrasingLine, ScannedDirectiveLine, SourceIndex } from '../../directives/lineScanner.js'
import type { MarkdownRenderConfig } from '../../types/core.js'
import type { DiagnosticPlace } from '../diagnostics.js'

import { getLeafDirectiveName, getLeafDirectiveProblem } from '../../directives/leafSyntax.js'
import {
  createSourceIndex,
  findNestedDirectiveMarkers,
  getNestedDirectiveMarkerDiagnostic,
  joinPhrasingLines,
  scanDirectiveLineAt,
  splitParagraphIntoLines,
} from '../../directives/lineScanner.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { placeAt, reportDiagnostic } from '../diagnostics.js'
import { makeBadgeDirective } from './directiveBadge.js'
import { makeButtonDirective } from './directiveButton.js'

type PlacedWarning = {
  place?: DiagnosticPlace
  reason: string
}

type WarningBuckets = {
  badge: PlacedWarning[]
  button: PlacedWarning[]
  layout: PlacedWarning[]
}

function makeSink(target: PlacedWarning[], place: DiagnosticPlace | undefined) {
  return {
    message(reason: string) {
      target.push({ place, reason })
    },
  }
}

function getScannedPlace(scanned: ScannedDirectiveLine, index: SourceIndex): DiagnosticPlace {
  return placeAt(scanned.startLine, index.lineStarts[scanned.startLine] ?? 0, scanned.from)
}

function splitParagraph(
  node: Paragraph,
  index: SourceIndex,
  warnings: WarningBuckets,
  config: MarkdownRenderConfig,
): RootContent[] {
  const lines = splitParagraphIntoLines(node)
  const out: RootContent[] = []
  let pending: PhrasingLine[] = []
  let changed = false

  const flush = () => {
    if (pending.length > 0) out.push({ type: 'paragraph', children: joinPhrasingLines(pending) })
    pending = []
  }

  const emit = (replacement: RootContent, endIndex: number) => {
    flush()
    out.push(replacement)
    changed = true

    return endIndex
  }

  for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
    const scanned = scanDirectiveLineAt(lines, lineIndex, index)

    if (!scanned) {
      pending.push(lines[lineIndex])
      continue
    }

    const place = getScannedPlace(scanned, index)
    const push = (bucket: PlacedWarning[], reason: string) => bucket.push({ place, reason })

    if (scanned.kind === 'container') {
      const result = layoutDirectiveRegistry.parseMarkdownLineDetailed(scanned.text)

      for (const reason of result.diagnostics) push(warnings.layout, reason)

      if (result.token) {
        // The open/close marker's position, for compile-stage diagnostics.
        result.token.data = { ...result.token.data, vlPlace: place }
        lineIndex = emit(result.token, scanned.phrasingEnd)
      } else pending.push(lines[lineIndex])

      continue
    }

    const leafName = getLeafDirectiveName(scanned.text)

    if (!leafName) {
      pending.push(lines[lineIndex])
      continue
    }

    if (!layoutDirectiveRegistry.isLeafDirectiveName(leafName)) {
      push(warnings.button, `Unknown directive "${leafName}".`)
      pending.push(lines[lineIndex])
      continue
    }

    const bucket = leafName === 'button' ? warnings.button : warnings.badge
    const problem = getLeafDirectiveProblem(scanned.text, leafName)

    if (problem) {
      push(bucket, problem)
      pending.push(lines[lineIndex])
      continue
    }

    const directive =
      leafName === 'button'
        ? makeButtonDirective(scanned.text, makeSink(bucket, place), config)
        : makeBadgeDirective(scanned.text, makeSink(bucket, place))

    if (directive) lineIndex = emit(directive as RootContent, scanned.phrasingEnd)
    else pending.push(lines[lineIndex])
  }

  if (!changed) return [node]

  flush()

  return out
}

/**
 * Lifts directive lines out of root-level paragraphs: `:::` markers become
 * layout tokens for remarkCompileLayouts, and `::button` / `::badge` lines
 * become leaf directive nodes. Detection is source-based (see lineScanner).
 *
 * Warnings keep the historical order: container-line diagnostics, then
 * button/unknown-leaf diagnostics, then badge diagnostics, followed by
 * markers found inside lists, blockquotes, tables or footnotes.
 */
export const remarkDirectiveLines: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree, file) => {
    const index = createSourceIndex(String(file.value ?? ''))
    const warnings: WarningBuckets = { badge: [], button: [], layout: [] }
    const nestedMarkers = findNestedDirectiveMarkers(tree, index)

    tree.children = tree.children.flatMap((node): RootContent[] =>
      node.type === 'paragraph' ? splitParagraph(node, index, warnings, config) : [node],
    )

    for (const { place, reason } of [...warnings.layout, ...warnings.button, ...warnings.badge])
      reportDiagnostic(file, reason, { place, source: 'directive' })

    for (const marker of nestedMarkers)
      reportDiagnostic(file, getNestedDirectiveMarkerDiagnostic(marker), {
        code: 'nested-directive-marker',
        place: placeAt(marker.line, index.lineStarts[marker.line] ?? 0, marker.from),
        source: 'directive',
      })
  }
}
