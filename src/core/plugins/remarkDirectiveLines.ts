import type { Paragraph, Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'

import type { PhrasingLine, SourceIndex } from '../../directives/lineScanner.js'
import type { MarkdownRenderConfig } from '../../types/core.js'

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
import { makeBadgeDirective } from './directiveBadge.js'
import { makeButtonDirective } from './directiveButton.js'

const SUPPORTED_LEAF_DIRECTIVE_NAMES = new Set(['badge', 'button'])

type WarningBuckets = {
  badge: string[]
  button: string[]
  layout: string[]
}

function makeSink(target: string[]) {
  return {
    message(reason: string) {
      target.push(reason)
    },
  }
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

    if (scanned.kind === 'container') {
      const result = layoutDirectiveRegistry.parseMarkdownLineDetailed(scanned.text)

      warnings.layout.push(...result.diagnostics)

      if (result.token) lineIndex = emit(result.token, scanned.phrasingEnd)
      else pending.push(lines[lineIndex])

      continue
    }

    const leafName = getLeafDirectiveName(scanned.text)

    if (!leafName) {
      pending.push(lines[lineIndex])
      continue
    }

    if (!SUPPORTED_LEAF_DIRECTIVE_NAMES.has(leafName)) {
      warnings.button.push(`Unknown directive "${leafName}".`)
      pending.push(lines[lineIndex])
      continue
    }

    const bucket = leafName === 'button' ? warnings.button : warnings.badge
    const problem = getLeafDirectiveProblem(scanned.text, leafName)

    if (problem) {
      bucket.push(problem)
      pending.push(lines[lineIndex])
      continue
    }

    const directive =
      leafName === 'button'
        ? makeButtonDirective(scanned.text, makeSink(bucket), config)
        : makeBadgeDirective(scanned.text, makeSink(bucket))

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

    for (const warning of [...warnings.layout, ...warnings.button, ...warnings.badge])
      file.message(warning)

    for (const marker of nestedMarkers) file.message(getNestedDirectiveMarkerDiagnostic(marker))
  }
}
