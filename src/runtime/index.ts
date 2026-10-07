import type {
  ConfigOptions,
  DualMarkdownFieldConfig,
  PayloadMarkdownCollectionConfig,
  PayloadMarkdownConfig,
} from '../types.js'
import type { MarkdownCodeConfig, MarkdownConfig, MarkdownRenderConfig } from '../types/core.js'

import { mergeCodeConfigFromRenderConfigs } from '../core/codeConfig.js'
import { mergeMarkdownDirectiveThemes } from '../directives/themes.js'
import { PAYLOAD_MARKDOWN_VERSION } from '../version.js'

export type PayloadMarkdownResolvedSettings = {
  code?: MarkdownCodeConfig
  /** Render-relevant collection settings (`code`, `config`, `themes`), or `true`. */
  collections: Partial<Record<string, PayloadMarkdownCollectionConfig | true>>
  config?: ConfigOptions
  enabled: boolean
  icons?: MarkdownRenderConfig['icons']
  themes?: MarkdownRenderConfig['themes']
  /** Version of the package copy that created these settings. */
  version?: string
}

/** Key of the plugin's settings on the Payload config's server-only `custom`. */
export const PAYLOAD_MARKDOWN_CONFIG_CUSTOM_KEY = 'payloadMarkdown'

/**
 * Process-wide settings registry key. `Symbol.for` makes every installed copy
 * of this package (for example one pulled in by another plugin) share one
 * registry instead of each keeping its own module-local settings. The key is
 * the same under both package names (scoped and unscoped), so mixing them is
 * detected as duplicate copies too.
 */
export const PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY = Symbol.for(
  '@valkyrianlabs/payload-markdown/settings',
)

type SettingsRegistry = {
  /** Version of the copy that registered `settings`. */
  registeredBy?: string
  /** Registry layout version; bump on incompatible changes. */
  readonly schema: 1
  settings: null | PayloadMarkdownResolvedSettings
  /** Every package version that registered or read settings in this process. */
  versions: string[]
  warned: boolean
}

type RegistryHost = { [PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY]?: SettingsRegistry }

function warnAboutDuplicateCopies(registry: SettingsRegistry) {
  if (registry.warned || registry.versions.length < 2) return

  registry.warned = true

  // eslint-disable-next-line no-console
  console.warn(
    `[payload-markdown] Duplicate copies of payload-markdown are loaded in this process ` +
      `(versions ${registry.versions.join(', ')}). They share one settings registry` +
      `${registry.registeredBy ? ` (registered by ${registry.registeredBy})` : ''}, but each copy renders with its own code. ` +
      'Install a single version, for example by making it a peer dependency or with a package manager override.',
  )
}

function getSettingsRegistry(): SettingsRegistry {
  const host = globalThis as RegistryHost
  let registry = host[PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY]

  if (!registry) {
    registry = { schema: 1, settings: null, versions: [], warned: false }
    Object.defineProperty(globalThis, PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY, {
      configurable: true,
      enumerable: false,
      value: registry,
      writable: false,
    })
  }

  if (!registry.versions.includes(PAYLOAD_MARKDOWN_VERSION)) {
    registry.versions.push(PAYLOAD_MARKDOWN_VERSION)
    warnAboutDuplicateCopies(registry)
  }

  return registry
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  if ('$$typeof' in value) return false // React elements stay as they are

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

/** Deep copy of arrays and plain objects, frozen; other values are kept by reference. */
function freezeCopy<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map((item) => freezeCopy(item))) as T
  if (!isPlainObject(value)) return value

  const copy: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(value)) copy[key] = freezeCopy(child)

  return Object.freeze(copy) as T
}

function pickCollectionRenderSettings(
  collections: PayloadMarkdownConfig['collections'],
): PayloadMarkdownResolvedSettings['collections'] {
  const picked: PayloadMarkdownResolvedSettings['collections'] = {}

  for (const [slug, entry] of Object.entries(collections ?? {})) {
    if (!entry) continue

    picked[slug] =
      entry === true
        ? true
        : {
            ...(entry.code !== undefined ? { code: entry.code } : {}),
            ...(entry.config !== undefined ? { config: entry.config } : {}),
            ...(entry.themes !== undefined ? { themes: entry.themes } : {}),
          }
  }

  return picked
}

/**
 * Builds the frozen, render-only settings snapshot for plugin options. Field
 * installation options (field, fieldName, installField, installIntoBlocks)
 * are not part of it; they only matter while the config is built.
 */
export function createPayloadMarkdownSettings(
  pluginOptions: PayloadMarkdownConfig = {},
): PayloadMarkdownResolvedSettings {
  return freezeCopy({
    code: pluginOptions.code,
    collections: pickCollectionRenderSettings(pluginOptions.collections),
    config: pluginOptions.config,
    enabled: pluginOptions.enabled !== false,
    icons: pluginOptions.icons,
    themes: pluginOptions.themes,
    version: PAYLOAD_MARKDOWN_VERSION,
  })
}

/** Registers settings process-wide (last registration wins) and returns them. */
export function setPayloadMarkdownSettings(
  pluginOptions: PayloadMarkdownConfig | PayloadMarkdownResolvedSettings = {},
): PayloadMarkdownResolvedSettings {
  const settings = isResolvedSettings(pluginOptions)
    ? pluginOptions
    : createPayloadMarkdownSettings(pluginOptions)
  const registry = getSettingsRegistry()

  registry.settings = settings
  registry.registeredBy = PAYLOAD_MARKDOWN_VERSION

  return settings
}

export function getPayloadMarkdownSettings(): PayloadMarkdownResolvedSettings {
  const settings = getSettingsRegistry().settings

  if (!settings) {
    throw new Error(
      '[payload-markdown] Settings have not been initialized. ' +
        'Make sure payloadMarkdown(...) is included in your Payload plugins array before using runtime helpers.',
    )
  }

  return settings
}

export function maybeGetPayloadMarkdownSettings(): null | PayloadMarkdownResolvedSettings {
  return getSettingsRegistry().settings
}

export function clearPayloadMarkdownSettings() {
  getSettingsRegistry().settings = null
}

/**
 * Where renderers may take plugin settings from: the settings object itself,
 * a Payload config (`config.custom.payloadMarkdown`), or a Payload instance
 * (`payload.config.custom.payloadMarkdown`).
 */
export type PayloadMarkdownSettingsSource =
  | { config: { custom?: Record<string, unknown> } }
  | { custom?: Record<string, unknown> }
  | PayloadMarkdownResolvedSettings

function isResolvedSettings(value: unknown): value is PayloadMarkdownResolvedSettings {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as PayloadMarkdownResolvedSettings).enabled === 'boolean' &&
    Boolean((value as PayloadMarkdownResolvedSettings).collections) &&
    typeof (value as PayloadMarkdownResolvedSettings).collections === 'object'
  )
}

function readCustomSettings(custom: unknown): null | PayloadMarkdownResolvedSettings {
  if (!custom || typeof custom !== 'object') return null

  const value = (custom as Record<string, unknown>)[PAYLOAD_MARKDOWN_CONFIG_CUSTOM_KEY]

  return isResolvedSettings(value) ? value : null
}

/** Resolves a settings source; `null` when it carries no payload-markdown settings. */
export function readPayloadMarkdownSettings(
  source: null | PayloadMarkdownSettingsSource | undefined,
): null | PayloadMarkdownResolvedSettings {
  if (!source || typeof source !== 'object') return null
  if (isResolvedSettings(source)) return source
  if ('custom' in source) return readCustomSettings(source.custom)

  if ('config' in source && source.config && typeof source.config === 'object')
    return readCustomSettings((source.config as { custom?: unknown }).custom)

  return null
}

/**
 * The settings a render uses: an explicit source wins; without one, the
 * process registry. `false` means "no plugin settings".
 */
export function resolvePayloadMarkdownSettings(
  source?: false | null | PayloadMarkdownSettingsSource,
): null | PayloadMarkdownResolvedSettings {
  if (source === false) return null
  if (source) return readPayloadMarkdownSettings(source)

  return maybeGetPayloadMarkdownSettings()
}

export function isDualMarkdownFieldConfig(
  value: ConfigOptions | undefined,
): value is DualMarkdownFieldConfig {
  if (!value || typeof value !== 'object') return false
  return 'blocks' in value || 'field' in value
}

export function resolveConfigOptions(value?: ConfigOptions): {
  blocks?: MarkdownConfig
  field?: MarkdownConfig
} {
  if (!value) return {}

  if (isDualMarkdownFieldConfig(value)) {
    return {
      blocks: value.blocks,
      field: value.field,
    }
  }

  return {
    blocks: value,
    field: value,
  }
}

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function mergeMarkdownConfigs(
  ...configs: Array<MarkdownConfig | undefined>
): MarkdownConfig | undefined {
  const filtered = configs.filter(Boolean)
  if (filtered.length === 0) return undefined

  const merged: MarkdownConfig = {}

  for (const config of filtered) {
    if (!config) continue

    if (config.className) merged.className = joinClassNames(merged.className, config.className)

    if (config.wrapperClassName)
      merged.wrapperClassName = joinClassNames(merged.wrapperClassName, config.wrapperClassName)

    if (config.columnClassName)
      merged.columnClassName = joinClassNames(merged.columnClassName, config.columnClassName)

    if (config.sectionClassName)
      merged.sectionClassName = joinClassNames(merged.sectionClassName, config.sectionClassName)

    if (config.variant !== undefined) merged.variant = config.variant
    if (config.size !== undefined) merged.size = config.size
    if (config.lead !== undefined) merged.lead = config.lead
    if (config.fullBleedCode !== undefined) merged.fullBleedCode = config.fullBleedCode
    if (config.mutedHeadings !== undefined) merged.mutedHeadings = config.mutedHeadings
    if (config.enableGutter !== undefined) merged.enableGutter = config.enableGutter

    if (config.options) {
      merged.options = {
        ...(merged.options ?? {}),
        ...config.options,
      }
    }
  }

  return merged
}

export function mergeMarkdownRenderConfigs(
  ...configs: Array<MarkdownRenderConfig | undefined>
): MarkdownRenderConfig | undefined {
  const merged = mergeMarkdownConfigs(...configs)
  const code = mergeCodeConfigFromRenderConfigs(...configs)
  let icons: MarkdownRenderConfig['icons']
  const themes = mergeMarkdownDirectiveThemes(...configs.map((config) => config?.themes))

  for (const config of configs)
    if (config?.icons !== undefined) icons = config.icons

  if (!merged && !code && !icons && !themes) return undefined

  return {
    ...(merged ?? {}),
    ...(code ? { code } : {}),
    ...(icons ? { icons } : {}),
    ...(themes ? { themes } : {}),
  }
}

export function resolveGlobalMarkdownConfigs(
  settings: null | PayloadMarkdownResolvedSettings = maybeGetPayloadMarkdownSettings(),
) {
  const current = settings
  if (!current) return {}

  const resolved = resolveConfigOptions(current.config)
  const shared: MarkdownRenderConfig = {
    code: current.code,
    icons: current.icons,
    themes: current.themes,
  }

  return {
    blocks: mergeMarkdownRenderConfigs(resolved.blocks, shared),
    field: mergeMarkdownRenderConfigs(resolved.field, shared),
  }
}

export function resolveCollectionMarkdownConfigs(
  collectionSlug?: string,
  settings: null | PayloadMarkdownResolvedSettings = maybeGetPayloadMarkdownSettings(),
) {
  const globalResolved = resolveGlobalMarkdownConfigs(settings)

  if (!collectionSlug) return globalResolved

  const current = settings
  if (!current) return globalResolved

  const collectionEntry = current.collections?.[collectionSlug]

  if (!collectionEntry || collectionEntry === true) {
    return globalResolved
  }

  const collectionResolved = resolveConfigOptions(collectionEntry.config)
  const shared: MarkdownRenderConfig = {
    code: collectionEntry.code,
    themes: collectionEntry.themes,
  }

  return {
    blocks: mergeMarkdownRenderConfigs(globalResolved.blocks, collectionResolved.blocks, shared),
    field: mergeMarkdownRenderConfigs(globalResolved.field, collectionResolved.field, shared),
  }
}

export function resolveMarkdownBlockDefaults(
  collectionSlug?: string,
  settings: null | PayloadMarkdownResolvedSettings = maybeGetPayloadMarkdownSettings(),
) {
  return resolveCollectionMarkdownConfigs(collectionSlug, settings).blocks
}

export function resolveMarkdownFieldDefaults(
  collectionSlug?: string,
  settings: null | PayloadMarkdownResolvedSettings = maybeGetPayloadMarkdownSettings(),
) {
  return resolveCollectionMarkdownConfigs(collectionSlug, settings).field
}

const OVERRIDE_CLASS_KEYS = ['className', 'columnClassName', 'sectionClassName', 'wrapperClassName'] as const

/**
 * Applies a highest-precedence config layer (per-block `md-params`). Set values
 * win field by field: class names replace the inherited value instead of being
 * appended, scalars and code options replace when defined. Empty or undefined
 * values inherit, so an override never wipes global or collection settings it
 * does not set.
 */
export function applyMarkdownOverrides(
  base: MarkdownRenderConfig | undefined,
  overrides: MarkdownRenderConfig | undefined,
): MarkdownRenderConfig | undefined {
  if (!overrides) return base

  const next: MarkdownRenderConfig = { ...(base ?? {}) }

  for (const key of OVERRIDE_CLASS_KEYS) {
    const value = overrides[key]
    if (typeof value === 'string' && value.trim()) next[key] = value.trim()
  }

  if (overrides.variant !== undefined) next.variant = overrides.variant
  if (overrides.size !== undefined) next.size = overrides.size
  if (overrides.enableGutter !== undefined) next.enableGutter = overrides.enableGutter
  if (overrides.mutedHeadings !== undefined) next.mutedHeadings = overrides.mutedHeadings
  if (overrides.fullBleedCode !== undefined) next.fullBleedCode = overrides.fullBleedCode

  // Code options: fold the inherited legacy `options.*` and `code` together,
  // then apply the override's keys on top, so `code` (which wins over legacy
  // options at render time) carries every inherited value.
  const code = mergeCodeConfigFromRenderConfigs(base, overrides)
  if (code) next.code = code

  if (overrides.icons !== undefined) next.icons = overrides.icons

  const themes = mergeMarkdownDirectiveThemes(base?.themes, overrides.themes)
  if (themes) next.themes = themes

  return next
}

export type ResolveMarkdownRenderConfigOptions = {
  collectionSlug?: string
  /** Highest-precedence layer (see `applyMarkdownOverrides`). */
  overrides?: MarkdownRenderConfig
  scope?: 'blocks' | 'field'
  /** Explicit settings source; wins over the process registry. `false` ignores plugin settings. */
  settings?: false | null | PayloadMarkdownSettingsSource
} & MarkdownRenderConfig

/**
 * The render config a render uses: the plugin defaults for the scope and
 * collection (from `settings`, else the registry) merged under the explicit
 * config. Shared by `MarkdownRenderer` and the headless `renderMarkdown`.
 */
export function resolveMarkdownRenderConfig<T extends ResolveMarkdownRenderConfigOptions>(
  options: T,
): MarkdownRenderConfig | T {
  const settings = resolvePayloadMarkdownSettings(options.settings)
  const defaults =
    options.scope === 'blocks'
      ? resolveMarkdownBlockDefaults(options.collectionSlug, settings)
      : resolveMarkdownFieldDefaults(options.collectionSlug, settings)

  const merged = mergeMarkdownRenderConfigs(defaults, options) ?? options

  return applyMarkdownOverrides(merged, options.overrides) ?? merged
}
