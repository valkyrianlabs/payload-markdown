import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'
import { CARD_BODY_CLASS_NAMES } from './card.js'

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

function makeCardStep(
  children: ElementContent[],
  index: number,
  stepTheme: ReturnType<typeof resolveDirectiveTheme>,
): Element {
  return {
    type: 'element',
    children: [
      {
        type: 'element',
        children,
        properties: {
          className: [
            stepTheme.hookClassName,
            stepTheme.modifierClassName,
            stepTheme.classes,
            CARD_BODY_CLASS_NAMES,
          ],
          dataStepCard: '',
          dataTheme: stepTheme.name,
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

function groupStepChildren(
  children: ElementContent[],
  variant: StepVariant,
  stepTheme: ReturnType<typeof resolveDirectiveTheme>,
): ElementContent[] {
  const groups: ElementContent[][] = []
  let current: ElementContent[] = []
  const makeStepElement =
    variant === 'cards'
      ? (group: ElementContent[], index: number) => makeCardStep(group, index, stepTheme)
      : makeStep

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
  allowedAttributes: ['stepTheme', 'theme', 'variant'],
  applyHast(node, config, { mergeClassNames }) {
    const variant =
      typeof node.properties.dataVariant === 'string' && isStepVariant(node.properties.dataVariant)
        ? node.properties.dataVariant
        : 'default'
    const theme = resolveDirectiveTheme(
      'steps',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )
    const stepTheme = resolveDirectiveTheme(
      'card',
      typeof node.properties.dataStepTheme === 'string'
        ? node.properties.dataStepTheme
        : undefined,
      config.themes,
    )

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
    )
    node.children = groupStepChildren(node.children, variant, stepTheme)
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
      dataStepTheme:
        typeof node.attributes?.stepTheme === 'string' ? node.attributes.stepTheme : undefined,
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
      dataVariant: variant === 'default' ? undefined : variant,
    }
  },
  kind: 'steps',
  openMarker: ':::steps',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  themeAttributes: {
    stepTheme: 'card',
    theme: 'steps',
  },
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.variant === 'string' && !isStepVariant(attributes.variant))
      warnings.push(
        `Unsupported steps variant "${attributes.variant}". Falling back to "default".`,
      )

    return warnings
  },
}
