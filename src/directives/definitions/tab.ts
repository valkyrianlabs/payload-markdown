import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { getDirectiveLabel, getDirectiveLabelOrAttribute } from '../labels.js'
import { resolveDirectiveTheme } from '../themes.js'

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function getTabLabel(node: ContainerDirective, index: number): string {
  return getDirectiveLabelOrAttribute(node, 'label') ?? getAttribute(node, 'value') ?? `Tab ${index + 1}`
}

type TabAttributes = null | Record<string, boolean | null | string | undefined> | undefined

/**
 * Slug used for tab values. ASCII labels slug exactly as before; labels with
 * no ASCII letters or digits (for example `日本`) fall back to the tab's
 * position (`tab-2`) instead of all colliding on `default`. The editor linter
 * uses the same function.
 */
export function slugTabValue(raw: string, index: number): string {
  return toTabSlug(raw) || `tab-${index + 1}`
}

/** ASCII slug of a tab value, or an empty string when nothing remains. */
export function toTabSlug(raw: string): string {
  return raw
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Authored text a tab value is derived from: `value`, then the label. */
export function getTabRawValue(
  attributes: TabAttributes,
  label?: string,
): string | undefined {
  const value = attributes?.value
  const attributeLabel = attributes?.label

  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof label === 'string' && label.trim()) return label.trim()
  if (typeof attributeLabel === 'string' && attributeLabel.trim()) return attributeLabel.trim()

  return undefined
}

export function getTabValueFromAttributes(attributes: TabAttributes, index: number): string {
  return slugTabValue(getTabRawValue(attributes) ?? `tab-${index + 1}`, index)
}

export function getTabValue(node: ContainerDirective, index: number): string {
  return slugTabValue(
    getTabRawValue(node.attributes, getDirectiveLabel(node)) ?? `tab-${index + 1}`,
    index,
  )
}

export type TabsDefaultCandidate = {
  label?: string
  raw?: string
  value: string
}

/**
 * Resolves a `:::tabs{default="…"}` request to a tab value. Matches the
 * slugged value first (the historical behaviour) and then the authored
 * value/label text, so non-ASCII defaults such as `default="中文"` work.
 */
export function resolveTabsDefault(
  requested: string | undefined,
  tabs: TabsDefaultCandidate[],
): string | undefined {
  const trimmed = requested?.trim()
  if (!trimmed) return undefined

  const slug = toTabSlug(trimmed)

  return (
    (slug ? tabs.find((tab) => tab.value === slug)?.value : undefined) ??
    tabs.find((tab) => tab.raw === trimmed || tab.label === trimmed)?.value
  )
}

export function isTabDisabled(attributes: TabAttributes): boolean {
  const disabled = attributes?.disabled

  if (disabled === true) return true
  if (typeof disabled !== 'string') return false

  return disabled !== 'false'
}

export const tabDirective: LayoutDirectiveDefinition = {
  name: 'tab',
  allowedAttributes: ['disabled', 'label', 'theme', 'value'],
  applyHast(node, config, { mergeClassNames }) {
    const theme = resolveDirectiveTheme(
      'tab',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
      'vl-md-tab-panel',
    )
  },
  description: 'Single tab panel. Usually nested inside :::tabs.',
  editor: {
    detail: 'Tabs directive',
    label: 'Tab',
    snippet: ':::tab[${Label}]\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'tab',
      dataDisabled: isTabDisabled(node.attributes) ? 'true' : undefined,
      dataLabel: getTabLabel(node, node.data?.vlTabIndex ?? 0),
      dataTheme: getAttribute(node, 'theme'),
      dataValue: getTabValue(node, node.data?.vlTabIndex ?? 0),
    }
  },
  kind: 'tab',
  openMarker: ':::tab',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  themeAttributes: {
    theme: 'tab',
  },
}
