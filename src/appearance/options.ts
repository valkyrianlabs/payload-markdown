import type { PayloadMarkdownAppearanceOptions } from '../types.js'

export const DEFAULT_APPEARANCE_SLUG = 'markdown-appearance'
export const DEFAULT_APPEARANCE_CACHE_TTL = 30_000

/** Name of the palettes array field on the appearance global. */
export const APPEARANCE_PALETTES_FIELD = 'palettes'

export type ResolvedAppearanceOptions = {
  cacheTtl: number
  options: PayloadMarkdownAppearanceOptions
  slug: string
}

export function resolveAppearanceOptions(
  value: boolean | PayloadMarkdownAppearanceOptions | undefined,
): ResolvedAppearanceOptions | undefined {
  if (!value) return undefined

  const options = value === true ? {} : value
  const cacheTtl =
    typeof options.cacheTtl === 'number' && Number.isFinite(options.cacheTtl) && options.cacheTtl >= 0
      ? options.cacheTtl
      : DEFAULT_APPEARANCE_CACHE_TTL

  return { slug: options.slug?.trim() || DEFAULT_APPEARANCE_SLUG, cacheTtl, options }
}

