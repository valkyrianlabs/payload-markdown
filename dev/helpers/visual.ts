import type { Locator } from '@playwright/test'

export type ElementColors = {
  /** Effective background behind the element: every ancestor layer composited. */
  background: [number, number, number]
  /** WCAG 2.x contrast ratio between the text and that background. */
  contrast: number
  /** Relative luminance of the background (0 black to 1 white). */
  luminance: number
  text: [number, number, number]
}

/**
 * Measures an element's text against what is actually painted behind it. Each
 * ancestor's background colour and gradient tint (callouts use a flat
 * gradient) is painted onto a 1×1 canvas from the root down, so translucent
 * surfaces and theme tints are composited the way the browser does; the text
 * colour, which may itself be translucent, is painted last.
 */
export async function measureColors(locator: Locator): Promise<ElementColors> {
  return locator.evaluate((element) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('No 2D canvas context')

    const paint = (color: string) => {
      context.fillStyle = color
      context.fillRect(0, 0, 1, 1)
    }
    const read = (): [number, number, number] => {
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data

      return [r, g, b]
    }

    const chain: Element[] = []
    for (let node: Element | null = element; node; node = node.parentElement) chain.unshift(node)

    paint('#ffffff')
    for (const node of chain) {
      const style = getComputedStyle(node)

      paint(style.backgroundColor)

      const tint = /(?:rgba?|oklab|oklch|lab|lch|color)\([^()]*\)/.exec(style.backgroundImage)
      if (tint) paint(tint[0])
    }

    const background = read()

    paint(getComputedStyle(element).color)
    const text = read()

    const luminance = ([r, g, b]: [number, number, number]) => {
      const channel = (value: number) => {
        const srgb = value / 255

        return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
      }

      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }
    const backgroundLuminance = luminance(background)
    const textLuminance = luminance(text)
    const [lighter, darker] =
      backgroundLuminance > textLuminance
        ? [backgroundLuminance, textLuminance]
        : [textLuminance, backgroundLuminance]

    return {
      background,
      contrast: (lighter + 0.05) / (darker + 0.05),
      luminance: backgroundLuminance,
      text,
    }
  })
}

/** Number of tracks in an element's resolved `grid-template-columns`. */
export async function gridColumnCount(locator: Locator): Promise<number> {
  return locator.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
  )
}
