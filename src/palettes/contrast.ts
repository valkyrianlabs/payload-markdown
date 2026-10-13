import type { ResolvedPalette } from './index.js'

type Rgb = [number, number, number]

/** Parses the colours contrast can be judged for (hex and numeric rgb()); others return `undefined`. */
function parseRgb(value: string | undefined): Rgb | undefined {
  if (!value) return undefined

  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(value)?.[1]

  if (hex) {
    const full = hex.length <= 4 ? [...hex.slice(0, 3)].map((char) => char + char).join('') : hex.slice(0, 6)

    return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16)) as Rgb
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value)

  return rgb ? ([rgb[1], rgb[2], rgb[3]].map(Number) as Rgb) : undefined
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const srgb = value / 255

    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: string | undefined, b: string | undefined): number | undefined {
  const first = parseRgb(a)
  const second = parseRgb(b)
  if (!first || !second) return undefined

  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x)

  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
}

/** Typical page backgrounds of each scheme, for icons drawn on the page itself. */
const PAGE = { dark: '#0a0a0a', light: '#ffffff' } as const

/**
 * Advisory contrast notes for a palette (WCAG 1.4.11: 3:1 for icons and other
 * non-text graphics). Only colours given as hex or rgb() can be judged.
 */
export function describePaletteContrast(palette: ResolvedPalette): string[] {
  const notes: string[] = []

  for (const scheme of ['light', 'dark'] as const) {
    const colors = scheme === 'dark' ? { ...palette.light, ...palette.dark } : palette.light
    const surface = colors.background
    const against = surface ?? PAGE[scheme]
    const ratio = contrastRatio(colors.color, against)

    if (ratio !== undefined && ratio < 3)
      notes.push(
        `In the ${scheme} scheme, color ${colors.color} has ${ratio}:1 contrast against ${surface ? `its background ${surface}` : `a typical ${scheme} page (${against})`}; icons need 3:1. ${scheme === 'dark' ? 'Set dark.color.' : 'Use a deeper colour.'}`,
      )
  }

  return notes
}
