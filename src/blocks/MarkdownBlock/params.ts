import type { MarkdownRenderConfig, MarkdownSize, MarkdownVariant } from '../../types/core.js'

/**
 * Stored shape of the per-block "Markdown Blocks Params" group (`md-params`)
 * created by vlMdConfig(). Values come from the database, so every property
 * may be missing or null.
 */
export type MarkdownBlockParams = {
  config?: {
    className?: null | string
    columnClassName?: null | string
    enableGutter?: boolean | null
    fullBleedCode?: boolean | null
    mutedHeadings?: boolean | null
    options?: {
      enhancedCodeBlocks?: boolean | null
      showLineNumbers?: boolean | null
      theme?: null | string
    } | null
    sectionClassName?: null | string
    size?: null | string
    variant?: null | string
    wrapperClassName?: null | string
  } | null
  enable?: boolean | null
}

const SIZES: readonly MarkdownSize[] = ['lg', 'md', 'sm']
const VARIANTS: readonly MarkdownVariant[] = ['blog', 'compact', 'docs', 'unstyled']

function text(value: null | string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function flag(value: boolean | null | undefined): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

/**
 * Maps stored `md-params` to renderer config. Decision-neutral helper: it is
 * NOT applied by MarkdownBlockComponent today (wiring it would make existing
 * saved params start affecting live pages; see the CORE-6 decision). It fixes
 * the field-name mismatch in one place: the admin field is `showLineNumbers`,
 * the renderer option is `code.lineNumbers`; `theme` maps to
 * `code.shikiTheme` and `enhancedCodeBlocks` to `code.enhanced`.
 *
 * Returns `undefined` when params are disabled or empty.
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
