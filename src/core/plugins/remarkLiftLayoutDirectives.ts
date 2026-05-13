import type { Paragraph, PhrasingContent, Root, RootContent, Text } from 'mdast'
import type { Plugin } from 'unified'

import type { LayoutToken } from '../../types/layoutToken.js'

import { hasUnclosedDirectiveAttributeBlock } from '../../directives/attributes.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'

function isParagraph(node: RootContent): node is Paragraph {
  return node.type === 'paragraph'
}

function isText(node: Paragraph['children'][number]): node is Text {
  return node.type === 'text'
}

function parseLayoutDirective(text: string): {
  diagnostics: string[]
  token: LayoutToken | null
} {
  return layoutDirectiveRegistry.parseMarkdownLineDetailed(text)
}

function makeParagraph(children: PhrasingContent[]): Paragraph {
  return {
    type: 'paragraph',
    children,
  }
}

function makeText(value: string): Text {
  return {
    type: 'text',
    value,
  }
}

function splitParagraphLines(node: Paragraph): PhrasingContent[][] {
  const lines: PhrasingContent[][] = [[]]

  const currentLine = () => lines[lines.length - 1]

  for (const child of node.children) {
    if (!isText(child)) {
      currentLine().push(child)
      continue
    }

    const parts = child.value.split(/\r?\n/)

    for (let index = 0; index < parts.length; ++index) {
      if (index > 0) lines.push([])

      if (parts[index]) currentLine().push(makeText(parts[index]))
    }
  }

  return lines
}

function collectExpandedDirectiveText(
  lines: PhrasingContent[][],
  startIndex: number,
): { endIndex: number; text: string } | null {
  const firstText = getTextOnlyLine(lines[startIndex])

  if (!firstText) return null
  if (!hasUnclosedDirectiveAttributeBlock(firstText))
    return {
      endIndex: startIndex,
      text: firstText,
    }

  let text = firstText

  for (let index = startIndex + 1; index < lines.length; ++index) {
    const nextText = getTextOnlyLine(lines[index])

    if (nextText === null) break
    if (nextText.trim().startsWith('::')) break

    text += `\n${nextText}`

    if (!hasUnclosedDirectiveAttributeBlock(text))
      return {
        endIndex: index,
        text,
      }
  }

  return {
    endIndex: startIndex,
    text: firstText,
  }
}

function phrasingToText(node: PhrasingContent): null | string {
  if (node.type === 'text') return node.value
  if (node.type === 'inlineCode') return node.value
  if ('children' in node && Array.isArray(node.children)) {
    const values = node.children.map((child) => phrasingToText(child))

    return values.every((value): value is string => typeof value === 'string')
      ? values.join('')
      : null
  }

  return null
}

function getTextOnlyLine(children: PhrasingContent[]): null | string {
  const values = children.map((child) => phrasingToText(child))

  if (!values.every((value): value is string => typeof value === 'string')) return null

  return values.join('')
}

function appendParagraphLine(lines: PhrasingContent[][], children: PhrasingContent[]) {
  if (lines.length > 0) lines.push([makeText('\n'), ...children])
  else lines.push(children)
}

function flattenParagraphLines(lines: PhrasingContent[][]): PhrasingContent[] {
  return lines.flat()
}

function splitParagraphLayoutDirectives(
  node: Paragraph,
  warn: (message: string) => void,
): RootContent[] {
  const out: RootContent[] = []
  let paragraphLines: PhrasingContent[][] = []

  const flushParagraph = () => {
    const children = flattenParagraphLines(paragraphLines)

    if (children.length > 0) out.push(makeParagraph(children))

    paragraphLines = []
  }

  const lines = splitParagraphLines(node)

  for (let index = 0; index < lines.length; ++index) {
    const lineChildren = lines[index]
    const text = getTextOnlyLine(lineChildren)
    const expanded = text ? collectExpandedDirectiveText(lines, index) : null
    const result = expanded
      ? parseLayoutDirective(expanded.text.trim())
      : { diagnostics: [], token: null }

    for (const diagnostic of result.diagnostics) warn(diagnostic)

    if (!result.token) {
      appendParagraphLine(paragraphLines, lineChildren)
      continue
    }

    flushParagraph()
    out.push(result.token)
    index = expanded?.endIndex ?? index
  }

  flushParagraph()

  return out.length > 0 ? out : [node]
}

export const remarkLiftLayoutDirectives: Plugin<[], Root> = () => {
  return (tree, file) => {
    tree.children = tree.children.flatMap((node): RootContent[] => {
      if (!isParagraph(node)) return [node]

      return splitParagraphLayoutDirectives(node, (message) => file.message(message))
    })
  }
}
