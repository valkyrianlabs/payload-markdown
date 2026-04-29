import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from './types.js'

export function setDirectiveRenderData(
  node: ContainerDirective,
  definition: LayoutDirectiveDefinition,
  extraProperties?: Record<string, unknown>,
) {
  const data = (node.data ??= {})

  data.hName = definition.tagName
  data.hProperties = {
    ...(data.hProperties ?? {}),
    dataVlLayout: definition.name,
    ...(extraProperties ?? {}),
  }
}
