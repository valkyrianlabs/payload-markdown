import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

function isElement(node: unknown): node is Element {
  return Boolean(
    node && typeof node === 'object' && 'type' in node && (node as Element).type === 'element',
  )
}

const ALLOW_STYLE_ON_AUTHORED_TAGS = new Set<string>([])

export const rehypeStripAuthoredInlineStyles: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (!isElement(node)) return
      if (!node.properties?.style) return
      if (ALLOW_STYLE_ON_AUTHORED_TAGS.has(node.tagName)) return

      delete node.properties.style
    })
  }
}
