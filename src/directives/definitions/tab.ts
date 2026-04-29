import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme, slugThemeName } from '../themes.js'

function getAttribute(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function getTabLabel(node: ContainerDirective, index: number): string {
  return getAttribute(node, 'label') ?? getAttribute(node, 'value') ?? `Tab ${index + 1}`
}

type TabAttributes = null | Record<string, boolean | null | string | undefined> | undefined

export function getTabValueFromAttributes(attributes: TabAttributes, index: number): string {
  const value = attributes?.value
  const label = attributes?.label
  const raw =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : typeof label === 'string' && label.trim()
        ? label.trim()
        : `tab-${index + 1}`

  return slugThemeName(raw)
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
    snippet: ':::tab {label="${Label}"}\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDirective: 'tab',
      dataDisabled: isTabDisabled(node.attributes) ? 'true' : undefined,
      dataLabel: getTabLabel(node, 0),
      dataTheme: getAttribute(node, 'theme'),
      dataValue: getTabValueFromAttributes(node.attributes, 0),
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
