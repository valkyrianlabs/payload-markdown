import type { Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { MarkdownRenderConfig } from '../../types/core.js'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { hasDirectiveTheme } from '../../directives/themes.js'

type MessageFile = {
  message: (reason: string) => unknown
}

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

function warnUnknownThemes(node: ContainerDirective, file: MessageFile, config: MarkdownRenderConfig) {
  const definition = layoutDirectiveRegistry.get(node.name)
  if (!definition?.themeAttributes) return

  for (const [attribute, groupName] of Object.entries(definition.themeAttributes)) {
    if (!groupName) continue

    const value = node.attributes?.[attribute]
    if (typeof value !== 'string' || !value.trim()) continue
    if (hasDirectiveTheme(groupName, value, config.themes)) continue

    const label = attribute === 'theme' ? 'theme' : attribute

    file.message(
      `Unknown ${label} "${value}" on "${node.name}". Falling back to "default".`,
    )
  }
}

export const remarkValidateDirectiveThemes: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree, file) => {
    visit(tree, (node) => {
      if (!isContainerDirective(node)) return

      warnUnknownThemes(node, file, config)
    })
  }
}
