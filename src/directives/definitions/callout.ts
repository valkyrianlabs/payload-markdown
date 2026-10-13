import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { DIRECTIVE_BODY_CLASS } from '../../styles/directiveSurface.js'
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

// The tint is a background-image so it layers over the theme's background
// color instead of competing with it, and the ring composes with the theme's
// shadow. Titles and icons carry the variant accent.
const calloutVariantClasses: Record<CalloutVariant, string> = {
  danger:
    'bg-linear-to-r from-red-500/10 to-red-500/10 inset-ring inset-ring-red-400/15 text-red-50 [&>[data-directive-title]]:text-red-300',
  info: 'bg-linear-to-r from-sky-500/10 to-sky-500/10 inset-ring inset-ring-sky-400/15 text-sky-50 [&>[data-directive-title]]:text-sky-300',
  note: 'bg-linear-to-r from-slate-500/10 to-slate-500/10 inset-ring inset-ring-slate-400/15 text-slate-50 [&>[data-directive-title]]:text-slate-300',
  success:
    'bg-linear-to-r from-emerald-500/10 to-emerald-500/10 inset-ring inset-ring-emerald-400/15 text-emerald-50 [&>[data-directive-title]]:text-emerald-300',
  tip: 'bg-linear-to-r from-violet-500/10 to-violet-500/10 inset-ring inset-ring-violet-400/15 text-violet-50 [&>[data-directive-title]]:text-violet-300',
  warning:
    'bg-linear-to-r from-amber-500/10 to-amber-500/10 inset-ring inset-ring-amber-400/15 text-amber-50 [&>[data-directive-title]]:text-amber-300',
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
    // An icon without a title sits beside the body instead of on its own row.
    const iconBesideBody = Boolean(icon && !title)

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      iconBesideBody ? 'flex items-start gap-3' : undefined,
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
                        iconBesideBody ? 'mt-1.5' : 'mt-0.5',
                      ]),
                    ]
                  : []),
                ...(title ? [{ type: 'text' as const, value: title }] : []),
              ],
              properties: {
                className: [
                  iconBesideBody
                    ? 'not-prose flex shrink-0'
                    : 'not-prose mb-2 flex items-start gap-2 text-sm font-semibold tracking-wide',
                ],
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
          className: [DIRECTIVE_BODY_CLASS, iconBesideBody ? 'min-w-0 flex-1' : ''].filter(Boolean),
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
