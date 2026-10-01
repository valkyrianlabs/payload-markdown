import type {
  MarkdownDirectiveTheme,
  MarkdownDirectiveThemeGroup,
  MarkdownDirectiveThemes,
  MarkdownRenderConfig,
} from '../types/core.js'

/** Key under `field.admin.custom` that carries the editor's directive config. */
export const PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY = 'payloadMarkdown'

/**
 * Serializable subset of the render configuration that the admin editor needs
 * to lint and complete directives the same way the renderer resolves them:
 * the directive theme registry (names only) and the icon pack aliases.
 */
export type MarkdownEditorDirectiveConfig = {
  /** Configured icon pack aliases; `undefined` when unknown to the editor. */
  iconPacks?: string[]
  themes?: MarkdownDirectiveThemes
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
): MarkdownEditorDirectiveConfig {
  const themes: MarkdownDirectiveThemes = {}

  for (const [groupName, group] of Object.entries(config?.themes ?? {}) as Array<
    [keyof MarkdownDirectiveThemes, MarkdownDirectiveThemeGroup | undefined]
  >)
    if (group) themes[groupName] = stripThemeGroup(group)

  return {
    iconPacks: (config?.icons?.packs ?? [])
      .map((pack) => pack.alias.trim())
      .filter((alias) => alias.length > 0),
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

  return {
    ...(Array.isArray(value.iconPacks)
      ? { iconPacks: value.iconPacks.filter((alias): alias is string => typeof alias === 'string') }
      : {}),
    ...(isRecord(value.themes) ? { themes: value.themes as MarkdownDirectiveThemes } : {}),
  }
}
