import type { Root } from 'mdast'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import type { MarkdownDirectiveThemes } from '../types/core.js'
import type { TabsDefaultCandidate } from './definitions/tab.js'
import type { ScannedDirectiveLine, SourceIndex } from './lineScanner.js'

import { normalizePayloadMarkdownIconRef } from '../icons/refs.js'
import { parseButtonDirectiveLine } from './buttonSyntax.js'
import { getTabRawValue, resolveTabsDefault, slugTabValue } from './definitions/tab.js'
import { getLeafDirectiveName, getLeafDirectiveProblem, parseLeafDirectiveLine } from './leafSyntax.js'
import {
  createSourceIndex,
  findNestedDirectiveMarkers,
  getNestedDirectiveMarkerDiagnostic,
  scanDirectiveLineAt,
  splitParagraphIntoLines,
} from './lineScanner.js'
import { layoutDirectiveRegistry } from './registry.js'
import { resolveShieldsBadge } from './shields.js'
import { getDirectiveFallbackThemeName, hasDirectiveTheme } from './themes.js'
import { isSafeHref } from './urls.js'

export type DirectiveDiagnostic = {
  from: number
  line: number
  message: string
  severity: 'warning'
  to: number
}

type OpenFrame = {
  cardsHasHref?: boolean
  cardsLinkScope?: string
  defaultValue?: string
  from: number
  hasContent?: boolean
  line: number
  name: string
  parentHeadingDepth?: number
  tabCandidates?: TabsDefaultCandidate[]
  tabCount?: number
  tabValues?: Map<string, number>
}

type LintState = {
  currentHeadingDepth?: number
  options: LintMarkdownDirectivesOptions
  stack: OpenFrame[]
}

export type LintMarkdownDirectivesOptions = {
  /**
   * Configured icon pack aliases. When provided, icon refs to other packs are
   * reported exactly like the renderer does ("Unknown icon pack").
   */
  iconPacks?: readonly string[]
  /** Configured directive themes (names are what matters). */
  themes?: MarkdownDirectiveThemes
}

function getIconPackDiagnostics(icon: unknown, options: LintMarkdownDirectivesOptions): string[] {
  if (typeof icon !== 'string' || !options.iconPacks) return []

  const normalized = normalizePayloadMarkdownIconRef(icon)
  if (!normalized.icon || options.iconPacks.includes(normalized.icon.packAlias)) return []

  return [`Unknown icon pack "${normalized.icon.packAlias}".`]
}

const SUPPORTED_LEAF_DIRECTIVE_NAMES = new Set(['badge', 'button'])

function findNearestFrameIndex(stack: OpenFrame[], predicate: (frame: OpenFrame) => boolean) {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (predicate(frame)) return index
  }

  return -1
}

function getTabValue(
  attributes: Record<string, boolean | string> | undefined,
  index: number,
  label?: string,
): string {
  return slugTabValue(getTabRawValue(attributes, label) ?? `tab-${index + 1}`, index)
}

const TOC_CONTENT_DIAGNOSTIC =
  'Directive "toc" contains authored content; it is rendered after the generated table of contents. Close ":::toc" with ":::" on the next line.'

function finalizeFrame(frame: OpenFrame): string[] {
  if (frame.name === 'toc') return frame.hasContent ? [TOC_CONTENT_DIAGNOSTIC] : []

  return finalizeTabsFrame(frame)
}

function finalizeTabsFrame(frame: OpenFrame): string[] {
  if (frame.name !== 'tabs') return []

  const diagnostics: string[] = []
  const tabValues = frame.tabValues ?? new Map<string, number>()

  if (!frame.tabCount) diagnostics.push('Directive "tabs" has no child "tab" directives.')

  for (const [value, count] of tabValues)
    if (count > 1) diagnostics.push(`Duplicate tab value "${value}" in "tabs".`)

  if (frame.defaultValue && !resolveTabsDefault(frame.defaultValue, frame.tabCandidates ?? []))
    diagnostics.push(`Invalid tabs default "${frame.defaultValue}". Falling back to the first tab.`)

  return diagnostics
}

function findNearestTabsFrame(stack: OpenFrame[]): OpenFrame | undefined {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (frame.name === 'tabs') return frame
  }

  return undefined
}

function findNearestCardsFrame(stack: OpenFrame[]): OpenFrame | undefined {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (frame.name === 'cards') return frame
  }

  return undefined
}

function hasAttribute(
  attributes: Record<string, boolean | string> | undefined,
  name: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(attributes ?? {}, name)
}

function popFrames(stack: OpenFrame[], index: number): string[] {
  return stack.splice(index).flatMap((frame) => finalizeFrame(frame))
}

function markTopFrameContent(state: LintState) {
  const top = state.stack[state.stack.length - 1]
  if (top) top.hasContent = true
}

/** Mirrors remarkCompileLayouts: a heading shallower than a grid's parent heading closes the grid. */
function applyHeading(state: LintState, depth: number): string[] {
  markTopFrameContent(state)

  const top = state.stack[state.stack.length - 1]
  const diagnostics =
    top &&
    layoutDirectiveRegistry.isGridName(top.name) &&
    typeof top.parentHeadingDepth === 'number' &&
    depth < top.parentHeadingDepth
      ? popFrames(state.stack, state.stack.length - 1)
      : []

  state.currentHeadingDepth = depth

  return diagnostics
}

function updateOpenStack(
  state: LintState,
  text: string,
  line: number,
  from: number,
): string[] {
  const { stack } = state
  const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(text).token
  const diagnostics: string[] = []

  if (!token) return diagnostics

  if (token.action === 'open') {
    markTopFrameContent(state)

    if (token.name === 'card') {
      const cardsFrame = findNearestCardsFrame(stack)
      const cardsSectionLink =
        cardsFrame?.cardsHasHref &&
        (cardsFrame.cardsLinkScope === undefined || cardsFrame.cardsLinkScope === 'section')

      if (
        cardsSectionLink &&
        (hasAttribute(token.attributes, 'href') ||
          hasAttribute(token.attributes, 'linkScope') ||
          hasAttribute(token.attributes, 'newTab'))
      )
        diagnostics.push(
          'Directive "cards" with linkScope="section" ignores child "card" link overrides.',
        )
    }

    if (token.name === 'tab') {
      const tabsFrame = findNearestTabsFrame(stack)

      if (!tabsFrame) diagnostics.push('Directive "tab" is usually intended inside "tabs".')
      else {
        const nextIndex = tabsFrame.tabCount ?? 0
        const value = getTabValue(token.attributes, nextIndex, token.label)

        tabsFrame.tabCandidates ??= []
        tabsFrame.tabCandidates.push({
          label: getTabRawValue({ label: token.attributes?.label ?? '' }, token.label) ?? `Tab ${nextIndex + 1}`,
          raw: getTabRawValue(token.attributes),
          value,
        })
        tabsFrame.tabCount = nextIndex + 1
        tabsFrame.tabValues ??= new Map<string, number>()
        tabsFrame.tabValues.set(value, (tabsFrame.tabValues.get(value) ?? 0) + 1)
      }
    }

    const isGrid = layoutDirectiveRegistry.isGridName(token.name)

    if (isGrid) {
      // remarkCompileLayouts closes an open grid inside the nearest section.
      const gridIndex = findNearestFrameIndex(stack, (frame) =>
        layoutDirectiveRegistry.isGridName(frame.name),
      )
      const sectionIndex = findNearestFrameIndex(stack, (frame) => frame.name === 'section')

      if (gridIndex >= 0 && sectionIndex >= 0 && gridIndex > sectionIndex)
        diagnostics.push(...popFrames(stack, gridIndex))
    }

    stack.push({
      name: token.name,
      from,
      line,
      ...(isGrid ? { parentHeadingDepth: state.currentHeadingDepth ?? 1 } : {}),
      ...(token.name === 'cards'
        ? {
            cardsHasHref:
              typeof token.attributes?.href === 'string' && isSafeHref(token.attributes.href.trim()),
            cardsLinkScope:
              typeof token.attributes?.linkScope === 'string'
                ? token.attributes.linkScope
                : undefined,
          }
        : {}),
      ...(token.name === 'tabs'
        ? {
            defaultValue:
              typeof token.attributes?.default === 'string'
                ? token.attributes.default
                : undefined,
            tabCount: 0,
            tabValues: new Map<string, number>(),
          }
        : {}),
    })
    return diagnostics
  }

  if (token.action === 'close') {
    if (stack.length === 0) return ['Encountered ::: with no open layout block.']

    return popFrames(stack, stack.length - 1)
  }

  if (token.action === 'closeGrid') {
    const index = findNearestFrameIndex(stack, (frame) =>
      layoutDirectiveRegistry.isGridName(frame.name),
    )

    if (index < 0) return ['Encountered :::endcol with no open grid.']

    return popFrames(stack, index)
  }

  const index = findNearestFrameIndex(stack, (frame) => frame.name === 'section')
  if (index < 0) return ['Encountered :::end or :::endsection with no open section.']

  return popFrames(stack, index)
}

function getThemeDiagnostics(text: string, options: LintMarkdownDirectivesOptions): string[] {
  const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(text).token
  if (!token || token.action !== 'open') return []

  const definition = layoutDirectiveRegistry.get(token.name)
  const diagnostics: string[] = [...getIconPackDiagnostics(token.attributes?.icon, options)]

  if (!definition?.themeAttributes) return diagnostics

  for (const [attribute, groupName] of Object.entries(definition.themeAttributes)) {
    if (!groupName) continue

    const value = token.attributes?.[attribute]
    if (typeof value !== 'string' || !value.trim()) continue
    if (hasDirectiveTheme(groupName, value, options.themes)) continue

    const label = attribute === 'theme' ? 'theme' : attribute
    diagnostics.push(
      `Unknown ${label} "${value}" on "${token.name}". Falling back to "${getDirectiveFallbackThemeName(groupName, options.themes)}".`,
    )
  }

  return diagnostics
}

function getButtonDiagnostics(text: string, options: LintMarkdownDirectivesOptions): string[] {
  const parsed = parseButtonDirectiveLine(text)
  if (!parsed) return []

  const definition = layoutDirectiveRegistry.get('button')
  const diagnostics = [
    ...parsed.warnings,
    ...(definition?.validateAttributes?.({ name: 'button', attributes: parsed.attributes }) ?? []),
  ]
  const icon = parsed.attributes.icon

  if (typeof icon === 'string') {
    const normalized = normalizePayloadMarkdownIconRef(icon)
    if (normalized.warning) diagnostics.push(normalized.warning)
  }

  if (!parsed.label.trim() && typeof parsed.attributes.ariaLabel !== 'string')
    diagnostics.push('Icon-only button requires an ariaLabel attribute.')

  return [...diagnostics, ...getIconPackDiagnostics(icon, options)]
}

function getBadgeDiagnostics(text: string): string[] {
  const parsed = parseLeafDirectiveLine(text, 'badge')
  if (!parsed) return []

  const definition = layoutDirectiveRegistry.get('badge')
  const resolved = resolveShieldsBadge(parsed.attributes)

  return [
    ...parsed.warnings,
    ...(definition?.validateAttributes?.({ name: 'badge', attributes: parsed.attributes }) ?? []),
    ...resolved.warnings,
  ]
}

const markdownParser = unified().use(remarkParse).use(remarkGfm).freeze()

type DiagnosticSink = (message: string, from: number, to: number, line: number) => void

function lintContainerLine(state: LintState, scanned: ScannedDirectiveLine, push: DiagnosticSink) {
  const report = (message: string) => push(message, scanned.from, scanned.to, scanned.startLine)
  const result = layoutDirectiveRegistry.parseMarkdownLineDetailed(scanned.text)

  for (const message of result.diagnostics) report(message)
  for (const message of getThemeDiagnostics(scanned.text, state.options)) report(message)
  for (const message of updateOpenStack(state, scanned.text, scanned.startLine, scanned.from))
    report(message)

  // Tokens that do not open/close anything render as prose inside the frame.
  if (!result.token) markTopFrameContent(state)
}

function lintLeafLine(state: LintState, scanned: ScannedDirectiveLine, push: DiagnosticSink) {
  const report = (message: string) => push(message, scanned.from, scanned.to, scanned.startLine)
  const leafName = getLeafDirectiveName(scanned.text)

  markTopFrameContent(state)

  if (!leafName) return

  if (!SUPPORTED_LEAF_DIRECTIVE_NAMES.has(leafName)) {
    report(`Unknown directive "${leafName}".`)
    return
  }

  const problem = getLeafDirectiveProblem(scanned.text, leafName)

  if (problem) {
    report(problem)
    return
  }

  const messages =
    leafName === 'button'
      ? getButtonDiagnostics(scanned.text, state.options)
      : getBadgeDiagnostics(scanned.text)

  for (const message of messages) report(message)
}

function lintParagraph(
  state: LintState,
  paragraph: Root['children'][number],
  index: SourceIndex,
  push: DiagnosticSink,
) {
  if (paragraph.type !== 'paragraph') return

  const lines = splitParagraphIntoLines(paragraph)

  for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
    const scanned = scanDirectiveLineAt(lines, lineIndex, index)

    if (!scanned) {
      markTopFrameContent(state)
      continue
    }

    if (scanned.kind === 'container') lintContainerLine(state, scanned, push)
    else lintLeafLine(state, scanned, push)

    lineIndex = scanned.phrasingEnd
  }
}

/**
 * Editor-side directive diagnostics. The document is parsed with the same
 * remark/GFM front end and the same directive line scanner as the renderer,
 * so code blocks, lists, blockquotes and prose are classified identically.
 * Every renderer warning about directive syntax has an editor counterpart;
 * the renderer's "Auto-closing unclosed layout block: X" is reported here as
 * "Unclosed directive "X"." at the opening marker.
 */
export function lintMarkdownDirectives(
  markdown: string,
  options: LintMarkdownDirectivesOptions = {},
): DirectiveDiagnostic[] {
  const diagnostics: DirectiveDiagnostic[] = []
  const state: LintState = { options, stack: [] }
  const index = createSourceIndex(markdown)
  const tree = markdownParser.parse(markdown)

  const push: DiagnosticSink = (message, from, to, line) =>
    diagnostics.push({ from, line, message, severity: 'warning', to })

  const nested = findNestedDirectiveMarkers(tree, index)
  let nestedIndex = 0

  const flushNestedBefore = (line: number) => {
    while (nestedIndex < nested.length && nested[nestedIndex].line < line) {
      const marker = nested[nestedIndex++]
      push(getNestedDirectiveMarkerDiagnostic(marker), marker.from, marker.to, marker.line)
    }
  }

  for (const node of tree.children) {
    flushNestedBefore(
      ('position' in node ? node.position?.start.line : undefined) ?? Number.POSITIVE_INFINITY,
    )

    if (node.type === 'paragraph') {
      lintParagraph(state, node, index, push)
      continue
    }

    if (node.type === 'heading') {
      const line = node.position?.start.line ?? 1
      const from = index.lineStarts[line] ?? 0

      for (const message of applyHeading(state, node.depth)) push(message, from, from, line)
      continue
    }

    markTopFrameContent(state)
  }

  flushNestedBefore(Number.POSITIVE_INFINITY)

  for (const frame of state.stack) {
    for (const message of finalizeFrame(frame))
      push(message, frame.from, frame.from + frame.name.length + 3, frame.line)

    push(`Unclosed directive "${frame.name}".`, frame.from, frame.from + frame.name.length + 3, frame.line)
  }

  return diagnostics
}
