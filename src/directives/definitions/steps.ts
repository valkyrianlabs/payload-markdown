import type { Element, ElementContent } from 'hast'

import type { LayoutDirectiveDefinition } from '../types.js'

function isElement(node: ElementContent): node is Element {
  return node.type === 'element'
}

function isStepHeading(node: ElementContent): node is Element {
  return isElement(node) && ['h2', 'h3', 'h4'].includes(node.tagName)
}

function makeStep(children: ElementContent[], index: number): Element {
  return {
    type: 'element',
    children,
    properties: {
      className: ['relative pl-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0'],
      dataStep: String(index + 1),
    },
    tagName: 'li',
  }
}

function groupStepChildren(children: ElementContent[]): ElementContent[] {
  const groups: ElementContent[][] = []
  let current: ElementContent[] = []

  for (const child of children) {
    if (isStepHeading(child) && current.length > 0) {
      groups.push(current)
      current = [child]
      continue
    }

    current.push(child)
  }

  if (current.length > 0) groups.push(current)

  return [
    {
      type: 'element',
      children: groups.map(makeStep),
      properties: {
        className: ['m-0 list-decimal space-y-6 pl-6'],
      },
      tagName: 'ol',
    },
  ]
}

export const stepsDirective: LayoutDirectiveDefinition = {
  name: 'steps',
  allowedAttributes: [],
  applyHast(node, _config, { mergeClassNames }) {
    node.properties.className = mergeClassNames('not-prose my-8')
    node.children = groupStepChildren(node.children)
  },
  description: 'Structured ordered flow for tutorials and install steps.',
  editor: {
    detail: 'Docs directive',
    label: 'Steps',
    snippet: ':::steps\n\n### ${Step title}\n\n${Content}\n\n:::\n${}',
  },
  getMdastRenderProperties() {
    return {
      dataDirective: 'steps',
    }
  },
  kind: 'steps',
  openMarker: ':::steps',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
}
