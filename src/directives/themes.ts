import type {
  MarkdownDirectiveTheme,
  MarkdownDirectiveThemeGroup,
  MarkdownDirectiveThemes,
} from '../types/core.js'

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
      'group rounded-2xl border border-border bg-black/5 p-5 shadow-sm transition-colors dark:bg-white/5',
  },
  {
    name: 'muted',
    classes: 'group rounded-2xl border border-border/70 bg-muted/40 p-5 shadow-sm',
  },
  {
    name: 'glass',
    classes:
      'group rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/10 backdrop-blur-xl',
  },
  {
    name: 'cyan',
    classes:
      'group rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5 shadow-lg shadow-cyan-500/10',
  },
  {
    name: 'violet',
    classes:
      'group rounded-2xl border border-violet-400/40 bg-violet-950/30 p-5 shadow-lg shadow-violet-500/10',
  },
  {
    name: 'emerald',
    classes:
      'group rounded-2xl border border-emerald-400/40 bg-emerald-950/30 p-5 shadow-lg shadow-emerald-500/10',
  },
  {
    name: 'amber',
    classes:
      'group rounded-2xl border border-amber-400/45 bg-amber-950/25 p-5 shadow-lg shadow-amber-500/10',
  },
  {
    name: 'danger',
    classes:
      'group rounded-2xl border border-red-400/45 bg-red-950/25 p-5 shadow-lg shadow-red-500/10',
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
  { name: 'muted', classes: 'my-8 rounded-2xl border border-border/60 bg-muted/30 p-5' },
  {
    name: 'glass',
    classes: 'my-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl',
  },
  {
    name: 'cyan',
    classes: 'my-8 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-5',
  },
]

export const DEFAULT_CALLOUT_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'soft', classes: 'my-6 rounded-xl border px-4 py-3' },
  { name: 'solid', classes: 'my-6 rounded-xl border px-4 py-3 shadow-sm' },
  {
    name: 'glass',
    classes: 'my-6 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl',
  },
]

export const DEFAULT_DETAILS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'my-6 rounded-xl border border-border bg-black/5 px-4 py-3 dark:bg-white/5' },
  { name: 'muted', classes: 'my-6 rounded-xl border border-border/70 bg-muted/40 px-4 py-3' },
  {
    name: 'glass',
    classes: 'my-6 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl',
  },
]

export const DEFAULT_TOC_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'my-6 rounded-xl border border-border bg-black/5 px-4 py-3 dark:bg-white/5' },
  { name: 'compact', classes: 'my-4 rounded-lg border border-border/70 bg-black/5 px-3 py-2 text-sm dark:bg-white/5' },
  { name: 'sidebar', classes: 'my-6 rounded-xl border border-border/70 bg-muted/30 px-4 py-3' },
]

export const DEFAULT_SECTION_THEMES: MarkdownDirectiveTheme[] = [
  {
    name: 'default',
    classes:
      'bg-black/10 dark:bg-white/10 w-full mx-0 my-12 p-6 backdrop-blur-2xl rounded-xl [&>h1]:my-2 [&>h1]:text-4xl [&>h1]:font-semibold [&>h2]:my-2 [&>h2]:text-4xl [&>h2]:font-semibold border-none',
  },
  { name: 'muted', classes: 'w-full mx-0 my-12 rounded-xl border border-border/60 bg-muted/30 p-6' },
  { name: 'panel', classes: 'w-full mx-0 my-12 rounded-2xl border border-border bg-card/70 p-6 shadow-sm' },
]

export const DEFAULT_COLUMNS_THEMES: MarkdownDirectiveTheme[] = [
  { name: 'default', classes: 'grid grid-cols-1 gap-6 w-full' },
  { name: 'panel', classes: 'grid grid-cols-1 gap-6 w-full rounded-2xl border border-border/60 bg-black/5 p-4 dark:bg-white/5' },
]

export const DEFAULT_CELL_THEMES: MarkdownDirectiveTheme[] = [
  {
    name: 'default',
    classes:
      'flex flex-col w-full gap-2 [&>h2]:text-2xl [&>h2]:my-4 [&>h3]:text-xl [&>h3]:my-3 [&>h4]:text-lg [&>h4]:my-2',
  },
  {
    name: 'panel',
    classes:
      'flex flex-col w-full gap-2 rounded-xl border border-border/60 bg-black/5 p-4 dark:bg-white/5 [&>h2]:text-2xl [&>h2]:my-4 [&>h3]:text-xl [&>h3]:my-3 [&>h4]:text-lg [&>h4]:my-2',
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
  const fallback = items.find((theme) => theme.name === 'default') ?? DEFAULT_DIRECTIVE_THEMES[groupName][0]
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

      for (const item of incoming.items) byName.set(item.name, item)

      merged[groupName] = {
        extendDefaults: incoming.extendDefaults,
        items: [...byName.values()],
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}
