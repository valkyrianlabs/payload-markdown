import type { Paragraph, Root, RootContent, Text } from 'mdast'
import type { Plugin } from 'unified'

import type { LayoutToken } from '../../types/layoutToken.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'

function isParagraph(node: RootContent): node is Paragraph {
  return node.type === 'paragraph'
}

function isText(node: Paragraph['children'][number]): node is Text {
  return node.type === 'text'
}

function getParagraphText(node: Paragraph): null | string {
  if (!node.children.every(isText)) return null

  return node.children
    .map((child) => child.value)
    .join('')
}

function parseLayoutDirective(text: string): LayoutToken | null {
  return layoutDirectiveRegistry.parseMarkdownLine(text)
}

function makeParagraph(value: string): Paragraph {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value,
      },
    ],
  }
}

function splitParagraphLayoutDirectives(node: Paragraph): RootContent[] {
  const text = getParagraphText(node)
  if (!text) return [node]

  const out: RootContent[] = []
  let paragraphLines: string[] = []

  const flushParagraph = () => {
    const value = paragraphLines.join('\n').trim()

    if (value) out.push(makeParagraph(value))

    paragraphLines = []
  }

  for (const line of text.split(/\r?\n/)) {
    const token = parseLayoutDirective(line.trim())

    if (!token) {
      paragraphLines.push(line)
      continue
    }

    flushParagraph()
    out.push(token)
  }

  flushParagraph()

  return out.length > 0 ? out : [node]
}

export const remarkLiftLayoutDirectives: Plugin<[], Root> = () => {
  return (tree) => {
    tree.children = tree.children.flatMap((node): RootContent[] => {
      if (!isParagraph(node)) return [node]

      return splitParagraphLayoutDirectives(node)
    })
  }
}
