import type { MarkdownPalette, MarkdownPaletteColors, MarkdownPalettes } from '../types/core.js'

import { normalizePaletteColor, PALETTE_COLOR_FORMATS } from './colors.js'
import { DEFAULT_PALETTES } from './defaults.js'

export { DEFAULT_PALETTES } from './defaults.js'

/** Palette names: what Markdown references, so they stay simple and stable. */
export const PALETTE_NAME_PATTERN = /^[a-z][\da-z-]{0,47}$/

const COLOR_KEYS = ['accent', 'background', 'border', 'color', 'secondaryColor'] as const

type PaletteColorKey = (typeof COLOR_KEYS)[number]

/** A palette whose every value has been validated and normalized. */
export type ResolvedPalette = {
  dark: MarkdownPaletteColors
  label?: string
  light: MarkdownPaletteColors
  name: string
  secondaryOpacity?: number
}

export type PaletteValidation = {
  errors: string[]
  palette?: ResolvedPalette
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** A value as shown in an error message. */
function show(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function readColors(
  source: Record<string, unknown>,
  prefix: string,
  errors: string[],
): MarkdownPaletteColors {
  const colors: MarkdownPaletteColors = {}

  for (const key of COLOR_KEYS) {
    const raw = source[key]
    if (raw === undefined || raw === null || raw === '') continue

    const color = normalizePaletteColor(raw)

    if (color) colors[key] = color
    else errors.push(`${prefix}${key} "${show(raw)}" is not a valid colour. Use ${PALETTE_COLOR_FORMATS}.`)
  }

  return colors
}

/**
 * Validates and normalizes a palette from any source (config, the admin
 * global, an MCP tool). Invalid colours are reported, never passed through.
 */
export function validatePalette(input: unknown): PaletteValidation {
  if (!isRecord(input)) return { errors: ['A palette must be an object with a "name".'] }

  const errors: string[] = []
  const name = typeof input.name === 'string' ? input.name.trim() : ''

  if (!PALETTE_NAME_PATTERN.test(name))
    errors.push(
      `Palette name "${name}" is invalid. Use 1–48 lowercase letters, digits and dashes, starting with a letter.`,
    )

  const light = readColors(input, '', errors)
  const dark = isRecord(input.dark) ? readColors(input.dark, 'dark.', errors) : {}

  let secondaryOpacity: number | undefined
  const rawOpacity = input.secondaryOpacity

  if (rawOpacity !== undefined && rawOpacity !== null && rawOpacity !== '') {
    const value = typeof rawOpacity === 'string' ? Number(rawOpacity) : rawOpacity

    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1)
      secondaryOpacity = Math.round(value * 1000) / 1000
    else errors.push(`secondaryOpacity "${show(rawOpacity)}" must be a number from 0 to 1.`)
  }

  if (errors.length > 0) return { errors }

  const label = typeof input.label === 'string' && input.label.trim() ? input.label.trim() : undefined

  return {
    errors,
    palette: {
      name,
      dark,
      ...(label ? { label } : {}),
      light,
      ...(secondaryOpacity !== undefined ? { secondaryOpacity } : {}),
    },
  }
}

function normalizeGroup(palettes: MarkdownPalettes | undefined): {
  extendDefaults: boolean
  items: unknown[]
} {
  if (!palettes) return { extendDefaults: true, items: [] }
  if (Array.isArray(palettes)) return { extendDefaults: true, items: palettes }

  return { extendDefaults: palettes.extendDefaults ?? true, items: palettes.items ?? [] }
}

/**
 * Combines palette layers, lowest precedence first (plugin, collection,
 * renderer, admin). Later layers replace palettes by name; a layer only
 * changes `extendDefaults` when it sets it explicitly.
 */
export function mergeMarkdownPalettes(
  ...layers: Array<MarkdownPalettes | undefined>
): MarkdownPalettes | undefined {
  let extendDefaults: boolean | undefined
  const byName = new Map<string, MarkdownPalette>()
  let present = false

  for (const layer of layers) {
    if (!layer) continue
    present = true

    if (!Array.isArray(layer) && typeof layer.extendDefaults === 'boolean') extendDefaults = layer.extendDefaults

    for (const item of normalizeGroup(layer).items)
      if (isRecord(item) && typeof item.name === 'string') byName.set(item.name.trim(), item as MarkdownPalette)
  }

  if (!present) return undefined

  return {
    ...(extendDefaults !== undefined ? { extendDefaults } : {}),
    items: [...byName.values()],
  }
}

export type PaletteRegistry = {
  get: (name: string) => ResolvedPalette | undefined
  names: () => string[]
  /** Problems with configured palettes (each invalid palette is skipped). */
  warnings: string[]
}

const registryCache = new WeakMap<object, PaletteRegistry>()

function buildRegistry(palettes: MarkdownPalettes | undefined): PaletteRegistry {
  const group = normalizeGroup(palettes)
  const resolved = new Map<string, ResolvedPalette>()
  const warnings: string[] = []

  if (group.extendDefaults)
    for (const palette of DEFAULT_PALETTES) {
      const { palette: valid } = validatePalette(palette)
      if (valid) resolved.set(valid.name, valid)
    }

  for (const item of group.items) {
    const { errors, palette } = validatePalette(item)
    const name = isRecord(item) && typeof item.name === 'string' ? item.name : '(unnamed)'

    if (palette) resolved.set(palette.name, palette)
    else warnings.push(`Palette "${name}" was ignored: ${errors.join(' ')}`)
  }

  return {
    get: (name) => resolved.get(name.trim()),
    names: () => [...resolved.keys()].sort(),
    warnings,
  }
}

/** The palettes a render can reference, by name. Cached per config object. */
export function getPaletteRegistry(palettes: MarkdownPalettes | undefined): PaletteRegistry {
  if (!palettes) return getDefaultPaletteRegistry()

  const cached = registryCache.get(palettes)
  if (cached) return cached

  const registry = buildRegistry(palettes)
  registryCache.set(palettes, registry)

  return registry
}

let defaultRegistry: PaletteRegistry | undefined

function getDefaultPaletteRegistry(): PaletteRegistry {
  defaultRegistry ??= buildRegistry(undefined)

  return defaultRegistry
}

/**
 * The CSS value of one palette colour: the light value, or a mix that follows
 * `--pmd-scheme-dark` (1 = dark, 0 = light) when the dark value differs, the
 * same scheme switch the directive defaults use.
 */
export function paletteColorValue(palette: ResolvedPalette, key: PaletteColorKey): string | undefined {
  const light = palette.light[key]
  const dark = palette.dark[key] ?? light

  if (!light) return dark
  if (!dark || dark === light) return light

  return `color-mix(in oklab, ${dark} calc(var(--pmd-scheme-dark, 1) * 100%), ${light})`
}

function style(declarations: Array<[string, string | undefined]>): string | undefined {
  const parts = declarations.filter(([, value]) => value !== undefined).map(([name, value]) => `${name}:${value}`)

  return parts.length > 0 ? parts.join(';') : undefined
}

/**
 * Inline custom properties a directive gets from its palette. They are the
 * public tokens the default directive themes read first, so a palette
 * recolours a card or callout while its structural theme stays in charge of
 * shape, spacing and shadow.
 */
export function directivePaletteStyle(palette: ResolvedPalette): string | undefined {
  const background = paletteColorValue(palette, 'background')
  const accent = paletteColorValue(palette, 'accent')

  return style([
    ['--pmd-surface', background],
    ['--pmd-surface-muted', background],
    ['--pmd-border', paletteColorValue(palette, 'border')],
    ['--pmd-accent', accent],
    ['--pmd-accent-hover', accent],
  ])
}

/** Button colours from a palette: fill from `background`, label from `color`. */
export function buttonPaletteStyle(palette: ResolvedPalette): string | undefined {
  const background = paletteColorValue(palette, 'background')
  const border = paletteColorValue(palette, 'border') ?? background
  // Hover tints the fill toward the label colour, so it reads in both schemes.
  const hover = background ? `color-mix(in oklab, ${background} 85%, currentColor)` : undefined

  return style([
    ['--pmd-button-bg', background],
    ['--pmd-button-border', border],
    ['--pmd-button-color', paletteColorValue(palette, 'color')],
    ['--pmd-button-hover-bg', hover],
    ['--pmd-button-hover-border', border],
  ])
}

export type IconPaint = {
  primary?: string
  secondary?: string
  secondaryOpacity?: number
}

/** How an icon is painted with a palette. */
export function iconPaint(palette: ResolvedPalette): IconPaint {
  return {
    primary: paletteColorValue(palette, 'color'),
    secondary: paletteColorValue(palette, 'secondaryColor'),
    ...(palette.secondaryOpacity !== undefined ? { secondaryOpacity: palette.secondaryOpacity } : {}),
  }
}

/** Plain, serializable view of a palette (for guides, editors and agents). */
export function describePalette(palette: ResolvedPalette): MarkdownPalette {
  return {
    name: palette.name,
    ...(palette.label ? { label: palette.label } : {}),
    ...palette.light,
    ...(Object.keys(palette.dark).length > 0 ? { dark: { ...palette.dark } } : {}),
    ...(palette.secondaryOpacity !== undefined ? { secondaryOpacity: palette.secondaryOpacity } : {}),
  }
}
