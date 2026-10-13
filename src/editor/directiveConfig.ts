import type {
  MarkdownDirectiveTheme,
  MarkdownDirectiveThemeGroup,
  MarkdownDirectiveThemes,
  MarkdownRenderConfig,
} from '../types/core.js'

import { getPaletteRegistry } from '../palettes/index.js'

/** Key under `field.admin.custom` that carries the editor's directive config. */
export const PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY = 'payloadMarkdown'

/**
 * Serializable subset of the render configuration that the admin editor needs
 * to lint and complete directives the same way the renderer resolves them:
 * the directive theme registry (names only) and the icon pack aliases.
 */
export type MarkdownEditorDirectiveConfig = {
  /** Slug of the "Markdown Appearance" global, whose palettes the editor loads at runtime. */
  appearanceSlug?: string
  /**
   * Runtime palette names (configured plus admin-managed), set by the field
   * component once loaded; `undefined` while they are still loading.
   */
  getPaletteNames?: () => readonly string[] | undefined
  /** Configured icon pack aliases; `undefined` when unknown to the editor. */
  iconPacks?: string[]
  /** Palette names known when the config was built (built-in and configured). */
  palettes?: string[]
  themes?: MarkdownDirectiveThemes
}

/**
 * Palette names the editor can check against, or `undefined` while palettes
 * managed in the admin are still loading (nothing is reported as unknown then).
 */
export function getEditorPaletteNames(config: MarkdownEditorDirectiveConfig): readonly string[] | undefined {
  const loaded = config.getPaletteNames?.()
  if (loaded) return loaded

  return config.appearanceSlug ? undefined : config.palettes
}

function stripThemeGroup(group: MarkdownDirectiveThemeGroup): MarkdownDirectiveThemeGroup {
  const toNameOnly = (theme: MarkdownDirectiveTheme): MarkdownDirectiveTheme => ({
    name: theme.name,
    classes: '',
  })

  if (Array.isArray(group)) return group.map(toNameOnly)

  return {
    ...(typeof group.extendDefaults === 'boolean' ? { extendDefaults: group.extendDefaults } : {}),
    items: (group.items ?? []).map(toNameOnly),
  }
}

/**
 * Builds the editor config from a resolved render config. Theme classes are
 * dropped (the editor only needs names), so the result is small and safe to
 * serialize into the admin client config.
 */
export function createEditorDirectiveConfig(
  config: MarkdownRenderConfig | undefined,
  appearanceSlug?: string,
): MarkdownEditorDirectiveConfig {
  const themes: MarkdownDirectiveThemes = {}

  for (const [groupName, group] of Object.entries(config?.themes ?? {}) as Array<
    [keyof MarkdownDirectiveThemes, MarkdownDirectiveThemeGroup | undefined]
  >)
    if (group) themes[groupName] = stripThemeGroup(group)

  return {
    ...(appearanceSlug ? { appearanceSlug } : {}),
    iconPacks: (config?.icons?.packs ?? [])
      .map((pack) => pack.alias.trim())
      .filter((alias) => alias.length > 0),
    palettes: getPaletteRegistry(config?.palettes).names(),
    ...(Object.keys(themes).length > 0 ? { themes } : {}),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Reads the editor config from `field.admin.custom`, tolerating bad input. */
export function readEditorDirectiveConfig(custom: unknown): MarkdownEditorDirectiveConfig | undefined {
  if (!isRecord(custom)) return undefined

  const value = custom[PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY]
  if (!isRecord(value)) return undefined

  const strings = (list: unknown) =>
    Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : undefined

  return {
    ...(typeof value.appearanceSlug === 'string' && value.appearanceSlug ? { appearanceSlug: value.appearanceSlug } : {}),
    ...(strings(value.palettes) ? { palettes: strings(value.palettes) } : {}),
    ...(Array.isArray(value.iconPacks)
      ? { iconPacks: value.iconPacks.filter((alias): alias is string => typeof alias === 'string') }
      : {}),
    ...(isRecord(value.themes) ? { themes: value.themes as MarkdownDirectiveThemes } : {}),
  }
}
