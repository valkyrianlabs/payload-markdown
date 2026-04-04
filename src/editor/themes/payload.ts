import type { Extension } from '@codemirror/state'

import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t, Tag } from '@lezer/highlight'

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

export const payloadHighlightStyle = HighlightStyle.define([
  // Directives + language keywords
  { color: violet, tag: [mdQualifierTag, t.keyword] },

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

const directiveBlock = {
  defineNodes: [
    {
      name: 'DirectiveLine',
      block: true,
      style: mdQualifierTag,
    },
  ],

  parseBlock: [
    {
      name: 'DirectiveLine',
      before: 'HTMLBlock',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parse(cx: any, line: any) {
        const startInLine = line.pos
        const text = line.text.slice(startInLine)

        if (!text.startsWith(':::')) return false

        const from = cx.lineStart + startInLine
        const to = cx.lineStart + line.text.length

        cx.addElement(cx.elt('DirectiveLine', from, to))
        cx.nextLine()

        return true
      },
    },
  ],
}

export const payloadMarkdownTheme: Extension = [
  payloadTheme,
  syntaxHighlighting(payloadHighlightStyle),
  ...supportedLangHighlight,
  markdown({
    codeLanguages: languages,
    extensions: [directiveBlock],
  }),
]
