import type { Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { setDirectiveRenderData } from '../../directives/renderData.js'

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

type WarningSink = {
  message: (reason: string) => unknown
}

function transformDirective(node: ContainerDirective, file: WarningSink) {
  const definition = layoutDirectiveRegistry.get(node.name)

  if (!definition) return

  for (const warning of definition.validateMdast?.(node) ?? []) file.message(warning)

  definition.transformMdast?.(node, {
    isSupportedDirectiveName: (name) => layoutDirectiveRegistry.isSupportedDirectiveName(name),
  })

  setDirectiveRenderData(node, definition, definition.getMdastRenderProperties?.(node))
}

export const remarkLayoutDirectives: Plugin<[], Root> = () => {
  return (tree: Root, file) => {
    visit(tree, (node) => {
      if (!isContainerDirective(node)) return
      if (!layoutDirectiveRegistry.isSupportedDirectiveName(node.name)) return

      transformDirective(node, file)
    })
  }
}
