import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownRenderConfig } from '../../types/core.js'

import {
  resolvePayloadMarkdownIcon,
  validatePayloadMarkdownIconsConfig,
} from '../../icons/resolve.js'

function isElement(node: unknown): node is Element {
  return Boolean(
    node && typeof node === 'object' && 'type' in node && (node as Element).type === 'element',
  )
}

function getStringProperty(node: Element, name: string): string | undefined {
  const value = node.properties?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export const rehypeResolveIcons: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree, file) => {
    for (const warning of validatePayloadMarkdownIconsConfig(config.icons)) file.message(warning)

    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node)) return
      if (node.tagName !== 'span') return

      const iconRef = getStringProperty(node, 'dataPmdIconRef')
      if (!iconRef) return

      const className = Array.isArray(node.properties.className)
        ? node.properties.className.join(' ')
        : typeof node.properties.className === 'string'
          ? node.properties.className
          : 'pmd-icon'
      const resolved = resolvePayloadMarkdownIcon(iconRef, config.icons, className)

      for (const warning of resolved.warnings) file.message(warning)

      if (!parent || typeof index !== 'number') return

      parent.children.splice(index, 1, ...resolved.nodes)
    })
  }
}
