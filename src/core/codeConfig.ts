import type { MarkdownCodeConfig, MarkdownRenderConfig, RenderMarkdownOptions } from '../types/core.js'

export function resolveCodeConfigFromLegacy(config?: MarkdownRenderConfig): MarkdownCodeConfig | undefined {
  if (!config) return undefined

  const legacy: MarkdownCodeConfig = {}

  if (config.options?.langs) legacy.langs = config.options.langs
  if (config.options?.lineNumbers !== undefined) legacy.lineNumbers = config.options.lineNumbers
  if (config.options?.theme) legacy.shikiTheme = config.options.theme
  if (config.options?.enhancedCodeBlocks !== undefined)
    legacy.enhanced = config.options.enhancedCodeBlocks
  if (config.fullBleedCode !== undefined) legacy.fullBleed = config.fullBleedCode

  return Object.keys(legacy).length > 0 ? legacy : undefined
}

export function mergeMarkdownCodeConfigs(
  ...configs: Array<MarkdownCodeConfig | undefined>
): MarkdownCodeConfig | undefined {
  const merged: MarkdownCodeConfig = {}

  for (const config of configs) {
    if (!config) continue

    if (config.enhanced !== undefined) merged.enhanced = config.enhanced
    if (config.fullBleed !== undefined) merged.fullBleed = config.fullBleed
    if (config.langs !== undefined) merged.langs = config.langs
    if (config.lineNumbers !== undefined) merged.lineNumbers = config.lineNumbers
    if (config.shikiTheme !== undefined) merged.shikiTheme = config.shikiTheme
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}

export function mergeCodeConfigFromRenderConfigs(
  ...configs: Array<MarkdownRenderConfig | undefined>
): MarkdownCodeConfig | undefined {
  const ordered: Array<MarkdownCodeConfig | undefined> = []

  for (const config of configs) {
    if (!config) continue

    ordered.push(resolveCodeConfigFromLegacy(config), config.code)
  }

  return mergeMarkdownCodeConfigs(...ordered)
}

export function resolveRenderMarkdownOptions(
  config: MarkdownRenderConfig = {},
): RenderMarkdownOptions {
  const code = mergeMarkdownCodeConfigs(resolveCodeConfigFromLegacy(config), config.code)

  return {
    ...(config.options ?? {}),
    enhancedCodeBlocks: code?.enhanced ?? config.options?.enhancedCodeBlocks,
    langs: code?.langs ?? config.options?.langs,
    lineNumbers: code?.lineNumbers ?? config.options?.lineNumbers,
    theme: code?.shikiTheme ?? config.options?.theme,
  }
}

export function resolveFullBleedCode(config: MarkdownRenderConfig): boolean | undefined {
  return config.code?.fullBleed ?? config.fullBleedCode
}
