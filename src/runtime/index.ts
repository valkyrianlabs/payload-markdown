import type { MarkdownConfig } from '../core/types.js'
import type {
  ConfigOptions,
  DualMarkdownFieldConfig,
  PayloadMarkdownCollectionConfig,
  PayloadMarkdownConfig,
} from '../types.js'

export type PayloadMarkdownResolvedSettings = {
  collections: Partial<Record<string, PayloadMarkdownCollectionConfig | true>>
  config?: ConfigOptions
  enabled: boolean
}

let settings: null | PayloadMarkdownResolvedSettings = null

export function setPayloadMarkdownSettings(pluginOptions: PayloadMarkdownConfig = {}) {
  settings = {
    collections: pluginOptions.collections ?? {},
    config: pluginOptions.config,
    enabled: pluginOptions.enabled !== false,
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

export function mergeMarkdownConfigs(
  ...configs: Array<MarkdownConfig | undefined>
): MarkdownConfig | undefined {
  const filtered = configs.filter(Boolean)
  if (filtered.length === 0) return undefined

  const merged: MarkdownConfig = {}

  for (const config of filtered) {
    if (!config) continue

    const { options, ...rest } = config

    for (const [key, value] of Object.entries(rest) as Array<
      [keyof typeof rest, (typeof rest)[keyof typeof rest]]
    >) {
      if (value !== undefined) (merged as Record<string, unknown>)[key] = value
    }

    if (options) {
      merged.options = {
        ...(merged.options ?? {}),
        ...options,
      }
    }
  }

  return merged
}

export function resolveGlobalMarkdownConfigs() {
  const current = maybeGetPayloadMarkdownSettings()
  if (!current) return {}

  const resolved = resolveConfigOptions(current.config)

  return {
    blocks: resolved.blocks,
    field: resolved.field,
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

  return {
    blocks: mergeMarkdownConfigs(globalResolved.blocks, collectionResolved.blocks),
    field: mergeMarkdownConfigs(globalResolved.field, collectionResolved.field),
  }
}

export function resolveMarkdownBlockDefaults(collectionSlug?: string) {
  return resolveCollectionMarkdownConfigs(collectionSlug).blocks
}

export function resolveMarkdownFieldDefaults(collectionSlug?: string) {
  return resolveCollectionMarkdownConfigs(collectionSlug).field
}
