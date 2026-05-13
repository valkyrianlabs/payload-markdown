import type { LayoutDirectiveDefinition } from '../types.js'

import { getUnknownAttributeWarnings } from '../attributeDiagnostics.js'

export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const
export const BUTTON_ICON_POSITIONS = ['left', 'right'] as const
export const BUTTON_ALLOWED_ATTRIBUTES = [
  'ariaLabel',
  'href',
  'icon',
  'iconPosition',
  'newTab',
  'size',
  'variant',
] as const

export const DEFAULT_BUTTON_VARIANT = 'primary'
export const DEFAULT_BUTTON_SIZE = 'md'
export const DEFAULT_BUTTON_ICON_POSITION = 'left'

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]
export type ButtonIconPosition = (typeof BUTTON_ICON_POSITIONS)[number]

export function isButtonVariant(value: unknown): value is ButtonVariant {
  return typeof value === 'string' && BUTTON_VARIANTS.includes(value as ButtonVariant)
}

export function isButtonSize(value: unknown): value is ButtonSize {
  return typeof value === 'string' && BUTTON_SIZES.includes(value as ButtonSize)
}

export function isButtonIconPosition(value: unknown): value is ButtonIconPosition {
  return typeof value === 'string' && BUTTON_ICON_POSITIONS.includes(value as ButtonIconPosition)
}

export const buttonDirective: LayoutDirectiveDefinition = {
  name: 'button',
  allowedAttributes: BUTTON_ALLOWED_ATTRIBUTES,
  applyHast(node, _config, { mergeClassNames }) {
    const variant = isButtonVariant(node.properties.dataVariant)
      ? node.properties.dataVariant
      : DEFAULT_BUTTON_VARIANT
    const size = isButtonSize(node.properties.dataSize) ? node.properties.dataSize : DEFAULT_BUTTON_SIZE

    node.properties.dataVariant = variant
    node.properties.dataSize = size
    node.properties.className = mergeClassNames(
      'pmd-button',
      `pmd-button--${variant}`,
      `pmd-button--${size}`,
    )
  },
  attributeValues: {
    iconPosition: BUTTON_ICON_POSITIONS,
    newTab: ['true', 'false'],
    size: BUTTON_SIZES,
    variant: BUTTON_VARIANTS,
  },
  defaultAttributes: {
    iconPosition: DEFAULT_BUTTON_ICON_POSITION,
    newTab: 'false',
    size: DEFAULT_BUTTON_SIZE,
    variant: DEFAULT_BUTTON_VARIANT,
  },
  description: 'Link button with optional icon, variant, size, and new-tab behavior.',
  editor: {
    detail: 'Button leaf directive',
    label: '::button',
    snippet: '::button[${Label}]{\n  href="${/docs}"\n  variant="${primary}"\n}\n${}',
    snippets: [
      {
        detail: 'Button snippet variant; inserts canonical ::button',
        label: '::button_icon',
        snippet:
          '::button[${Label}]{\n  href="${/docs}"\n  variant="${primary}"\n  icon="${@fa-duotone/book-open}"\n}\n${}',
      },
      {
        detail: 'Button snippet variant; inserts canonical ::button',
        label: '::button_full',
        snippet:
          '::button[${Label}]{\n  href="${/docs}"\n  variant="${primary}"\n  size="${md}"\n  icon="${@fa-duotone/book-open}"\n  iconPosition="${left}"\n  newTab=${false}\n  ariaLabel="${}"\n}',
      },
    ],
  },
  kind: 'button',
  public: true,
  supportsAttributes: true,
  tagName: 'a',
  validateAttributes({ attributes }) {
    const warnings: string[] = getUnknownAttributeWarnings(
      'button',
      BUTTON_ALLOWED_ATTRIBUTES,
      attributes,
    )

    if (typeof attributes.variant === 'string' && !isButtonVariant(attributes.variant))
      warnings.push(
        `Invalid button variant "${attributes.variant}". Falling back to "${DEFAULT_BUTTON_VARIANT}".`,
      )

    if (typeof attributes.size === 'string' && !isButtonSize(attributes.size))
      warnings.push(
        `Invalid button size "${attributes.size}". Falling back to "${DEFAULT_BUTTON_SIZE}".`,
      )

    if (
      typeof attributes.iconPosition === 'string' &&
      !isButtonIconPosition(attributes.iconPosition)
    )
      warnings.push(
        `Invalid button iconPosition "${attributes.iconPosition}". Falling back to "${DEFAULT_BUTTON_ICON_POSITION}".`,
      )

    if (typeof attributes.href !== 'string' || !attributes.href.trim())
      warnings.push('Directive "button" requires an href attribute.')

    return warnings
  },
}
