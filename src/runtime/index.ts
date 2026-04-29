import type {
  ConfigOptions,
  DualMarkdownFieldConfig,
  PayloadMarkdownCollectionConfig,
  PayloadMarkdownConfig,
} from '../types.js'
import type { MarkdownCodeConfig, MarkdownConfig, MarkdownRenderConfig } from '../types/core.js'

import { mergeCodeConfigFromRenderConfigs } from '../core/codeConfig.js'
import { mergeMarkdownDirectiveThemes } from '../directives/themes.js'

export type PayloadMarkdownResolvedSettings = {
  code?: MarkdownCodeConfig
  collections: Partial<Record<string, PayloadMarkdownCollectionConfig | true>>
  config?: ConfigOptions
  enabled: boolean
  themes?: MarkdownRenderConfig['themes']
}

let settings: null | PayloadMarkdownResolvedSettings = null

export function setPayloadMarkdownSettings(pluginOptions: PayloadMarkdownConfig = {}) {
  settings = {
    code: pluginOptions.code,
    collections: pluginOptions.collections ?? {},
    config: pluginOptions.config,
    enabled: pluginOptions.enabled !== false,
    themes: pluginOptions.themes,
  }
}

export function getPayloadMarkdownSettings(): PayloadMarkdownResolvedSettings {
  if (!settings) {
    throw new Error(
      '[payload-markdown] Settings have not been initialized. ' +
        'Make sure payloadMarkdown(...) is included in your Payload plugins array before using runtime helpers.',
    )
  }

  return settings
}

export function maybeGetPayloadMarkdownSettings(): null | PayloadMarkdownResolvedSettings {
  return settings
}

export function clearPayloadMarkdownSettings() {
  settings = null
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
  const themes = mergeMarkdownDirectiveThemes(...configs.map((config) => config?.themes))

  if (!merged && !code && !themes) return undefined

  return {
    ...(merged ?? {}),
    ...(code ? { code } : {}),
    ...(themes ? { themes } : {}),
  }
}

export function resolveGlobalMarkdownConfigs() {
  const current = maybeGetPayloadMarkdownSettings()
  if (!current) return {}

  const resolved = resolveConfigOptions(current.config)
  const shared: MarkdownRenderConfig = {
    code: current.code,
    themes: current.themes,
  }

  return {
    blocks: mergeMarkdownRenderConfigs(resolved.blocks, shared),
    field: mergeMarkdownRenderConfigs(resolved.field, shared),
  }
}

export function resolveCollectionMarkdownConfigs(collectionSlug?: string) {
  const globalResolved = resolveGlobalMarkdownConfigs()

  if (!collectionSlug) return globalResolved

  const current = maybeGetPayloadMarkdownSettings()
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

export function resolveMarkdownBlockDefaults(collectionSlug?: string) {
  return resolveCollectionMarkdownConfigs(collectionSlug).blocks
}

export function resolveMarkdownFieldDefaults(collectionSlug?: string) {
  return resolveCollectionMarkdownConfigs(collectionSlug).field
}
