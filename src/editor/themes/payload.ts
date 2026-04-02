import type { Extension } from '@codemirror/state'

import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t, Tag } from '@lezer/highlight'

const chalky = '#e5c07b',
  coral = '#e06c75',
  cursor = '#a5edff',
  cyan = '#56b6c2',
  ivory = '#c4c9d5',
  malibu = '#61afef',
  sage = '#98c379',
  selection = '#ffffff',
  selectionBackground = '#3E4451',
  stone = '#7d8799',
  violet = '#e47cd2',
  whiskey = '#d19a66'

export const color = {
  chalky,
  coral,
  cursor,
  cyan,
  ivory,
  malibu,
  sage,
  selection,
  selectionBackground,
  stone,
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
    '.cm-content ::selection': {
      backgroundColor: selectionBackground,
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: cursor,
    },
    '.cm-scroller': {
      fontFamily: 'monospace',
    },
    '.cm-selectionBackground': {
      backgroundColor: selectionBackground,
    },
    '.cm-selectionBackground, .cm-content ::selection': {
      color: selection,
    },
  },
  { dark: true },
)

// Fallback to keyword semantics when another highlighter doesn't know this tag
const mdQualifierTag = Tag.define(t.keyword)

export const payloadHighlightStyle = HighlightStyle.define([
  { color: violet, tag: mdQualifierTag },
  { color: coral, fontWeight: 'bold', tag: t.heading },
  { fontWeight: 'bold', tag: t.strong },
  { fontStyle: 'italic', tag: t.emphasis },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { color: cyan, tag: [t.link, t.url], textDecoration: 'underline' },
  { color: sage, tag: t.string },
  { color: stone, tag: [t.meta, t.comment] },
  { color: sage, tag: [t.processingInstruction, t.string, t.inserted] }
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
  markdown({
    extensions: [directiveBlock],
  }),
]
