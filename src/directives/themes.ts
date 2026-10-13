import type {
  MarkdownDirectiveTheme,
  MarkdownDirectiveThemeGroup,
  MarkdownDirectiveThemes,
} from '../types/core.js'

import {
  DIRECTIVE_SURFACE_GLASS_PANEL_CLASS,
  DIRECTIVE_SURFACE_MUTED_PANEL_CLASS,
  DIRECTIVE_SURFACE_PANEL_CLASS,
  DIRECTIVE_SURFACE_SOFT_PANEL_CLASS,
  DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS,
} from '../styles/directiveSurface.js'

export type DirectiveThemeGroupName = keyof MarkdownDirectiveThemes

export type ResolvedDirectiveTheme = {
  classes: string
  hookClassName: string
  modifierClassName: string
  name: string
}

export const DEFAULT_CARD_THEMES: MarkdownDirectiveTheme[] = [
  {
    name: 'default',
    classes:
      `group rounded-2xl ${DIRECTIVE_SURFACE_PANEL_CLASS} p-5 transition-colors`,
  },
  {
    name: 'muted',
    classes: `group rounded-2xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-5`,
  },
  {
    name: 'glass',
    classes: `group rounded-2xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} p-5`,
  },
  {
    name: 'cyan',
    classes:
      `group rounded-2xl border border-[color:color-mix(in_oklab,rgb(34_211_238/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(8_145_178/0.2))] bg-[color:color-mix(in_oklab,rgb(8_51_68/0.25)_calc(var(--pmd-scheme-dark,1)*100%),rgb(6_182_212/0.06))] p-5 ${DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS}`,
  },
  {
    name: 'violet',
    classes:
      `group rounded-2xl border border-[color:color-mix(in_oklab,rgb(167_139_250/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(124_58_237/0.2))] bg-[color:color-mix(in_oklab,rgb(46_16_101/0.25)_calc(var(--pmd-scheme-dark,1)*100%),rgb(139_92_246/0.06))] p-5 ${DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS}`,
  },
  {
    name: 'emerald',
    classes:
      `group rounded-2xl border border-[color:color-mix(in_oklab,rgb(52_211_153/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(5_150_105/0.2))] bg-[color:color-mix(in_oklab,rgb(2_44_34/0.25)_calc(var(--pmd-scheme-dark,1)*100%),rgb(16_185_129/0.06))] p-5 ${DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS}`,
  },
  {
    name: 'amber',
    classes:
      `group rounded-2xl border border-[color:color-mix(in_oklab,rgb(251_191_36/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(217_119_6/0.2))] bg-[color:color-mix(in_oklab,rgb(69_26_3/0.25)_calc(var(--pmd-scheme-dark,1)*100%),rgb(245_158_11/0.06))] p-5 ${DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS}`,
  },
  {
    name: 'danger',
    classes:
      `group rounded-2xl border border-[color:color-mix(in_oklab,rgb(248_113_113/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(220_38_38/0.2))] bg-[color:color-mix(in_oklab,rgb(69_10_10/0.25)_calc(var(--pmd-scheme-dark,1)*100%),rgb(239_68_68/0.06))] p-5 ${DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS}`,
  },
]

export const DEFAULT_CARDS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'my-8 grid gap-4' },
  { name: 'compact', classes: 'my-6 grid gap-3' },
  { name: 'spacious', classes: 'my-10 grid gap-6' },
  { name: 'feature-grid', classes: 'my-10 grid gap-5' },
]

export const DEFAULT_STEPS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'my-8' },
  {
    name: 'muted',
    classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_SOFT_PANEL_CLASS} p-5`,
  },
  {
    name: 'glass',
    classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} p-5`,
  },
  {
    name: 'cyan',
    classes: `my-8 rounded-2xl border border-[color:color-mix(in_oklab,rgb(34_211_238/0.15)_calc(var(--pmd-scheme-dark,1)*100%),rgb(8_145_178/0.2))] bg-[color:color-mix(in_oklab,rgb(8_51_68/0.2)_calc(var(--pmd-scheme-dark,1)*100%),rgb(6_182_212/0.05))] p-5`,
  },
]

export const DEFAULT_TABS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_PANEL_CLASS} p-2` },
  { name: 'muted', classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-2` },
  {
    name: 'glass',
    classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} p-2`,
  },
  {
    name: 'underline',
    classes:
      'my-8 [&_[role=tab]]:rounded-none [&_[role=tab][aria-selected=true]]:bg-transparent [&_[role=tab][aria-selected=true]]:shadow-[inset_0_-2px_0_currentColor] [&_[role=tabpanel]]:rounded-none [&_[role=tabpanel]]:border-0 [&_[role=tabpanel]]:bg-transparent [&_[role=tabpanel]]:px-0 [&_[role=tabpanel]]:shadow-none',
  },
  {
    name: 'pills',
    classes: `my-8 rounded-2xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-2 [&_[role=tab]]:rounded-full`,
  },
]

export const DEFAULT_TAB_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: `mt-4 rounded-xl ${DIRECTIVE_SURFACE_PANEL_CLASS} p-4` },
  { name: 'muted', classes: `mt-4 rounded-xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-4` },
  {
    name: 'glass',
    classes: `mt-4 rounded-xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} p-4`,
  },
]

export const DEFAULT_CALLOUT_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'soft', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_SOFT_PANEL_CLASS} px-4 py-3` },
  { name: 'solid', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_PANEL_CLASS} px-4 py-3` },
  {
    name: 'glass',
    classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} px-4 py-3`,
  },
]

export const DEFAULT_DETAILS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_PANEL_CLASS} px-4 py-3` },
  { name: 'muted', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} px-4 py-3` },
  {
    name: 'glass',
    classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_GLASS_PANEL_CLASS} px-4 py-3`,
  },
]

export const DEFAULT_TOC_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_PANEL_CLASS} px-4 py-3 text-[0.95rem]` },
  { name: 'compact', classes: `my-4 rounded-lg ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} px-3 py-2 text-sm` },
  { name: 'sidebar', classes: `my-6 rounded-xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} px-4 py-3 text-[0.95rem]` },
]

export const DEFAULT_SECTION_THEMES: MarkdownDirectiveTheme[] = [
  {
    name: 'default',
    classes:
      `w-full mx-0 my-12 rounded-xl ${DIRECTIVE_SURFACE_SOFT_PANEL_CLASS} p-6 backdrop-blur-2xl [&>h1]:my-2 [&>h1]:text-4xl [&>h1]:font-semibold [&>h2]:my-2 [&>h2]:text-4xl [&>h2]:font-semibold`,
  },
  { name: 'muted', classes: `w-full mx-0 my-12 rounded-xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-6` },
  { name: 'panel', classes: `w-full mx-0 my-12 rounded-2xl ${DIRECTIVE_SURFACE_PANEL_CLASS} p-6` },
]

export const DEFAULT_COLUMNS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'grid grid-cols-1 gap-6 w-full' },
  { name: 'panel', classes: `grid grid-cols-1 gap-6 w-full rounded-2xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-4` },
]

export const DEFAULT_CELL_THEMES: MarkdownDirectiveTheme[] = [
  {
    name: 'default',
    classes:
      'w-full [&>h2]:text-2xl [&>h2]:my-4 [&>h3]:text-xl [&>h3]:my-3 [&>h4]:text-lg [&>h4]:my-2',
  },
  {
    name: 'panel',
    classes:
      `w-full rounded-xl ${DIRECTIVE_SURFACE_MUTED_PANEL_CLASS} p-4 [&>h2]:text-2xl [&>h2]:my-4 [&>h3]:text-xl [&>h3]:my-3 [&>h4]:text-lg [&>h4]:my-2`,
  },
]

export const DEFAULT_DIRECTIVE_THEMES: Record<DirectiveThemeGroupName, MarkdownDirectiveTheme[]> = {
  callout: DEFAULT_CALLOUT_THEMES,
  card: DEFAULT_CARD_THEMES,
  cards: DEFAULT_CARDS_THEMES,
  cell: DEFAULT_CELL_THEMES,
  columns: DEFAULT_COLUMNS_THEMES,
  details: DEFAULT_DETAILS_THEMES,
  section: DEFAULT_SECTION_THEMES,
  steps: DEFAULT_STEPS_THEMES,
  tab: DEFAULT_TAB_THEMES,
  tabs: DEFAULT_TABS_THEMES,
  toc: DEFAULT_TOC_THEMES,
}

function normalizeThemeGroup(
  group?: MarkdownDirectiveThemeGroup,
): { extendDefaults: boolean; items: MarkdownDirectiveTheme[] } {
  if (!group) return { extendDefaults: true, items: [] }
  if (Array.isArray(group)) return { extendDefaults: true, items: group }

  return {
    extendDefaults: group.extendDefaults ?? true,
    items: group.items ?? [],
  }
}

function getThemeItems(
  groupName: DirectiveThemeGroupName,
  themes?: MarkdownDirectiveThemes,
): MarkdownDirectiveTheme[] {
  const group = normalizeThemeGroup(themes?.[groupName])
  const items = group.extendDefaults ? [...DEFAULT_DIRECTIVE_THEMES[groupName]] : []
  const byName = new Map(items.map((theme) => [theme.name, theme]))

  for (const theme of group.items) byName.set(theme.name, theme)

  return [...byName.values()]
}

export function slugThemeName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default'
}

/** Name of the theme an unthemed or unknown-themed directive falls back to. */
export function getDirectiveFallbackThemeName(
  groupName: DirectiveThemeGroupName,
  themes?: MarkdownDirectiveThemes,
): string {
  return resolveDirectiveTheme(groupName, undefined, themes).name
}

export function getDirectiveThemeNames(
  groupName: DirectiveThemeGroupName,
  themes?: MarkdownDirectiveThemes,
): string[] {
  return getThemeItems(groupName, themes).map((theme) => theme.name)
}

export function hasDirectiveTheme(
  groupName: DirectiveThemeGroupName,
  name: string,
  themes?: MarkdownDirectiveThemes,
): boolean {
  return getThemeItems(groupName, themes).some((theme) => theme.name === name)
}

export function resolveDirectiveTheme(
  groupName: DirectiveThemeGroupName,
  requestedName?: string,
  themes?: MarkdownDirectiveThemes,
): ResolvedDirectiveTheme {
  const items = getThemeItems(groupName, themes)
  const requested = requestedName?.trim() || 'default'
  const found = items.find((theme) => theme.name === requested)
  // Prefer a theme named "default", then the first available theme. With
  // extendDefaults: false that is the first configured item, never a
  // built-in the configuration disabled (CORE-17).
  const fallback =
    items.find((theme) => theme.name === 'default') ?? items[0] ?? DEFAULT_DIRECTIVE_THEMES[groupName][0]
  const resolved = found ?? fallback
  const slug = slugThemeName(resolved.name)
  const hookClassName = `vl-md-${groupName}`

  return {
    name: resolved.name,
    classes: resolved.classes,
    hookClassName,
    modifierClassName: `${hookClassName}--theme-${slug}`,
  }
}

export function mergeMarkdownDirectiveThemes(
  ...themes: Array<MarkdownDirectiveThemes | undefined>
): MarkdownDirectiveThemes | undefined {
  const merged: MarkdownDirectiveThemes = {}

  for (const themeConfig of themes) {
    if (!themeConfig) continue

    for (const groupName of Object.keys(DEFAULT_DIRECTIVE_THEMES) as DirectiveThemeGroupName[]) {
      const next = themeConfig[groupName]
      if (!next) continue

      const current = normalizeThemeGroup(merged[groupName])
      const incoming = normalizeThemeGroup(next)
      const byName = new Map(current.items.map((theme) => [theme.name, theme]))
      // A layer only changes extendDefaults when it sets it explicitly; a
      // collection that just adds a theme must not re-enable built-ins that
      // a broader layer disabled (CORE-17).
      const explicitExtendDefaults =
        !Array.isArray(next) && typeof next.extendDefaults === 'boolean'
          ? next.extendDefaults
          : undefined

      for (const item of incoming.items) byName.set(item.name, item)

      merged[groupName] = {
        extendDefaults: explicitExtendDefaults ?? current.extendDefaults,
        items: [...byName.values()],
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}
