import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { parseIconEntries } from '../../icons/entries.js'
import { DIRECTIVE_BODY_CLASS } from '../../styles/directiveSurface.js'
import { makeDirectiveIconPlaceholder } from '../iconPlaceholder.js'
import { getDirectiveLabelOrAttribute } from '../labels.js'
import {
  applyDirectivePalette,
  getPaletteRenderProperties,
  PALETTE_ATTRIBUTES,
  resolveIconPaletteName,
} from '../palette.js'
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
// shadow. Text, title and ring colours follow the colour scheme through
// `--pmd-scheme-dark` (see styles/directiveSurface.ts).
const calloutVariantClasses: Record<CalloutVariant, string> = {
  danger:
    'bg-linear-to-r from-red-500/10 to-red-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(248_113_113/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(220_38_38/0.2))] text-[color:color-mix(in_oklab,rgb(254_242_242)_calc(var(--pmd-scheme-dark,1)*100%),rgb(69_10_10))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(252_165_165)_calc(var(--pmd-scheme-dark,1)*100%),rgb(185_28_28))]',
  info:
    'bg-linear-to-r from-sky-500/10 to-sky-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(56_189_248/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(2_132_199/0.2))] text-[color:color-mix(in_oklab,rgb(240_249_255)_calc(var(--pmd-scheme-dark,1)*100%),rgb(8_47_73))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(125_211_252)_calc(var(--pmd-scheme-dark,1)*100%),rgb(3_105_161))]',
  note:
    'bg-linear-to-r from-slate-500/10 to-slate-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(148_163_184/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(100_116_139/0.2))] text-[color:color-mix(in_oklab,rgb(248_250_252)_calc(var(--pmd-scheme-dark,1)*100%),rgb(15_23_42))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(203_213_225)_calc(var(--pmd-scheme-dark,1)*100%),rgb(71_85_105))]',
  success:
    'bg-linear-to-r from-emerald-500/10 to-emerald-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(52_211_153/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(5_150_105/0.2))] text-[color:color-mix(in_oklab,rgb(236_253_245)_calc(var(--pmd-scheme-dark,1)*100%),rgb(2_44_34))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(110_231_183)_calc(var(--pmd-scheme-dark,1)*100%),rgb(4_120_87))]',
  tip:
    'bg-linear-to-r from-violet-500/10 to-violet-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(167_139_250/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(124_58_237/0.2))] text-[color:color-mix(in_oklab,rgb(245_243_255)_calc(var(--pmd-scheme-dark,1)*100%),rgb(46_16_101))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(196_181_253)_calc(var(--pmd-scheme-dark,1)*100%),rgb(109_40_217))]',
  warning:
    'bg-linear-to-r from-amber-500/10 to-amber-500/10 inset-ring inset-ring-[color:color-mix(in_oklab,rgb(251_191_36/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(217_119_6/0.2))] text-[color:color-mix(in_oklab,rgb(255_251_235)_calc(var(--pmd-scheme-dark,1)*100%),rgb(69_26_3))] [&>[data-directive-title]]:text-[color:color-mix(in_oklab,rgb(252_211_77)_calc(var(--pmd-scheme-dark,1)*100%),rgb(146_64_14))]',
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
  allowedAttributes: ['icon', ...PALETTE_ATTRIBUTES, 'theme', 'title', 'variant'],
  applyHast(node, config, { mergeClassNames }) {
    const variant = typeof node.properties.dataVariant === 'string' ? node.properties.dataVariant : 'note'
    const title = typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined
    // A callout shows one icon; it may carry its own palette (`@pack/name palette=x`).
    const [iconEntry] = parseIconEntries(
      typeof node.properties.dataIcon === 'string' ? node.properties.dataIcon : undefined,
    ).entries
    const icon = iconEntry?.ref
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

    applyDirectivePalette(node, config)

    node.children = [
      ...(title || icon
        ? [
            {
              type: 'element' as const,
              children: [
                ...(icon
                  ? [
                      makeDirectiveIconPlaceholder(
                        icon,
                        [
                          'pmd-callout__icon inline-flex size-4 shrink-0 text-current',
                          iconBesideBody ? 'mt-1.5' : 'mt-0.5',
                        ],
                        resolveIconPaletteName(node, iconEntry),
                      ),
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
      ...getPaletteRenderProperties(node),
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
