import type { LeafDirective } from 'mdast-util-directive'

import type { MarkdownRenderConfig } from '../../types/core.js'

import { parseButtonDirectiveLine } from '../../directives/buttonSyntax.js'
import {
  DEFAULT_BUTTON_ICON_POSITION,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  isButtonIconPosition,
  isButtonSize,
  isButtonVariant,
} from '../../directives/definitions/button.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { getSafeHref } from '../../directives/urls.js'
import { normalizePayloadMarkdownIconRef } from '../../icons/refs.js'

export type MessageFile = {
  message: (reason: string) => unknown
}

function getAttribute(attributes: Record<string, boolean | string>, name: string): string | undefined {
  const value = attributes[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getBooleanAttribute(attributes: Record<string, boolean | string>, name: string): boolean {
  const value = attributes[name]

  if (value === true) return true
  if (typeof value !== 'string') return false

  return value === 'true'
}

function makeIconPlaceholder(icon: string, iconPosition: 'left' | 'right') {
  const normalized = normalizePayloadMarkdownIconRef(icon)
  const iconKey = normalized.icon?.key ?? icon

  return {
    type: 'element' as const,
    children: [],
    properties: {
      ariaHidden: 'true',
      className: [
        'pmd-button__icon',
        `pmd-button__icon--${iconPosition}`,
      ],
      dataPmdIcon: iconKey,
      dataPmdIconRef: icon,
      focusable: 'false',
    },
    tagName: 'span',
  }
}

export function makeButtonDirective(
  line: string,
  file: MessageFile,
  _config: MarkdownRenderConfig,
): LeafDirective | undefined {
  const parsed = parseButtonDirectiveLine(line)
  if (!parsed) return undefined

  const definition = layoutDirectiveRegistry.get('button')
  const attributes = parsed.attributes
  const label = parsed.label.trim()
  const href = getSafeHref(getAttribute(attributes, 'href'))
  const variant = isButtonVariant(attributes.variant) ? attributes.variant : DEFAULT_BUTTON_VARIANT
  const size = isButtonSize(attributes.size) ? attributes.size : DEFAULT_BUTTON_SIZE
  const iconPosition = isButtonIconPosition(attributes.iconPosition)
    ? attributes.iconPosition
    : DEFAULT_BUTTON_ICON_POSITION
  const icon = getAttribute(attributes, 'icon')
  const ariaLabel = getAttribute(attributes, 'ariaLabel')
  const newTab = getBooleanAttribute(attributes, 'newTab')

  for (const warning of parsed.warnings) file.message(warning)
  for (const warning of definition?.validateAttributes?.({ name: 'button', attributes }) ?? [])
    file.message(warning)

  if (icon) {
    const normalized = normalizePayloadMarkdownIconRef(icon)
    if (normalized.warning) file.message(normalized.warning)
  }

  if (!label && !ariaLabel) file.message('Icon-only button requires an ariaLabel attribute.')

  const hChildren = [
    ...(icon && iconPosition === 'left' ? [makeIconPlaceholder(icon, iconPosition)] : []),
    ...(label
      ? [
          {
            type: 'text' as const,
            value: label,
          },
        ]
      : []),
    ...(icon && iconPosition === 'right' ? [makeIconPlaceholder(icon, iconPosition)] : []),
  ]

  return {
    name: 'button',
    type: 'leafDirective',
    attributes: Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [key, String(value)]),
    ),
    children: label ? [{ type: 'text', value: label }] : [],
    data: {
      hChildren,
      hName: 'a',
      hProperties: {
        ...(ariaLabel ? { ariaLabel } : {}),
        className: [
          'pmd-button',
          `pmd-button--${variant}`,
          `pmd-button--${size}`,
        ],
        dataButton: '',
        dataDirective: 'button',
        dataIconPosition: icon ? iconPosition : undefined,
        dataSize: size,
        dataVariant: variant,
        href,
        ...(newTab
          ? {
              rel: 'noopener noreferrer',
              target: '_blank',
            }
          : {}),
      },
    },
  }
}
