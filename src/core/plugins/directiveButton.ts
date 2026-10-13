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
import { parseIconEntries } from '../../icons/entries.js'
import { normalizePayloadMarkdownIconRef } from '../../icons/refs.js'
import { getUnknownPaletteWarning } from '../../palettes/diagnostics.js'

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

function makeIconPlaceholder(icon: string, iconPosition: 'left' | 'right', palette?: string) {
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
      ...(palette ? { dataPmdIconPalette: palette } : {}),
      dataPmdIconRef: icon,
      focusable: 'false',
    },
    tagName: 'span',
  }
}

export function makeButtonDirective(
  line: string,
  file: MessageFile,
  config: MarkdownRenderConfig,
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
  // A button shows one icon; it may carry its own palette (`@pack/name palette=x`).
  const iconEntries = parseIconEntries(getAttribute(attributes, 'icon'))
  const [iconEntry] = iconEntries.entries
  const icon = iconEntry?.ref
  const palette = getAttribute(attributes, 'palette')
  const iconPalette = iconEntry?.palette ?? getAttribute(attributes, 'iconPalette') ?? palette
  const ariaLabel = getAttribute(attributes, 'ariaLabel')
  const newTab = getBooleanAttribute(attributes, 'newTab')

  for (const warning of parsed.warnings) file.message(warning)
  for (const warning of definition?.validateAttributes?.({ name: 'button', attributes }) ?? [])
    file.message(warning)

  if (icon) {
    const normalized = normalizePayloadMarkdownIconRef(icon)
    if (normalized.warning) file.message(normalized.warning)
  }

  for (const warning of iconEntries.warnings) file.message(warning)

  for (const name of new Set([getAttribute(attributes, 'iconPalette'), iconPalette, palette])) {
    const warning = name ? getUnknownPaletteWarning(name, 'button', config) : undefined
    if (warning) file.message(warning)
  }

  if (!label && !ariaLabel) file.message('Icon-only button requires an ariaLabel attribute.')

  const hChildren = [
    ...(icon && iconPosition === 'left' ? [makeIconPlaceholder(icon, iconPosition, iconPalette)] : []),
    ...(label
      ? [
          {
            type: 'text' as const,
            value: label,
          },
        ]
      : []),
    ...(icon && iconPosition === 'right' ? [makeIconPlaceholder(icon, iconPosition, iconPalette)] : []),
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
        dataIconPalette: getAttribute(attributes, 'iconPalette'),
        dataIconPosition: icon ? iconPosition : undefined,
        dataPalette: palette,
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
