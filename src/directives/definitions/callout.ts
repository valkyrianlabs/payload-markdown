import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

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
  danger: 'border-red-500/45 bg-red-500/10 text-red-50',
  info: 'border-sky-500/45 bg-sky-500/10 text-sky-50',
  note: 'border-slate-500/45 bg-slate-500/10 text-slate-50',
  success: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-50',
  tip: 'border-cyan-500/45 bg-cyan-500/10 text-cyan-50',
  warning: 'border-amber-500/45 bg-amber-500/10 text-amber-50',
}

function isCalloutVariant(value: unknown): value is CalloutVariant {
  return typeof value === 'string' && CALLOUT_VARIANTS.includes(value as CalloutVariant)
}

export function resolveCalloutVariant(node: ContainerDirective): CalloutVariant {
  const variant = node.attributes?.variant

  return isCalloutVariant(variant) ? variant : 'note'
}

function getTitle(node: ContainerDirective): string | undefined {
  const title = node.attributes?.title

  return typeof title === 'string' && title.trim() ? title.trim() : undefined
}

export const calloutDirective: LayoutDirectiveDefinition = {
  name: 'callout',
  allowedAttributes: ['title', 'variant'],
  applyHast(node, _config, { mergeClassNames }) {
    const variant = typeof node.properties.dataVariant === 'string' ? node.properties.dataVariant : 'note'
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined
    const children = node.children

    node.properties.className = mergeClassNames(
      'my-6 rounded-xl border px-4 py-3',
      'not-prose',
      calloutVariantClasses[isCalloutVariant(variant) ? variant : 'note'],
    )

    node.children = [
      ...(title
        ? [
            {
              type: 'element' as const,
              children: [{ type: 'text' as const, value: title }],
              properties: {
                className: ['mb-2 text-sm font-semibold tracking-wide'],
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
    snippet: ':::callout {variant="${variant}" title="${Title}"}\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'callout',
      dataTitle: getTitle(node),
      dataVariant: resolveCalloutVariant(node),
    }
  },
  kind: 'callout',
  openMarker: ':::callout',
  public: true,
  supportsAttributes: true,
  tagName: 'div',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.variant === 'string' && !isCalloutVariant(attributes.variant))
      warnings.push(
        `Unsupported callout variant "${attributes.variant}". Falling back to "note".`,
      )

    return warnings
  },
}
