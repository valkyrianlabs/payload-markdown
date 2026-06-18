import type { LayoutDirectiveDefinition } from '../types.js'

export const BADGES_ALIGNS = ['left', 'center', 'right'] as const
export const BADGES_GAPS = ['sm', 'md', 'lg'] as const
export const BADGES_WRAPS = ['true', 'false'] as const

export const DEFAULT_BADGES_ALIGN = 'left'
export const DEFAULT_BADGES_GAP = 'md'
export const DEFAULT_BADGES_WRAP = 'true'

type BadgesAlign = (typeof BADGES_ALIGNS)[number]
type BadgesGap = (typeof BADGES_GAPS)[number]
type BadgesWrap = (typeof BADGES_WRAPS)[number]

function isBadgesAlign(value: unknown): value is BadgesAlign {
  return typeof value === 'string' && BADGES_ALIGNS.includes(value as BadgesAlign)
}

function isBadgesGap(value: unknown): value is BadgesGap {
  return typeof value === 'string' && BADGES_GAPS.includes(value as BadgesGap)
}

function isBadgesWrap(value: unknown): value is BadgesWrap {
  return typeof value === 'string' && BADGES_WRAPS.includes(value as BadgesWrap)
}

export const badgesDirective: LayoutDirectiveDefinition = {
  name: 'badges',
  allowedAttributes: ['align', 'gap', 'wrap'],
  applyHast(node, _config, { mergeClassNames }) {
    const align =
      typeof node.properties.dataAlign === 'string' && isBadgesAlign(node.properties.dataAlign)
        ? node.properties.dataAlign
        : DEFAULT_BADGES_ALIGN
    const gap =
      typeof node.properties.dataGap === 'string' && isBadgesGap(node.properties.dataGap)
        ? node.properties.dataGap
        : DEFAULT_BADGES_GAP
    const wrap =
      typeof node.properties.dataWrap === 'string' && isBadgesWrap(node.properties.dataWrap)
        ? node.properties.dataWrap
        : DEFAULT_BADGES_WRAP

    node.properties.dataAlign = align
    node.properties.dataGap = gap
    node.properties.dataWrap = wrap
    node.properties.className = mergeClassNames(
      'not-prose',
      'pmd-badges',
      `pmd-badges--align-${align}`,
      `pmd-badges--gap-${gap}`,
      `pmd-badges--wrap-${wrap}`,
    )
  },
  attributeValues: {
    align: BADGES_ALIGNS,
    gap: BADGES_GAPS,
    wrap: BADGES_WRAPS,
  },
  defaultAttributes: {
    align: DEFAULT_BADGES_ALIGN,
    gap: DEFAULT_BADGES_GAP,
    wrap: DEFAULT_BADGES_WRAP,
  },
  description: 'Badge group wrapper for one or more Shields badge directives.',
  editor: {
    detail: 'Badge group directive',
    label: 'Badges',
    snippet:
      ':::badges{\n  align="${left}"\n  gap="${md}"\n  wrap=${true}\n}\n::badge[${npm version}]{\n  type="${npm}"\n  target="${version}"\n  package="${package-name}"\n}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataAlign: typeof node.attributes?.align === 'string' ? node.attributes.align : DEFAULT_BADGES_ALIGN,
      dataDirective: 'badges',
      dataGap: typeof node.attributes?.gap === 'string' ? node.attributes.gap : DEFAULT_BADGES_GAP,
      dataWrap: typeof node.attributes?.wrap === 'string' ? node.attributes.wrap : DEFAULT_BADGES_WRAP,
    }
  },
  kind: 'badges',
  openMarker: ':::badges',
  public: true,
  supportsAttributes: true,
  tagName: 'div',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.align === 'string' && !isBadgesAlign(attributes.align))
      warnings.push(
        `Invalid badges align "${attributes.align}". Falling back to "${DEFAULT_BADGES_ALIGN}".`,
      )

    if (typeof attributes.gap === 'string' && !isBadgesGap(attributes.gap))
      warnings.push(
        `Invalid badges gap "${attributes.gap}". Falling back to "${DEFAULT_BADGES_GAP}".`,
      )

    if (typeof attributes.wrap === 'string' && !isBadgesWrap(attributes.wrap))
      warnings.push(
        `Invalid badges wrap "${attributes.wrap}". Falling back to "${DEFAULT_BADGES_WRAP}".`,
      )

    return warnings
  },
}
