import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'
import { CARD_BODY_CLASS_NAMES } from './card.js'

const STEP_VARIANTS = ['default', 'cards'] as const
const STEP_CARD_LAYOUTS = ['stack', 'grid'] as const
const STEP_CARD_COLUMNS = ['1', '2', '3', '4', 'auto'] as const

type StepVariant = (typeof STEP_VARIANTS)[number]
type StepCardLayout = (typeof STEP_CARD_LAYOUTS)[number]
type StepCardColumns = (typeof STEP_CARD_COLUMNS)[number]

function isStepVariant(value: unknown): value is StepVariant {
  return typeof value === 'string' && STEP_VARIANTS.includes(value as StepVariant)
}

function isStepCardLayout(value: unknown): value is StepCardLayout {
  return typeof value === 'string' && STEP_CARD_LAYOUTS.includes(value as StepCardLayout)
}

function isStepCardColumns(value: unknown): value is StepCardColumns {
  return typeof value === 'string' && STEP_CARD_COLUMNS.includes(value as StepCardColumns)
}

function resolveStepsVariant(node: ContainerDirective): StepVariant {
  const variant = node.attributes?.variant

  return isStepVariant(variant) ? variant : 'default'
}

function resolveCardStepLayout(node: ContainerDirective): StepCardLayout {
  const layout = node.attributes?.layout

  return isStepCardLayout(layout) ? layout : 'stack'
}

function resolveCardStepColumns(node: ContainerDirective): StepCardColumns {
  const columns = node.attributes?.columns

  return isStepCardColumns(columns) ? columns : '2'
}

function resolveCardStepNumbered(node: ContainerDirective): boolean {
  const numbered = node.attributes?.numbered

  if (numbered === undefined) return true
  if (typeof numbered !== 'string') return true

  return numbered !== 'false'
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
  numbered: boolean,
  stepTheme: ReturnType<typeof resolveDirectiveTheme>,
): Element {
  return {
    type: 'element',
    children: [
      {
        type: 'element',
        children: [
          ...(numbered
            ? [
                {
                  type: 'element' as const,
                  children: [{ type: 'text' as const, value: String(index + 1) }],
                  properties: {
                    className: [
                      'mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/25 bg-black/10 text-sm font-semibold dark:bg-white/10',
                    ],
                    dataStepNumber: String(index + 1),
                  },
                  tagName: 'span',
                },
              ]
            : []),
          ...children,
        ],
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
  columns: StepCardColumns,
  layout: StepCardLayout,
  numbered: boolean,
  variant: StepVariant,
  stepTheme: ReturnType<typeof resolveDirectiveTheme>,
): ElementContent[] {
  const groups: ElementContent[][] = []
  let current: ElementContent[] = []
  const makeStepElement =
    variant === 'cards'
      ? (group: ElementContent[], index: number) => makeCardStep(group, index, numbered, stepTheme)
      : makeStep
  const gridColumnsClassNames: Record<StepCardColumns, string> = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
    auto: 'grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]',
  }

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
            ? layout === 'grid'
              ? ['m-0 grid list-none gap-4 p-0', gridColumnsClassNames[columns]]
              : ['m-0 flex list-none flex-col gap-4 p-0']
            : ['m-0 list-decimal space-y-6 pl-6'],
      },
      tagName: 'ol',
    },
  ]
}

export const stepsDirective: LayoutDirectiveDefinition = {
  name: 'steps',
  allowedAttributes: ['columns', 'layout', 'numbered', 'stepTheme', 'theme', 'variant'],
  applyHast(node, config, { mergeClassNames }) {
    const variant =
      typeof node.properties.dataVariant === 'string' && isStepVariant(node.properties.dataVariant)
        ? node.properties.dataVariant
        : 'default'
    const layout =
      typeof node.properties.dataLayout === 'string' && isStepCardLayout(node.properties.dataLayout)
        ? node.properties.dataLayout
        : 'stack'
    const columns =
      typeof node.properties.dataColumns === 'string' && isStepCardColumns(node.properties.dataColumns)
        ? node.properties.dataColumns
        : '2'
    const numbered = node.properties.dataNumbered !== 'false'
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
    node.children = groupStepChildren(node.children, columns, layout, numbered, variant, stepTheme)
  },
  attributeValues: {
    columns: STEP_CARD_COLUMNS,
    layout: STEP_CARD_LAYOUTS,
    numbered: ['true', 'false'],
    variant: STEP_VARIANTS,
  },
  description: 'Structured ordered flow for tutorials and install steps.',
  editor: {
    detail: 'Docs directive',
    label: 'Steps',
    snippet: ':::steps\n\n### ${Step title}\n\n${Content}\n\n:::\n${}',
    snippets: [
      {
        detail: 'Docs directive',
        label: 'Steps cards stack',
        snippet:
          ':::steps {variant="cards" layout="stack" numbered}\n\n### ${Step title}\n\n${Content}\n\n:::\n${}',
      },
      {
        detail: 'Docs directive',
        label: 'Steps cards grid',
        snippet:
          ':::steps {variant="cards" layout="grid" columns="${2}" numbered}\n\n### ${First step}\n\n${Content}\n\n### ${Second step}\n\n${Content}\n\n:::\n${}',
      },
    ],
  },
  getMdastRenderProperties(node) {
    const variant = resolveStepsVariant(node)
    const layout = resolveCardStepLayout(node)
    const numbered = resolveCardStepNumbered(node)
    const columns = resolveCardStepColumns(node)

    return {
      dataColumns: variant === 'cards' && layout === 'grid' ? columns : undefined,
      dataDirective: 'steps',
      dataLayout: variant === 'cards' ? layout : undefined,
      dataNumbered: variant === 'cards' ? String(numbered) : undefined,
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
    if (typeof attributes.layout === 'string' && !isStepCardLayout(attributes.layout))
      warnings.push(`Unsupported steps layout "${attributes.layout}". Falling back to "stack".`)
    if (typeof attributes.columns === 'string' && !isStepCardColumns(attributes.columns))
      warnings.push(`Invalid steps columns "${attributes.columns}". Falling back to "2".`)
    if (
      typeof attributes.numbered === 'string' &&
      attributes.numbered !== 'true' &&
      attributes.numbered !== 'false'
    )
      warnings.push(
        `Invalid steps numbered value "${attributes.numbered}". Falling back to "true".`,
      )

    return warnings
  },
}
