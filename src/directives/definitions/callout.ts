import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { makeDirectiveIconPlaceholder } from '../iconPlaceholder.js'
import { getDirectiveLabelOrAttribute } from '../labels.js'
import { resolveDirectiveTheme } from '../themes.js'

export const CALLOUT_VARIANTS = [
  'note',
  'info',
  'tip',
  'warning',
  'danger',
  'success',
] as const

export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number]

const calloutVariantClasses: Record<CalloutVariant, string> = {
  danger: 'bg-red-500/10 text-red-50',
  info: 'bg-sky-500/10 text-sky-50',
  note: 'bg-slate-500/10 text-slate-50',
  success: 'bg-emerald-500/10 text-emerald-50',
  tip: 'bg-cyan-500/10 text-cyan-50',
  warning: 'bg-amber-500/10 text-amber-50',
}

function isCalloutVariant(value: unknown): value is CalloutVariant {
  return typeof value === 'string' && CALLOUT_VARIANTS.includes(value as CalloutVariant)
}

export function resolveCalloutVariant(node: ContainerDirective): CalloutVariant {
  const variant = node.attributes?.variant

  return isCalloutVariant(variant) ? variant : 'note'
}

function getTitle(node: ContainerDirective): string | undefined {
  return getDirectiveLabelOrAttribute(node, 'title')
}

export const calloutDirective: LayoutDirectiveDefinition = {
  name: 'callout',
  allowedAttributes: ['icon', 'theme', 'title', 'variant'],
  applyHast(node, config, { mergeClassNames }) {
    const variant = typeof node.properties.dataVariant === 'string' ? node.properties.dataVariant : 'note'
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined
    const icon = typeof node.properties.dataIcon === 'string' ? node.properties.dataIcon : undefined
    const theme = resolveDirectiveTheme(
      'callout',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : 'soft',
      config.themes,
    )
    const children = node.children

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
      calloutVariantClasses[isCalloutVariant(variant) ? variant : 'note'],
    )

    node.children = [
      ...(title || icon
        ? [
            {
              type: 'element' as const,
              children: [
                ...(icon
                  ? [
                      makeDirectiveIconPlaceholder(icon, [
                        'pmd-callout__icon inline-flex size-4 shrink-0 text-current',
                      ]),
                    ]
                  : []),
                ...(title ? [{ type: 'text' as const, value: title }] : []),
              ],
              properties: {
                className: ['mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide'],
                dataDirectiveTitle: 'callout',
              },
              tagName: 'div',
            },
          ]
        : []),
      {
        type: 'element',
        children,
        properties: {
          className: ['space-y-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0'],
          dataDirectiveBody: 'callout',
        },
        tagName: 'div',
      },
    ]
  },
  defaultAttributes: {
    variant: 'note',
  },
  description: 'Emphasized content block with note, info, tip, warning, danger, or success variants.',
  editor: {
    detail: 'Static directive',
    label: 'Callout',
    snippet: ':::callout[${Title}]{\n  variant="${note}"\n}\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'callout',
      dataIcon: typeof node.attributes?.icon === 'string' ? node.attributes.icon : undefined,
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'soft',
      dataTitle: getTitle(node),
      dataVariant: resolveCalloutVariant(node),
    }
  },
  kind: 'callout',
  openMarker: ':::callout',
  public: true,
  supportsAttributes: true,
  tagName: 'div',
  themeAttributes: {
    theme: 'callout',
  },
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.variant === 'string' && !isCalloutVariant(attributes.variant))
      warnings.push(
        `Unsupported callout variant "${attributes.variant}". Falling back to "note".`,
      )

    return warnings
  },
}
