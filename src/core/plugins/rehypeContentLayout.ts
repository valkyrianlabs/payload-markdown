import type { Element, ElementContent, Root } from 'hast'
import type { Plugin } from 'unified'

import { SKIP, visit } from 'unist-util-visit'

export const TABLE_WRAPPER_CLASS_NAMES = 'pmd-table overflow-x-auto'
export const INLINE_MEDIA_CLASS_NAME = 'pmd-inline-media'

function measureParagraph(children: ElementContent[], stats = { hasText: false, images: 0 }) {
  for (const child of children) {
    if (child.type === 'text') {
      if (child.value.trim()) stats.hasText = true
    } else if (child.type === 'element') {
      if (child.tagName === 'img') stats.images += 1
      else measureParagraph(child.children, stats)
    }
  }

  return stats
}

function addClassName(node: Element, className: string) {
  const current = node.properties.className
  const classNames = Array.isArray(current) ? current : typeof current === 'string' ? [current] : []

  node.properties.className = [...classNames, className]
}

/**
 * Layout fixes Markdown output needs whatever the styling:
 * - each table is wrapped in a horizontally scrollable container, so a wide
 *   table scrolls on its own instead of widening the page on small screens;
 * - a paragraph that mixes images with text, or holds several images (a badge
 *   row), is marked so its images stay inline instead of stacking as blocks.
 */
export const rehypeContentLayout: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'p') {
        const { hasText, images } = measureParagraph(node.children)
        if (images > 1 || (images > 0 && hasText)) addClassName(node, INLINE_MEDIA_CLASS_NAME)
        return
      }

      if (node.tagName !== 'table' || !parent || typeof index !== 'number') return

      const wrapper: Element = {
        type: 'element',
        children: [node],
        properties: { className: [TABLE_WRAPPER_CLASS_NAMES] },
        tagName: 'div',
      }

      parent.children.splice(index, 1, wrapper)

      return [SKIP, index + 1]
    })
  }
}
