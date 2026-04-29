import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { CARD_BODY_CLASS_NAMES, CARD_CLASS_NAMES } from './card.js'

const STEP_VARIANTS = ['default', 'cards'] as const

type StepVariant = (typeof STEP_VARIANTS)[number]

function isStepVariant(value: unknown): value is StepVariant {
  return typeof value === 'string' && STEP_VARIANTS.includes(value as StepVariant)
}

function resolveStepsVariant(node: ContainerDirective): StepVariant {
  const variant = node.attributes?.variant

  return isStepVariant(variant) ? variant : 'default'
}

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

function makeCardStep(children: ElementContent[], index: number): Element {
  return {
    type: 'element',
    children: [
      {
        type: 'element',
        children,
        properties: {
          className: [CARD_CLASS_NAMES, CARD_BODY_CLASS_NAMES],
          dataStepCard: '',
        },
        tagName: 'article',
      },
    ],
    properties: {
      className: ['list-none'],
      dataStep: String(index + 1),
    },
    tagName: 'li',
  }
}

function groupStepChildren(children: ElementContent[], variant: StepVariant): ElementContent[] {
  const groups: ElementContent[][] = []
  let current: ElementContent[] = []
  const makeStepElement = variant === 'cards' ? makeCardStep : makeStep

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
      children: groups.map(makeStepElement),
      properties: {
        className:
          variant === 'cards'
            ? ['m-0 grid list-none gap-4 p-0 md:grid-cols-2']
            : ['m-0 list-decimal space-y-6 pl-6'],
      },
      tagName: 'ol',
    },
  ]
}

export const stepsDirective: LayoutDirectiveDefinition = {
  name: 'steps',
  allowedAttributes: ['variant'],
  applyHast(node, _config, { mergeClassNames }) {
    const variant =
      typeof node.properties.dataVariant === 'string' && isStepVariant(node.properties.dataVariant)
        ? node.properties.dataVariant
        : 'default'

    node.properties.className = mergeClassNames('not-prose my-8')
    node.children = groupStepChildren(node.children, variant)
  },
  description: 'Structured ordered flow for tutorials and install steps.',
  editor: {
    detail: 'Docs directive',
    label: 'Steps',
    snippet: ':::steps\n\n### ${Step title}\n\n${Content}\n\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    const variant = resolveStepsVariant(node)

    return {
      dataDirective: 'steps',
      dataVariant: variant === 'default' ? undefined : variant,
    }
  },
  kind: 'steps',
  openMarker: ':::steps',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.variant === 'string' && !isStepVariant(attributes.variant))
      warnings.push(
        `Unsupported steps variant "${attributes.variant}". Falling back to "default".`,
      )

    return warnings
  },
}
