import type { Root } from 'mdast'
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { setDirectiveRenderData } from '../../directives/renderData.js'
import { type DiagnosticFile, reportDiagnostic } from '../diagnostics.js'

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

function transformDirective(node: MarkdownDirectiveNode, file: DiagnosticFile) {
  if (node.type === 'leafDirective' && node.name !== 'button') return

  const definition = layoutDirectiveRegistry.get(node.name)

  if (!definition) return

  const renderProperties = isContainerDirective(node)
    ? definition.getMdastRenderProperties?.(node)
    : undefined

  if (isContainerDirective(node)) {
    for (const warning of definition.validateMdast?.(node) ?? [])
      reportDiagnostic(file, warning, { place: node.data?.vlPlace, source: 'directive' })

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
