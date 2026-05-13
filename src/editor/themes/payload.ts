import type { Extension } from '@codemirror/state'

import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t, Tag } from '@lezer/highlight'

import { hasUnclosedDirectiveAttributeBlock } from '../../directives/attributes.js'
import { supportedLangHighlight } from './support/highlighters.js'
import { languages } from './support/lang.js'

const activeLine = '#6699ff0b',
  bracketMatch = '#bad0f847',
  chalky = '#e5c07b',
  coral = '#e06c75',
  cursor = '#a5edff',
  cyan = '#56b6c2',
  highlightBackground = '#2c313a',
  invalid = '#ff6b81',
  ivory = '#c4c9d5',
  malibu = '#61afef',
  sage = '#98c379',
  searchMatch = '#72a1ff59',
  searchMatchOutline = '#457dff',
  selection = '#ffffff',
  selectionBackground = '#3E4451',
  selectionMatch = '#aafe661a',
  stone = '#7d8799',
  tooltipBackground = '#353a42',
  violet = '#e47cd2',
  whiskey = '#d19a66'

export const color = {
  activeLine,
  bracketMatch,
  chalky,
  coral,
  cursor,
  cyan,
  highlightBackground,
  invalid,
  ivory,
  malibu,
  sage,
  searchMatch,
  searchMatchOutline,
  selection,
  selectionBackground,
  selectionMatch,
  stone,
  tooltipBackground,
  violet,
  whiskey,
}

export const payloadTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      color: ivory,
      fontSize: '1.05rem',
    },

    '.cm-content': {
      caretColor: cursor,
      padding: '0.75rem',
    },

    '.cm-scroller': {
      fontFamily: 'monospace',
    },

    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: cursor,
    },

    '.cm-selectionBackground': {
      backgroundColor: selectionBackground,
    },

    '.cm-content ::selection': {
      backgroundColor: selectionBackground,
      color: selection,
    },

    '.cm-selectionBackground, .cm-content ::selection': {
      color: selection,
    },

    '.cm-activeLine': {
      backgroundColor: activeLine,
    },

    '.cm-selectionMatch': {
      backgroundColor: selectionMatch,
    },

    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: bracketMatch,
    },

    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: stone,
    },

    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
    },

    '.cm-searchMatch': {
      backgroundColor: searchMatch,
      outline: `1px solid ${searchMatchOutline}`,
    },

    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#6199ff2f',
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: ivory,
    },

    '.cm-tooltip': {
      backgroundColor: tooltipBackground,
      border: 'none',
      color: ivory,
    },

    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderBottomColor: 'transparent',
      borderTopColor: 'transparent',
    },

    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderBottomColor: tooltipBackground,
      borderTopColor: tooltipBackground,
    },

    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: highlightBackground,
        color: ivory,
      },
    },
  },
  { dark: true },
)

// Keep custom directive highlighting compatible with keyword semantics
const mdQualifierTag = Tag.define(t.keyword)
const mdLeafDirectiveTag = Tag.define(t.keyword)
const mdDirectiveArgNameTag = Tag.define(t.propertyName)
const mdDirectiveArgValueTag = Tag.define(t.string)
const mdDirectiveBraceTag = Tag.define(t.separator)
const mdDirectiveLabelTag = Tag.define(t.labelName)

export const payloadHighlightStyle = HighlightStyle.define([
  // Directives + language keywords
  { color: violet, tag: [mdQualifierTag, t.keyword] },
  { color: '#d7a7df', tag: mdLeafDirectiveTag },
  { color: coral, tag: mdDirectiveArgNameTag },
  { color: sage, tag: mdDirectiveArgValueTag },
  { color: stone, tag: mdDirectiveBraceTag },
  { color: malibu, tag: mdDirectiveLabelTag },

  // Names / identifiers that should read warm
  { color: coral, tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName] },

  // Functions and labels should pop cooler like JetBrains method names
  { color: malibu, tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName] },

  // Constants / enum-like / builtins
  {
    color: whiskey,
    tag: [
      t.color,
      t.constant(t.name),
      t.standard(t.name),
      t.atom,
      t.bool,
      t.special(t.variableName),
    ],
  },

  // Definitions and separators
  { color: ivory, tag: [t.definition(t.name), t.separator] },

  // Types / classes / annotations / namespaces / numerics
  {
    color: chalky,
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
  },

  // Operators / escapes / urls / regex / special strings
  {
    color: cyan,
    tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
  },

  // Comments + meta
  { color: stone, tag: [t.meta, t.comment] },

  // Markdown emphasis
  { fontWeight: 'bold', tag: t.strong },
  { fontStyle: 'italic', tag: t.emphasis },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { color: stone, tag: t.link, textDecoration: 'underline' },
  { color: coral, fontWeight: 'bold', tag: t.heading },

  // Strings / inserted text / processing-ish constructs
  { color: sage, tag: [t.processingInstruction, t.string, t.inserted] },

  // Actually-invalid syntax should look wrong
  { color: invalid, tag: t.invalid },
])

type MarkdownConfig = Extract<
  NonNullable<NonNullable<Parameters<typeof markdown>[0]>['extensions']>,
  { parseBlock?: unknown }
>

type MarkdownLine = {
  pos: number
  text: string
}

// @lezer/markdown's Element type is not a direct package dependency here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownElement = any

type DirectiveParseContext = {
  elt: (type: string, from: number, to: number, children?: readonly MarkdownElement[]) => MarkdownElement
  lineStart: number
}

function isDirectiveLine(line: MarkdownLine): boolean {
  return line.text.slice(line.pos).startsWith(':::')
}

function isLeafDirectiveLine(line: MarkdownLine): boolean {
  return /^::button(?:$|[\s[{])/.test(line.text.slice(line.pos))
}

function skipInlineSpace(text: string, index: number): number {
  let next = index

  while (next < text.length && /\s/.test(text[next])) ++next

  return next
}

function parseQuotedValue(
  cx: DirectiveParseContext,
  text: string,
  lineStart: number,
  index: number,
): { elements: MarkdownElement[]; index: number } {
  const quote = text[index]
  let end = index + 1

  while (end < text.length) {
    if (text[end] === '\\') {
      end += 2
      continue
    }

    if (text[end] === quote) {
      end += 1
      break
    }

    ++end
  }

  return {
    elements: [cx.elt('DirectiveAttributeValue', lineStart + index, lineStart + end)],
    index: end,
  }
}

function parseBareValue(
  cx: DirectiveParseContext,
  text: string,
  lineStart: number,
  index: number,
): { elements: MarkdownElement[]; index: number } {
  let end = index

  while (end < text.length && !/[\s}]/.test(text[end])) ++end

  return end > index
    ? {
        elements: [cx.elt('DirectiveAttributeValue', lineStart + index, lineStart + end)],
        index: end,
      }
    : {
        elements: [],
        index,
      }
}

function parseAttributeElements(
  cx: DirectiveParseContext,
  text: string,
  lineStart: number,
  startIndex: number,
): MarkdownElement[] {
  const elements: MarkdownElement[] = []
  let index = startIndex

  while (index < text.length) {
    const char = text[index]

    if (char === '{' || char === '}') {
      elements.push(cx.elt('DirectiveBrace', lineStart + index, lineStart + index + 1))
      ++index
      continue
    }

    if (/\s/.test(char)) {
      ++index
      continue
    }

    if (/[\w-]/.test(char)) {
      const nameStart = index

      while (index < text.length && /[\w-]/.test(text[index])) ++index

      const nameEnd = index
      const equalsIndex = skipInlineSpace(text, index)

      if (text[equalsIndex] !== '=') continue

      elements.push(cx.elt('DirectiveAttributeName', lineStart + nameStart, lineStart + nameEnd))
      index = skipInlineSpace(text, equalsIndex + 1)

      if (text[index] === '"' || text[index] === "'") {
        const parsed = parseQuotedValue(cx, text, lineStart, index)
        elements.push(...parsed.elements)
        index = parsed.index
        continue
      }

      const parsed = parseBareValue(cx, text, lineStart, index)
      elements.push(...parsed.elements)
      index = parsed.index
      continue
    }

    ++index
  }

  return elements
}

function parseDirectiveLineElements(
  cx: DirectiveParseContext,
  line: MarkdownLine,
  leaf: boolean,
): MarkdownElement[] {
  const text = line.text
  const start = line.pos
  const lineStart = cxLineStart(cx)
  const directiveMatch = text.slice(start).match(leaf ? /^::button(?=$|[\s[{])/ : /^:::[\w-]*/)
  const directiveText = directiveMatch?.[0]?.trimEnd()

  if (!directiveText) return []

  const nameTo = start + directiveText.length
  const elements = [
    cx.elt(
      leaf ? 'LeafDirectiveName' : 'DirectiveName',
      lineStart + start,
      lineStart + nameTo,
    ),
  ]
  let cursor = skipInlineSpace(text, nameTo)

  if (text[cursor] === '[') {
    const labelEnd = text.indexOf(']', cursor + 1)

    if (labelEnd >= 0) {
      elements.push(cx.elt('DirectiveLabel', lineStart + cursor, lineStart + labelEnd + 1))
      cursor = skipInlineSpace(text, labelEnd + 1)
    }
  }

  const braceIndex = text.indexOf('{', cursor)
  if (braceIndex >= 0) elements.push(...parseAttributeElements(cx, text, lineStart, braceIndex))

  return elements
}

function parseDirectiveAttributeContinuationElements(
  cx: DirectiveParseContext,
  line: MarkdownLine,
): MarkdownElement[] {
  return parseAttributeElements(cx, line.text, cxLineStart(cx), line.pos)
}

function cxLineStart(cx: { lineStart: number }): number {
  return cx.lineStart
}

function addDirectiveBlock(
  cx: {
    addElement: (element: MarkdownElement) => void
    elt: (type: string, from: number, to: number, children?: readonly MarkdownElement[]) => MarkdownElement
    lineStart: number
    nextLine: () => boolean
    peekLine: () => string
  },
  line: MarkdownLine,
  blockName: 'DirectiveLine' | 'LeafDirectiveLine',
  leaf: boolean,
) {
  const from = cx.lineStart + line.pos
  const children = parseDirectiveLineElements(cx, line, leaf)
  let collectedText = line.text.slice(line.pos)
  let to = cx.lineStart + line.text.length

  while (hasUnclosedDirectiveAttributeBlock(collectedText)) {
    if (cx.peekLine().trim().startsWith('::')) break
    if (!cx.nextLine()) break

    collectedText += `\n${line.text}`
    to = cx.lineStart + line.text.length
    children.push(...parseDirectiveAttributeContinuationElements(cx, line))
  }

  cx.addElement(cx.elt(blockName, from, to, children))
  cx.nextLine()
}

const directiveBlock = {
  defineNodes: [
    {
      name: 'DirectiveLine',
      block: true,
    },
    {
      name: 'LeafDirectiveLine',
      block: true,
    },
    {
      name: 'DirectiveName',
      style: mdQualifierTag,
    },
    {
      name: 'LeafDirectiveName',
      style: mdLeafDirectiveTag,
    },
    {
      name: 'DirectiveLabel',
      style: mdDirectiveLabelTag,
    },
    {
      name: 'DirectiveAttributeName',
      style: mdDirectiveArgNameTag,
    },
    {
      name: 'DirectiveAttributeValue',
      style: mdDirectiveArgValueTag,
    },
    {
      name: 'DirectiveBrace',
      style: mdDirectiveBraceTag,
    },
  ],

  parseBlock: [
    {
      name: 'LeafDirectiveLine',
      before: 'HTMLBlock',
      endLeaf(_cx, line) {
        return isLeafDirectiveLine(line)
      },
      parse(cx, line) {
        if (!isLeafDirectiveLine(line)) return false

        addDirectiveBlock(cx, line, 'LeafDirectiveLine', true)

        return true
      },
    },
    {
      name: 'DirectiveLine',
      before: 'HTMLBlock',
      endLeaf(_cx, line) {
        return isDirectiveLine(line)
      },
      parse(cx, line) {
        if (!isDirectiveLine(line)) return false

        addDirectiveBlock(cx, line, 'DirectiveLine', false)

        return true
      },
    },
  ],
} satisfies MarkdownConfig

export const payloadMarkdownTheme: Extension = [
  payloadTheme,
  syntaxHighlighting(payloadHighlightStyle),
  ...supportedLangHighlight,
  markdown({
    codeLanguages: languages,
    extensions: [directiveBlock],
  }),
]
