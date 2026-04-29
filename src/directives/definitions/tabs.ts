import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

import { DIRECTIVE_SURFACE_DIVIDER_CLASS } from '../../styles/directiveSurface.js'
import { resolveDirectiveTheme, slugThemeName } from '../themes.js'
import { getTabValueFromAttributes } from './tab.js'

type TabModel = {
  disabled: boolean
  label: string
  node: Element
  panelId: string
  themeName?: string
  triggerId: string
  value: string
}

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

function isTabElement(node: ElementContent): node is Element {
  return node.type === 'element' && node.properties?.dataVlLayout === 'tab'
}

function getStringProperty(
  properties: Element['properties'] | undefined,
  name: string,
): string | undefined {
  const value = properties?.[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getBooleanProperty(properties: Element['properties'] | undefined, name: string): boolean {
  const value = properties?.[name]

  return value === true || value === 'true'
}

function getTabLabel(node: Element, index: number): string {
  return (
    getStringProperty(node.properties, 'dataLabel') ??
    getStringProperty(node.properties, 'dataValue') ??
    `Tab ${index + 1}`
  )
}

function getRequestedDefault(node: Element): string | undefined {
  return getStringProperty(node.properties, 'dataDefault')
}

function makeUniqueValue(rawValue: string, seen: Map<string, number>): string {
  const base = slugThemeName(rawValue)
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)

  return count === 0 ? base : `${base}-${count}`
}

function collectTabs(node: Element): TabModel[] {
  const seen = new Map<string, number>()

  return node.children.filter(isTabElement).map((child, index) => {
    const rawValue = getStringProperty(child.properties, 'dataValue') ?? `tab-${index + 1}`
    const value = makeUniqueValue(rawValue, seen)

    return {
      disabled: getBooleanProperty(child.properties, 'dataDisabled'),
      label: getTabLabel(child, index),
      node: child,
      panelId: `tabs-panel-${value}`,
      themeName: getStringProperty(child.properties, 'dataTheme'),
      triggerId: `tabs-trigger-${value}`,
      value,
    }
  })
}

function makeTabTrigger(tab: TabModel, active: boolean): Element {
  const className = [
    'vl-md-tabs-trigger',
    active ? 'vl-md-tabs-trigger--active' : undefined,
    'rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground aria-selected:bg-white/10 aria-selected:text-foreground',
  ].filter((value): value is string => Boolean(value))

  return {
    type: 'element',
    children: [{ type: 'text', value: tab.label }],
    properties: {
      id: tab.triggerId,
      type: 'button',
      ariaControls: tab.panelId,
      ariaSelected: active ? 'true' : 'false',
      className,
      dataTabTrigger: '',
      dataTabValue: tab.value,
      disabled: tab.disabled || undefined,
      role: 'tab',
      tabIndex: active ? 0 : -1,
    },
    tagName: 'button',
  }
}

function makeTabPanel(
  tab: TabModel,
  active: boolean,
  config: Parameters<NonNullable<LayoutDirectiveDefinition['applyHast']>>[1],
  mergeClassNames: Parameters<NonNullable<LayoutDirectiveDefinition['applyHast']>>[2]['mergeClassNames'],
  fallbackThemeName?: string,
): Element {
  const theme = resolveDirectiveTheme('tab', tab.themeName ?? fallbackThemeName, config.themes)

  return {
    type: 'element',
    children: tab.node.children,
    properties: {
      id: tab.panelId,
      ariaLabelledby: tab.triggerId,
      className: mergeClassNames(
        'vl-md-tabs-panel',
        theme.hookClassName,
        theme.modifierClassName,
        theme.classes,
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
      ),
      dataTabPanel: '',
      dataTabValue: tab.value,
      dataTheme: theme.name,
      hidden: active ? undefined : true,
      role: 'tabpanel',
      tabIndex: 0,
    },
    tagName: 'div',
  }
}

function makeTabList(tabs: TabModel[], activeValue: string): Element {
  return {
    type: 'element',
    children: tabs.map((tab) => makeTabTrigger(tab, tab.value === activeValue)),
    properties: {
      className: [`vl-md-tabs-list flex flex-wrap gap-1 border-b ${DIRECTIVE_SURFACE_DIVIDER_CLASS} pb-2`],
      dataTabsList: '',
      role: 'tablist',
    },
    tagName: 'div',
  }
}

function findActiveTab(tabs: TabModel[], requestedDefault?: string): TabModel | undefined {
  const requested = requestedDefault ? slugThemeName(requestedDefault) : undefined
  const requestedMatch = requested
    ? tabs.find((tab) => tab.value === requested && !tab.disabled) ??
      tabs.find((tab) => tab.value === requested)
    : undefined

  return requestedMatch ?? tabs.find((tab) => !tab.disabled) ?? tabs[0]
}

function getDirectTabDirectives(node: ContainerDirective): ContainerDirective[] {
  return node.children.filter(
    (child): child is ContainerDirective => isContainerDirective(child) && child.name === 'tab',
  )
}

export const tabsDirective: LayoutDirectiveDefinition = {
  name: 'tabs',
  allowedAttributes: ['default', 'tabTheme', 'theme'],
  applyHast(node, config, { mergeClassNames }) {
    const tabs = collectTabs(node)
    const activeTab = findActiveTab(tabs, getRequestedDefault(node))
    const theme = resolveDirectiveTheme(
      'tabs',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )
    const tabTheme =
      typeof node.properties.dataTabTheme === 'string' ? node.properties.dataTabTheme : undefined

    node.properties.dataTheme = theme.name
    node.properties.dataDefault = activeTab?.value
    node.properties.className = mergeClassNames(
      'not-prose',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
    )

    if (!activeTab) {
      node.children = [
        {
          type: 'element',
          children: [{ type: 'text', value: 'No tabs configured.' }],
          properties: {
            className: ['text-sm text-muted-foreground'],
          },
          tagName: 'p',
        },
      ]
      return
    }

    node.children = [
      makeTabList(tabs, activeTab.value),
      ...tabs.map((tab) =>
        makeTabPanel(tab, tab.value === activeTab.value, config, mergeClassNames, tabTheme),
      ),
    ]
  },
  description: 'Accessible tabbed content block with server-rendered panels.',
  editor: {
    detail: 'Tabs directive',
    label: 'Tabs',
    snippet:
      ':::tabs {default="${pnpm}"}\n\n:::tab {label="${pnpm}" value="${pnpm}"}\n```bash\npnpm add ${package-name}\n```\n:::\n\n:::tab {label="${npm}" value="${npm}"}\n```bash\nnpm install ${package-name}\n```\n:::\n\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataDefault:
        typeof node.attributes?.default === 'string' ? node.attributes.default : undefined,
      dataDirective: 'tabs',
      dataTabTheme:
        typeof node.attributes?.tabTheme === 'string' ? node.attributes.tabTheme : undefined,
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
    }
  },
  kind: 'tabs',
  openMarker: ':::tabs',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  themeAttributes: {
    tabTheme: 'tab',
    theme: 'tabs',
  },
  validateMdast(node) {
    const warnings: string[] = []
    const tabs = getDirectTabDirectives(node)
    const values = new Map<string, number>()

    if (tabs.length === 0) warnings.push('Directive "tabs" has no child "tab" directives.')

    tabs.forEach((tab, index) => {
      const value = getTabValueFromAttributes(tab.attributes, index)
      values.set(value, (values.get(value) ?? 0) + 1)
    })

    for (const [value, count] of values)
      if (count > 1) warnings.push(`Duplicate tab value "${value}" in "tabs".`)

    if (typeof node.attributes?.default === 'string') {
      const requested = slugThemeName(node.attributes.default)
      if (!values.has(requested))
        warnings.push(`Invalid tabs default "${node.attributes.default}". Falling back to the first tab.`)
    }

    return warnings
  },
}
