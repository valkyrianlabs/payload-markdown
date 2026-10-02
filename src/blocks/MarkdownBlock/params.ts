import type {
  MarkdownBlockParams,
  MarkdownBlockParamsConfig,
  MarkdownRenderConfig,
  MarkdownSize,
  MarkdownVariant,
} from '../../types/core.js'

import { resolveFullBleedCode, resolveRenderMarkdownOptions } from '../../core/codeConfig.js'
import { DEFAULT_CODE_THEME } from '../../core/codeToHtml.js'
import { CODE_BLOCK_THEME_OPTIONS } from '../../field/CodeBlockConfig/config.js'

export type { MarkdownBlockParams, MarkdownBlockParamsConfig }

export { MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY } from './constants.js'

/** Renderer defaults for values no config layer sets (mirrors `MarkdownRenderer`). */
const RENDERER_DEFAULTS = {
  enableGutter: false,
  fullBleedCode: false,
  mutedHeadings: false,
  size: 'lg',
  variant: 'blog',
} as const

const SIZES: readonly MarkdownSize[] = ['lg', 'md', 'sm']
const VARIANTS: readonly MarkdownVariant[] = ['blog', 'compact', 'docs', 'unstyled']
const THEME_VALUES = new Set(CODE_BLOCK_THEME_OPTIONS.map((option) => option.value))

function text(value: null | string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function flag(value: boolean | null | undefined): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

/**
 * Maps stored `md-params` to the renderer's highest-precedence override layer
 * (`MarkdownRenderer`'s `overrides`). Only set values are returned, so empty
 * fields inherit the global and collection defaults. The admin field names map
 * to the renderer's: `showLineNumbers` → `code.lineNumbers`, `theme` →
 * `code.shikiTheme`, `enhancedCodeBlocks` → `code.enhanced`, `fullBleedCode` →
 * `code.fullBleed`.
 *
 * Returns `undefined` when params are not enabled or set nothing.
 */
export function resolveMarkdownBlockParams(
  params: MarkdownBlockParams | null | undefined,
): MarkdownRenderConfig | undefined {
  if (!params?.enable || !params.config) return undefined

  const config = params.config
  const options = config.options ?? {}
  const code: NonNullable<MarkdownRenderConfig['code']> = {}
  const resolved: MarkdownRenderConfig = {}

  const shikiTheme = text(options.theme)
  if (shikiTheme) code.shikiTheme = shikiTheme
  if (flag(options.showLineNumbers) !== undefined) code.lineNumbers = flag(options.showLineNumbers)
  if (flag(options.enhancedCodeBlocks) !== undefined) code.enhanced = flag(options.enhancedCodeBlocks)
  if (flag(config.fullBleedCode) !== undefined) code.fullBleed = flag(config.fullBleedCode)

  for (const key of ['className', 'columnClassName', 'sectionClassName', 'wrapperClassName'] as const) {
    const value = text(config[key])
    if (value) resolved[key] = value
  }

  if (SIZES.includes(config.size as MarkdownSize)) resolved.size = config.size as MarkdownSize
  if (VARIANTS.includes(config.variant as MarkdownVariant))
    resolved.variant = config.variant as MarkdownVariant
  if (flag(config.enableGutter) !== undefined) resolved.enableGutter = flag(config.enableGutter)
  if (flag(config.mutedHeadings) !== undefined) resolved.mutedHeadings = flag(config.mutedHeadings)
  if (Object.keys(code).length > 0) resolved.code = code

  return Object.keys(resolved).length > 0 ? resolved : undefined
}

/**
 * The `md-params.config` values that describe how a block renders with
 * `enable` unchecked: the global + collection block defaults, with the
 * renderer's built-in defaults for anything unset. The admin pre-fills the
 * block's fields with these when "Enable Blocks Params" is checked, so enabling
 * changes nothing until a field is edited.
 */
export function resolveEffectiveMarkdownBlockParams(
  defaults: MarkdownRenderConfig | undefined,
): MarkdownBlockParamsConfig {
  const config = defaults ?? {}
  const code = resolveRenderMarkdownOptions(config)
  const enhancedCodeBlocks = code.enhancedCodeBlocks ?? true
  const theme = text(code.theme) ?? DEFAULT_CODE_THEME

  return {
    className: config.className ?? '',
    columnClassName: config.columnClassName ?? '',
    enableGutter: config.enableGutter ?? RENDERER_DEFAULTS.enableGutter,
    fullBleedCode: resolveFullBleedCode(config) ?? RENDERER_DEFAULTS.fullBleedCode,
    mutedHeadings: config.mutedHeadings ?? RENDERER_DEFAULTS.mutedHeadings,
    options: {
      enhancedCodeBlocks,
      // Same rule as the code renderer: line numbers only render on enhanced blocks.
      showLineNumbers: enhancedCodeBlocks ? (code.lineNumbers ?? true) : false,
      // The field is a select; a configured theme outside its options is left unset (inherited).
      theme: THEME_VALUES.has(theme) ? theme : null,
    },
    sectionClassName: config.sectionClassName ?? '',
    size: config.size ?? RENDERER_DEFAULTS.size,
    variant: config.variant ?? RENDERER_DEFAULTS.variant,
    wrapperClassName: config.wrapperClassName ?? '',
  }
}
