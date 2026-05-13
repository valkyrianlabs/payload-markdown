import type { Root } from 'mdast'
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { setDirectiveRenderData } from '../../directives/renderData.js'

type MarkdownDirectiveNode = ContainerDirective | LeafDirective

function isMarkdownDirective(node: unknown): node is MarkdownDirectiveNode {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      ['containerDirective', 'leafDirective'].includes(
        (node as { type?: string }).type ?? '',
      ),
  )
}

function isContainerDirective(node: MarkdownDirectiveNode): node is ContainerDirective {
  return node.type === 'containerDirective'
}

type WarningSink = {
  message: (reason: string) => unknown
}

function transformDirective(node: MarkdownDirectiveNode, file: WarningSink) {
  if (node.type === 'leafDirective' && node.name !== 'button') return

  const definition = layoutDirectiveRegistry.get(node.name)

  if (!definition) return

  const renderProperties = isContainerDirective(node)
    ? definition.getMdastRenderProperties?.(node)
    : undefined

  if (isContainerDirective(node)) {
    for (const warning of definition.validateMdast?.(node) ?? []) file.message(warning)

    definition.transformMdast?.(node, {
      isSupportedDirectiveName: (name) => layoutDirectiveRegistry.isSupportedDirectiveName(name),
    })
  }

  setDirectiveRenderData(node, definition, renderProperties)
}

export const remarkLayoutDirectives: Plugin<[], Root> = () => {
  return (tree: Root, file) => {
    visit(tree, (node) => {
      if (!isMarkdownDirective(node)) return
      if (!layoutDirectiveRegistry.isSupportedDirectiveName(node.name)) return

      transformDirective(node, file)
    })
  }
}
