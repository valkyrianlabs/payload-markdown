import type { Extension } from '@codemirror/state'

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

import { supported as s } from './lang.js'

type HighlightRule = Parameters<typeof HighlightStyle.define>[0][number]

const scopedHighlight = (rules: HighlightRule[], language: { language: unknown }): Extension =>
  syntaxHighlighting(
    HighlightStyle.define(rules, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scope: language.language as any,
    }),
  )

const palette = {
  clionCpp: {
    name: '#a9b7c6',
    type: '#ffc66d',
    comment: '#808080',
    constant: '#ffc66d',
    func: '#56a8f5',
    keyword: '#cc7832',
    meta: '#c792ea',
    number: '#6897bb',
    operator: '#9876aa',
    string: '#6a8759',
  },
  data: {
    name: '#e5c07b',
    comment: '#7d8799',
    constant: '#e5c07b',
    keyword: '#c678dd',
    number: '#d19a66',
    operator: '#56b6c2',
    string: '#98c379',
  },
  jetbrainsJava: {
    name: '#a9b7c6',
    type: '#ffc66d',
    comment: '#808080',
    constant: '#ffc66d',
    func: '#56a8f5',
    keyword: '#cc7832',
    number: '#6897bb',
    operator: '#9876aa',
    string: '#6a8759',
  },
  markup: {
    name: '#c4c9d5',
    attr: '#d19a66',
    comment: '#7d8799',
    func: '#61afef',
    keyword: '#e06c75',
    meta: '#c678dd',
    operator: '#56b6c2',
    string: '#98c379',
  },
  monokai: {
    name: '#f8f8f2',
    type: '#66d9ef',
    comment: '#75715e',
    constant: '#fd971f',
    func: '#a6e22e',
    keyword: '#f92672',
    meta: '#75715e',
    number: '#ae81ff',
    operator: '#f92672',
    string: '#a6e22e',
  },
  nord: {
    name: '#d8dee9',
    type: '#8fbcbb',
    comment: '#616e88',
    constant: '#ebcb8b',
    func: '#5e81ac',
    keyword: '#81a1c1',
    meta: '#616e88',
    number: '#b48ead',
    operator: '#88c0d0',
    string: '#a3be8c',
  },
  oneDark: {
    name: '#e06c75',
    type: '#e5c07b',
    comment: '#7d8799',
    constant: '#d19a66',
    func: '#61afef',
    keyword: '#c678dd',
    meta: '#7d8799',
    number: '#d19a66',
    operator: '#56b6c2',
    string: '#98c379',
  },
  style: {
    name: '#e06c75',
    type: '#56b6c2',
    comment: '#7d8799',
    constant: '#e5c07b',
    func: '#61afef',
    keyword: '#c678dd',
    number: '#d19a66',
    operator: '#56b6c2',
    string: '#98c379',
  },
}

export const angularHighlight = scopedHighlight(
  [
    { color: palette.markup.keyword, tag: t.keyword },
    { color: palette.markup.name, tag: [t.name] },
    { color: palette.markup.attr, tag: [t.propertyName, t.attributeName] },
    { color: palette.markup.string, tag: [t.string, t.special(t.string)] },
    { color: palette.markup.comment, tag: [t.comment] },
    { color: palette.markup.meta, tag: [t.meta, t.annotation] },
    { color: palette.markup.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.markup.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
  ],
  s.angular,
)

export const cppHighlight = scopedHighlight(
  [
    { color: palette.clionCpp.keyword, tag: t.keyword },
    { color: palette.clionCpp.name, tag: [t.name, t.definition(t.name), t.separator] },
    { color: palette.clionCpp.type, tag: [t.typeName, t.className] },
    { color: palette.clionCpp.number, tag: t.number },
    { color: palette.clionCpp.string, tag: [t.string, t.special(t.string)] },
    { color: palette.clionCpp.comment, tag: [t.comment] },
    { color: palette.clionCpp.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.clionCpp.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.clionCpp.meta, tag: [t.meta, t.macroName, t.processingInstruction] },
    { color: palette.clionCpp.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.cpp,
)

export const cssHighlight = scopedHighlight(
  [
    { color: palette.style.keyword, tag: t.keyword },
    { color: palette.style.name, tag: [t.name, t.propertyName] },
    { color: palette.style.type, tag: [t.typeName, t.className, t.labelName] },
    { color: palette.style.number, tag: [t.number] },
    { color: palette.style.string, tag: [t.string, t.special(t.string)] },
    { color: palette.style.comment, tag: [t.comment, t.meta] },
    { color: palette.style.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.style.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.style.constant, tag: [t.color, t.constant(t.name), t.standard(t.name)] },
  ],
  s.css,
)

export const goHighlight = scopedHighlight(
  [
    { color: palette.nord.keyword, tag: t.keyword },
    { color: palette.nord.name, tag: [t.name, t.definition(t.name)] },
    { color: palette.nord.type, tag: [t.typeName, t.className] },
    { color: palette.nord.number, tag: t.number },
    { color: palette.nord.string, tag: [t.string, t.special(t.string)] },
    { color: palette.nord.comment, tag: [t.comment, t.meta] },
    { color: palette.nord.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.nord.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.nord.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.go,
)

export const htmlHighlight = scopedHighlight(
  [
    { color: palette.markup.keyword, tag: t.keyword },
    { color: palette.markup.name, tag: [t.name] },
    { color: palette.markup.attr, tag: [t.propertyName, t.attributeName] },
    { color: palette.markup.string, tag: [t.string, t.special(t.string)] },
    { color: palette.markup.comment, tag: [t.comment] },
    { color: palette.markup.meta, tag: [t.meta, t.processingInstruction] },
    { color: palette.markup.operator, tag: [t.operator, t.operatorKeyword] },
  ],
  s.html,
)

export const javaHighlight = scopedHighlight(
  [
    { color: palette.jetbrainsJava.keyword, tag: t.keyword },
    { color: palette.jetbrainsJava.name, tag: [t.name, t.definition(t.name), t.separator] },
    { color: palette.jetbrainsJava.type, tag: [t.typeName, t.className, t.annotation] },
    { color: palette.jetbrainsJava.number, tag: t.number },
    { color: palette.jetbrainsJava.string, tag: [t.string, t.special(t.string)] },
    { color: palette.jetbrainsJava.comment, tag: [t.comment, t.meta] },
    { color: palette.jetbrainsJava.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.jetbrainsJava.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
    {
      color: palette.jetbrainsJava.func,
      tag: [t.function(t.variableName), t.function(t.propertyName)],
    },
  ],
  s.java,
)

export const javascriptHighlight = scopedHighlight(
  [
    { color: palette.oneDark.keyword, tag: t.keyword },
    { color: palette.oneDark.name, tag: [t.name, t.propertyName] },
    { color: palette.oneDark.type, tag: [t.typeName, t.className] },
    { color: palette.oneDark.number, tag: t.number },
    { color: palette.oneDark.string, tag: [t.string, t.special(t.string), t.regexp] },
    { color: palette.oneDark.comment, tag: [t.comment, t.meta] },
    { color: palette.oneDark.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.oneDark.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.oneDark.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.javascript,
)

export const typescriptHighlight = scopedHighlight(
  [
    { color: palette.oneDark.keyword, tag: t.keyword },
    { color: palette.oneDark.name, tag: [t.name, t.propertyName] },
    { color: palette.oneDark.type, tag: [t.typeName, t.className, t.annotation, t.namespace] },
    { color: palette.oneDark.number, tag: t.number },
    { color: palette.oneDark.string, tag: [t.string, t.special(t.string), t.regexp] },
    { color: palette.oneDark.comment, tag: [t.comment, t.meta] },
    { color: palette.oneDark.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.oneDark.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.oneDark.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.typescript,
)

export const jsonHighlight = scopedHighlight(
  [
    { color: palette.data.name, tag: [t.propertyName, t.attributeName] },
    { color: palette.data.string, tag: [t.string, t.special(t.string)] },
    { color: palette.data.number, tag: [t.number] },
    { color: palette.data.constant, tag: [t.bool, t.atom, t.null] },
    { color: palette.data.operator, tag: [t.separator, t.operator] },
    { color: palette.data.comment, tag: [t.comment, t.meta] },
  ],
  s.json,
)

export const markdownHighlight = scopedHighlight(
  [
    { color: '#e06c75', fontWeight: 'bold', tag: t.heading },
    { color: '#7d8799', tag: [t.meta, t.comment, t.quote] },
    { color: '#98c379', tag: [t.string, t.monospace] },
    { color: '#56b6c2', tag: [t.link, t.url], textDecoration: 'underline' },
    { color: '#c678dd', tag: t.keyword },
    { fontWeight: 'bold', tag: t.strong },
    { fontStyle: 'italic', tag: t.emphasis },
    { tag: t.strikethrough, textDecoration: 'line-through' },
  ],
  s.markdown,
)

export const phpHighlight = scopedHighlight(
  [
    { color: palette.oneDark.keyword, tag: t.keyword },
    { color: palette.oneDark.name, tag: [t.name, t.propertyName] },
    { color: palette.oneDark.type, tag: [t.typeName, t.className, t.namespace] },
    { color: palette.oneDark.number, tag: t.number },
    { color: palette.oneDark.string, tag: [t.string, t.special(t.string)] },
    { color: palette.oneDark.comment, tag: [t.comment, t.meta] },
    { color: palette.oneDark.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.oneDark.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.oneDark.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.php,
)

export const pythonHighlight = scopedHighlight(
  [
    { color: palette.monokai.keyword, tag: t.keyword },
    { color: palette.monokai.name, tag: [t.name, t.definition(t.name)] },
    { color: palette.monokai.type, tag: [t.typeName, t.className] },
    { color: palette.monokai.number, tag: t.number },
    { color: palette.monokai.string, tag: [t.string, t.special(t.string)] },
    { color: palette.monokai.comment, tag: [t.comment, t.meta] },
    { color: palette.monokai.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.monokai.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.monokai.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.python,
)

export const rustHighlight = scopedHighlight(
  [
    { color: palette.oneDark.keyword, tag: t.keyword },
    { color: palette.oneDark.name, tag: [t.name, t.macroName] },
    { color: palette.oneDark.type, tag: [t.typeName, t.className, t.annotation] },
    { color: palette.oneDark.number, tag: t.number },
    { color: palette.oneDark.string, tag: [t.string, t.special(t.string)] },
    { color: palette.oneDark.comment, tag: [t.comment, t.meta] },
    { color: palette.oneDark.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.oneDark.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.oneDark.constant, tag: [t.atom, t.bool, t.constant(t.name)] },
  ],
  s.rust,
)

export const sassHighlight = scopedHighlight(
  [
    { color: palette.style.keyword, tag: t.keyword },
    { color: palette.style.name, tag: [t.name, t.propertyName] },
    { color: palette.style.type, tag: [t.typeName, t.className, t.labelName] },
    { color: palette.style.number, tag: [t.number] },
    { color: palette.style.string, tag: [t.string, t.special(t.string)] },
    { color: palette.style.comment, tag: [t.comment, t.meta] },
    { color: palette.style.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.style.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: palette.style.constant, tag: [t.color, t.constant(t.name), t.standard(t.name)] },
  ],
  s.sass,
)

export const sqlHighlight = scopedHighlight(
  [
    { color: '#c678dd', tag: t.keyword },
    { color: '#c4c9d5', tag: [t.name, t.definition(t.name)] },
    { color: '#e5c07b', tag: [t.typeName, t.className] },
    { color: '#d19a66', tag: [t.number, t.bool] },
    { color: '#98c379', tag: [t.string, t.special(t.string)] },
    { color: '#7d8799', tag: [t.comment, t.meta] },
    { color: '#56b6c2', tag: [t.operator, t.operatorKeyword] },
    { color: '#61afef', tag: [t.function(t.variableName), t.function(t.propertyName)] },
    { color: '#e5c07b', tag: [t.atom, t.constant(t.name)] },
  ],
  s.sql,
)

export const vueHighlight = scopedHighlight(
  [
    { color: palette.markup.keyword, tag: t.keyword },
    { color: palette.markup.name, tag: [t.name] },
    { color: palette.markup.attr, tag: [t.propertyName, t.attributeName] },
    { color: palette.markup.string, tag: [t.string, t.special(t.string)] },
    { color: palette.markup.comment, tag: [t.comment] },
    { color: palette.markup.meta, tag: [t.meta, t.annotation, t.processingInstruction] },
    { color: palette.markup.operator, tag: [t.operator, t.operatorKeyword] },
    { color: palette.markup.func, tag: [t.function(t.variableName), t.function(t.propertyName)] },
  ],
  s.vue,
)

export const xmlHighlight = scopedHighlight(
  [
    { color: palette.markup.keyword, tag: t.keyword },
    { color: palette.markup.name, tag: [t.name] },
    { color: palette.markup.attr, tag: [t.propertyName, t.attributeName] },
    { color: palette.markup.string, tag: [t.string, t.special(t.string)] },
    { color: palette.markup.comment, tag: [t.comment] },
    { color: palette.markup.meta, tag: [t.meta, t.processingInstruction] },
    { color: palette.markup.operator, tag: [t.operator, t.operatorKeyword] },
  ],
  s.xml,
)

export const yamlHighlight = scopedHighlight(
  [
    { color: palette.data.keyword, tag: t.keyword },
    { color: palette.data.name, tag: [t.propertyName, t.attributeName] },
    { color: palette.data.string, tag: [t.string, t.special(t.string)] },
    { color: palette.data.number, tag: [t.number] },
    { color: palette.data.constant, tag: [t.bool, t.atom, t.null] },
    { color: palette.data.operator, tag: [t.separator, t.operator] },
    { color: palette.data.comment, tag: [t.comment, t.meta] },
  ],
  s.yaml,
)

export const supportedLangHighlight: Extension[] = [
  angularHighlight,
  cppHighlight,
  cssHighlight,
  goHighlight,
  htmlHighlight,
  javaHighlight,
  javascriptHighlight,
  typescriptHighlight,
  jsonHighlight,
  markdownHighlight,
  phpHighlight,
  pythonHighlight,
  rustHighlight,
  sassHighlight,
  sqlHighlight,
  vueHighlight,
  xmlHighlight,
  yamlHighlight,
]
