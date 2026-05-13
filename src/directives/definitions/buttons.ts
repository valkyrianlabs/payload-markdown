import type { LayoutDirectiveDefinition } from '../types.js'

export const BUTTONS_ALIGNS = ['left', 'center', 'right'] as const
export const BUTTONS_STACKS = ['mobile', 'always', 'never'] as const
export const BUTTONS_GAPS = ['sm', 'md', 'lg'] as const

export const DEFAULT_BUTTONS_ALIGN = 'left'
export const DEFAULT_BUTTONS_STACK = 'mobile'
export const DEFAULT_BUTTONS_GAP = 'md'

type ButtonsAlign = (typeof BUTTONS_ALIGNS)[number]
type ButtonsStack = (typeof BUTTONS_STACKS)[number]
type ButtonsGap = (typeof BUTTONS_GAPS)[number]

function isButtonsAlign(value: unknown): value is ButtonsAlign {
  return typeof value === 'string' && BUTTONS_ALIGNS.includes(value as ButtonsAlign)
}

function isButtonsStack(value: unknown): value is ButtonsStack {
  return typeof value === 'string' && BUTTONS_STACKS.includes(value as ButtonsStack)
}

function isButtonsGap(value: unknown): value is ButtonsGap {
  return typeof value === 'string' && BUTTONS_GAPS.includes(value as ButtonsGap)
}

export const buttonsDirective: LayoutDirectiveDefinition = {
  name: 'buttons',
  allowedAttributes: ['align', 'gap', 'stack'],
  applyHast(node, _config, { mergeClassNames }) {
    const align =
      typeof node.properties.dataAlign === 'string' && isButtonsAlign(node.properties.dataAlign)
        ? node.properties.dataAlign
        : DEFAULT_BUTTONS_ALIGN
    const stack =
      typeof node.properties.dataStack === 'string' && isButtonsStack(node.properties.dataStack)
        ? node.properties.dataStack
        : DEFAULT_BUTTONS_STACK
    const gap =
      typeof node.properties.dataGap === 'string' && isButtonsGap(node.properties.dataGap)
        ? node.properties.dataGap
        : DEFAULT_BUTTONS_GAP

    node.properties.dataAlign = align
    node.properties.dataStack = stack
    node.properties.dataGap = gap
    node.properties.className = mergeClassNames(
      'not-prose',
      'pmd-buttons',
      `pmd-buttons--align-${align}`,
      `pmd-buttons--stack-${stack}`,
      `pmd-buttons--gap-${gap}`,
    )
  },
  attributeValues: {
    align: BUTTONS_ALIGNS,
    gap: BUTTONS_GAPS,
    stack: BUTTONS_STACKS,
  },
  defaultAttributes: {
    align: DEFAULT_BUTTONS_ALIGN,
    gap: DEFAULT_BUTTONS_GAP,
    stack: DEFAULT_BUTTONS_STACK,
  },
  description: 'Button group wrapper for one or more button directives.',
  editor: {
    detail: 'Button group directive',
    label: 'Buttons',
    snippet:
      ':::buttons{\n  align="${left}"\n  stack="${mobile}"\n  gap="${md}"\n}\n::button[${Get started}]{\n  href="${/docs}"\n  variant="${primary}"\n}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataAlign: typeof node.attributes?.align === 'string' ? node.attributes.align : DEFAULT_BUTTONS_ALIGN,
      dataDirective: 'buttons',
      dataGap: typeof node.attributes?.gap === 'string' ? node.attributes.gap : DEFAULT_BUTTONS_GAP,
      dataStack: typeof node.attributes?.stack === 'string' ? node.attributes.stack : DEFAULT_BUTTONS_STACK,
    }
  },
  kind: 'buttons',
  openMarker: ':::buttons',
  public: true,
  supportsAttributes: true,
  tagName: 'div',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.align === 'string' && !isButtonsAlign(attributes.align))
      warnings.push(
        `Invalid buttons align "${attributes.align}". Falling back to "${DEFAULT_BUTTONS_ALIGN}".`,
      )

    if (typeof attributes.stack === 'string' && !isButtonsStack(attributes.stack))
      warnings.push(
        `Invalid buttons stack "${attributes.stack}". Falling back to "${DEFAULT_BUTTONS_STACK}".`,
      )

    if (typeof attributes.gap === 'string' && !isButtonsGap(attributes.gap))
      warnings.push(
        `Invalid buttons gap "${attributes.gap}". Falling back to "${DEFAULT_BUTTONS_GAP}".`,
      )

    return warnings
  },
}
