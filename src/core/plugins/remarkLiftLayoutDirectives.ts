import type { Paragraph, Root, RootContent, Text } from 'mdast'
import type { Plugin } from 'unified'

import type { LayoutToken } from '../../types/layoutToken.js'

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
    .trim()
}

function parseLayoutDirective(text: string): LayoutToken | null {
  if (text === ':::section') return { name: 'section', type: 'vlLayoutToken', action: 'open' }
  if (text === ':::2col') return { name: '2col', type: 'vlLayoutToken', action: 'open' }
  if (text === ':::3col') return { name: '3col', type: 'vlLayoutToken', action: 'open' }
  if (text === ':::endcol') return { type: 'vlLayoutToken', action: 'closeGrid' }
  if (text === ':::endsection') return { type: 'vlLayoutToken', action: 'closeSection' }
  if (text === ':::end') return { type: 'vlLayoutToken', action: 'closeSection' }
  if (text === ':::') return { type: 'vlLayoutToken', action: 'close' }

  return null
}

export const remarkLiftLayoutDirectives: Plugin<[], Root> = () => {
  return (tree) => {
    tree.children = tree.children.map((node): RootContent => {
      if (!isParagraph(node)) return node

      const text = getParagraphText(node)
      if (!text) return node

      return parseLayoutDirective(text) ?? node
    })
  }
}
