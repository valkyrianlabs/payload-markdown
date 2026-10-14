import type { Element } from 'hast'
import type { Config } from 'payload'

import { fromHtml } from 'hast-util-from-html'
import { describe, expect, it } from 'vitest'

import type { MarkdownRenderConfig } from '../src/types/core'

import { getAppearanceSlug } from '../src/appearance/runtime'
import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'
import { parseIconEntries } from '../src/icons/entries'
import { instantiateSanitizedSvg, parseAndSanitizeSvg } from '../src/icons/sanitizeSvg'
import { payloadMarkdown } from '../src/index'
import { normalizePaletteColor } from '../src/palettes/colors'
import { describePaletteContrast } from '../src/palettes/contrast'
import {
  DEFAULT_PALETTES,
  getPaletteRegistry,
  mergeMarkdownPalettes,
  paletteColorValue,
  validatePalette,
} from '../src/palettes/index'
import { renderMarkdown } from '../src/render/renderMarkdown'
import { resolveMarkdownRenderConfig } from '../src/runtime/index'

const icons = {
  baseDir: 'tests/fixtures/icons',
  packs: [
    { alias: 'brand', path: 'brand' },
    { alias: 'fa-duotone', path: 'fa-duotone' },
    { alias: 'design', path: 'design-export' },
  ],
}

const palettes = [
  { name: 'debian', color: '#a80030', dark: { color: '#ff5277' } },
  { name: 'ubuntu', color: '#e95420' },
  { name: 'aurora', color: '#0284c7', secondaryColor: '#7c3aed', secondaryOpacity: 0.7 },
]

/** Rendered elements matching `test`, parsed back so their real attributes can be checked. */
function elements(html: string, test: (element: Element) => boolean): Element[] {
  const found: Element[] = []
  const walk = (node: { children?: unknown[] } & Partial<Element>) => {
    if (node.type === 'element' && test(node as Element)) found.push(node as Element)
    for (const child of node.children ?? []) walk(child as Element)
  }

  walk(fromHtml(html, { fragment: true }) as unknown as Element)

  return found
}

const svgs = (html: string) => elements(html, (element) => element.tagName === 'svg')
const withPalette = (html: string) => elements(html, (element) => element.properties.dataPalette !== undefined)

const prop = (element: Element, name: string) => element.properties[name]

describe('palette colours', () => {
  it('accepts hex, numeric colour functions, names, currentColor and token references', () => {
    expect(normalizePaletteColor('#E95420')).toBe('#e95420')
    expect(normalizePaletteColor('rgb(233 84 32 / 0.5)')).toBe('rgb(233 84 32 / 0.5)')
    expect(normalizePaletteColor('oklch(0.7 0.15 40deg)')).toBe('oklch(0.7 0.15 40deg)')
    expect(normalizePaletteColor('hsl(20, 82%, 52%)')).toBe('hsl(20, 82%, 52%)')
    expect(normalizePaletteColor('Silver')).toBe('silver')
    expect(normalizePaletteColor('currentcolor')).toBe('currentColor')
    expect(normalizePaletteColor('var(--color-orange-500)')).toBe('var(--color-orange-500)')
  })

  it('rejects anything that could load, reference or escape', () => {
    for (const value of [
      'red;background:url(x)',
      'url(https://example.com/x.png)',
      'var(--x);}body{color:red',
      'var(--x, url(x))',
      'expression(alert(1))',
      'rgb(1, 2, 3) url(x)',
      'rgb(calc(1px), 2, 3)',
      '#12345',
      'javascript:alert(1)',
      'red !important',
      '',
      42,
    ])
      expect(normalizePaletteColor(value), String(value)).toBeUndefined()
  })
})

describe('palette validation', () => {
  it('normalizes a palette and keeps dark overrides separately', () => {
    const { errors, palette } = validatePalette({ name: 'debian', color: '#A80030', dark: { color: '#FF5277' }, label: ' Debian ' })

    expect(errors).toEqual([])
    expect(palette).toEqual({ name: 'debian', dark: { color: '#ff5277' }, label: 'Debian', light: { color: '#a80030' } })
  })

  it('reports invalid names, colours and opacity without passing them through', () => {
    const { errors, palette } = validatePalette({
      name: 'Debian Red',
      color: 'red;x',
      dark: { background: 'url(x)' },
      secondaryOpacity: 2,
    })

    expect(palette).toBeUndefined()
    expect(errors).toHaveLength(4)
    expect(errors.join(' ')).toMatch(/name "Debian Red" is invalid/)
    expect(errors.join(' ')).toMatch(/dark\.background "url\(x\)" is not a valid colour/)
  })

  it('mixes light and dark values on the colour scheme switch', () => {
    const { palette } = validatePalette({ name: 'x', color: '#111111', dark: { color: '#eeeeee' } })

    expect(paletteColorValue(palette!, 'color')).toBe(
      'color-mix(in oklab, #eeeeee calc(var(--pmd-scheme-dark, 1) * 100%), #111111)',
    )
    expect(paletteColorValue(validatePalette({ name: 'y', color: '#111111' }).palette!, 'color')).toBe('#111111')
  })

  it('flags icon colours with too little contrast in either scheme', () => {
    expect(describePaletteContrast(validatePalette({ name: 'x', color: '#ffff99' }).palette!)).toHaveLength(1)
    expect(describePaletteContrast(validatePalette({ name: 'y', color: '#a80030', dark: { color: '#ff5277' } }).palette!)).toEqual([])
  })
})

describe('palette layers', () => {
  it('lets later layers replace palettes by name over the built-ins', () => {
    const merged = mergeMarkdownPalettes([{ name: 'orange', color: '#000001' }], [{ name: 'orange', color: '#000002' }])
    const registry = getPaletteRegistry(merged)

    expect(registry.get('orange')?.light.color).toBe('#000002')
    expect(registry.get('red')?.light.color).toBe(DEFAULT_PALETTES.find((palette) => palette.name === 'red')?.color)
  })

  it('drops the built-ins with extendDefaults: false', () => {
    const registry = getPaletteRegistry({ extendDefaults: false, items: [{ name: 'only', color: '#123456' }] })

    expect(registry.names()).toEqual(['only'])
  })

  it('applies plugin < admin (runtime) < renderer precedence', () => {
    const settings = {
      collections: {},
      enabled: true,
      palettes: [{ name: 'brand', color: '#000001' }],
    }
    const viaRuntime = resolveMarkdownRenderConfig({
      runtimePalettes: [{ name: 'brand', color: '#000002' }],
      settings,
    }) as MarkdownRenderConfig
    const viaRenderer = resolveMarkdownRenderConfig({
      palettes: [{ name: 'brand', color: '#000003' }],
      runtimePalettes: [{ name: 'brand', color: '#000002' }],
      settings,
    }) as MarkdownRenderConfig

    expect(getPaletteRegistry(viaRuntime.palettes).get('brand')?.light.color).toBe('#000002')
    expect(getPaletteRegistry(viaRenderer.palettes).get('brand')?.light.color).toBe('#000003')
  })
})

describe('icon entries', () => {
  it('parses refs with per-entry options', () => {
    expect(parseIconEntries('@fa-brands/debian palette=debian, @fa-brands/ubuntu,@a/b palette="x"')).toEqual({
      entries: [
        { palette: 'debian', ref: '@fa-brands/debian' },
        { ref: '@fa-brands/ubuntu' },
        { palette: 'x', ref: '@a/b' },
      ],
      warnings: [],
    })
  })

  it('warns about unknown or malformed options and keeps the icon', () => {
    const { entries, warnings } = parseIconEntries('@a/b size=2 palette')

    expect(entries).toEqual([{ ref: '@a/b' }])
    expect(warnings).toHaveLength(2)
  })
})

describe('painting icons', () => {
  const brand = parseAndSanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>')!
  const duotone = parseAndSanitizeSvg(
    '<svg viewBox="0 0 16 16"><defs><style>.fa-secondary{opacity:.4}</style></defs><path class="fa-secondary" d="M1 1h14v6H1z"/><path class="fa-primary" d="M1 9h14v6H1z"/></svg>',
  )!
  const explicit = parseAndSanitizeSvg(
    '<svg viewBox="0 0 16 16" stroke="#222"><path d="M0 0h8v8H0z" fill="#ff0000"/><path d="M8 8h8v8H8z" style="fill:#00ff00;stroke-width:2"/><path d="M1 1h1v1H1z" fill="none"/><rect width="4" height="4" fill="url(#g)"/></svg>',
  )!

  it('leaves an unpainted icon exactly as before', () => {
    const icon = instantiateSanitizedSvg(brand, 'size-5')

    expect(icon.properties).toEqual({
      ariaHidden: 'true',
      className: ['size-5'],
      focusable: 'false',
      viewBox: '0 0 16 16',
      xmlns: 'http://www.w3.org/2000/svg',
    })
  })

  it('paints a brand icon that sets no fill with the palette colour', () => {
    const icon = instantiateSanitizedSvg(brand, 'size-5', { name: 'ubuntu', primary: '#e95420' })

    expect(icon.properties.fill).toBe('currentColor')
    expect(icon.properties.style).toBe('color:#e95420')
    expect(icon.properties.dataPmdPalette).toBe('ubuntu')
    expect(icon.properties.className).toEqual(['size-5', 'pmd-icon--palette'])
  })

  it('paints the duotone secondary layer separately, with its opacity', () => {
    const plain = instantiateSanitizedSvg(duotone, '', { name: 'sky', primary: '#0284c7' })
    const two = instantiateSanitizedSvg(duotone, '', {
      name: 'aurora',
      primary: '#0284c7',
      secondary: '#7c3aed',
      secondaryOpacity: 0.7,
    })
    const [, plainSecondary] = plain.children as Element[]
    const [, secondary, primary] = two.children as Element[]

    expect(plainSecondary.properties.opacity).toBe('.4')
    expect(plainSecondary.properties.style).toBe('fill:var(--pmd-icon-secondary, currentColor)')
    expect(two.properties.style).toBe('color:#0284c7;--pmd-icon-secondary:#7c3aed')
    expect(secondary.properties).toMatchObject({ opacity: '0.7', style: 'fill:var(--pmd-icon-secondary, currentColor)' })
    expect(primary.properties.style).toBeUndefined()
  })

  it('paints a stroke-drawn secondary layer with the secondary colour', () => {
    const outlined = parseAndSanitizeSvg(
      '<svg viewBox="0 0 16 16"><g class="pmd-icon-secondary" fill="none" stroke="#999"><path d="M1 1h14"/><path d="M1 3h14" stroke="#777"/></g><path d="M1 9h14v6H1z"/></svg>',
    )!
    const icon = instantiateSanitizedSvg(outlined, '', { name: 'aurora', primary: '#0284c7', secondary: '#7c3aed' })
    const [layer] = icon.children as Element[]
    const [, inner] = layer.children as Element[]

    expect(layer.properties).toMatchObject({ fill: 'none', style: 'stroke:var(--pmd-icon-secondary, currentColor)' })
    expect(layer.properties.stroke).toBeUndefined()
    expect(inner.properties).toMatchObject({ style: 'stroke:var(--pmd-icon-secondary, currentColor)' })
  })

  it('leaves masks, clip paths and gradients untouched', () => {
    const masked = parseAndSanitizeSvg(
      '<svg viewBox="0 0 16 16"><defs><mask id="m"><rect width="16" height="16" fill="white"/></mask><linearGradient id="g"><stop stop-color="#f00"/></linearGradient></defs><path d="M0 0h16v16H0z" fill="#123456" mask="url(#m)"/></svg>',
    )!
    const icon = instantiateSanitizedSvg(masked, '', { name: 'orange', primary: '#ea580c' })
    const [defs, path] = icon.children as Element[]
    const [mask, gradient] = defs.children as Element[]

    expect((mask.children[0] as Element).properties.fill).toBe('white')
    expect((gradient.children[0] as Element).properties.stopColor).toBe('#f00')
    expect(path.properties.fill).toBe('currentColor')
  })

  it('recolours explicit fills and strokes but keeps none and gradient references', () => {
    const icon = instantiateSanitizedSvg(explicit, '', { name: 'red', primary: '#dc2626' })
    const [solid, styled, none, gradient] = icon.children as Element[]

    expect(icon.properties).toMatchObject({ fill: 'currentColor', stroke: 'currentColor' })
    expect(solid.properties.fill).toBe('currentColor')
    expect(styled.properties.style).toBe('fill:currentColor;stroke-width:2')
    expect(none.properties.fill).toBe('none')
    expect(gradient.properties.fill).toBe('url(#g)')
  })
})

describe('rendering palettes', () => {
  const card = (iconList: string, attributes = '') =>
    renderMarkdown(`:::card[Linux]{icon="${iconList}"${attributes}}\nBody.\n:::`, { icons, palettes, settings: false })

  it('gives each icon of a list its own palette, independent of order', async () => {
    const first = await card('@brand/github palette=debian, @fa-duotone/home palette=ubuntu')
    const reordered = await card('@fa-duotone/home palette=ubuntu, @brand/github palette=debian')
    const [debian, ubuntu] = svgs(first.html)
    const [ubuntuAgain, debianAgain] = svgs(reordered.html)

    expect(first.warnings).toEqual([])
    expect(prop(debian, 'dataPmdPalette')).toBe('debian')
    expect(prop(ubuntu, 'dataPmdPalette')).toBe('ubuntu')
    expect(debianAgain.properties).toEqual(debian.properties)
    expect(ubuntuAgain.properties).toEqual(ubuntu.properties)
    expect(prop(debian, 'style')).toContain('#ff5277')
    expect(prop(ubuntu, 'style')).toBe('color:#e95420')
  })

  it('styles identical icons independently', async () => {
    const result = await card('@brand/github palette=debian, @brand/github palette=ubuntu, @brand/github')
    const painted = svgs(result.html).map((icon) => prop(icon, 'dataPmdPalette'))

    expect(painted).toEqual(['debian', 'ubuntu', undefined])
  })

  it('falls back from entry to iconPalette to palette', async () => {
    const result = await card('@brand/github, @brand/github palette=debian', ' palette="teal" iconPalette="ubuntu"')
    const withPaletteOnly = await card('@brand/github', ' palette="teal"')

    expect(svgs(result.html).map((icon) => prop(icon, 'dataPmdPalette'))).toEqual(['ubuntu', 'debian'])
    expect(svgs(withPaletteOnly.html).map((icon) => prop(icon, 'dataPmdPalette'))).toEqual(['teal'])
    expect(String(prop(withPalette(result.html)[0], 'style'))).toMatch(/^--pmd-surface:/)
  })

  it('reuses one palette across directive types', async () => {
    const result = await compileMarkdown(
      [
        ':::card[A]{palette="teal"}\nx\n:::',
        ':::callout[B]{palette="teal"}\nx\n:::',
        ':::details[C]{palette="teal"}\nx\n:::',
        '::button[D]{href="/d" palette="teal"}',
      ].join('\n\n'),
      { palettes },
    )

    expect(result.warnings).toEqual([])
    expect(withPalette(result.html).map((element) => [element.tagName, String(prop(element, 'style')).split(':')[0]])).toEqual([
      ['article', '--pmd-surface'],
      ['div', '--pmd-surface'],
      ['details', '--pmd-surface'],
      ['a', '--pmd-button-bg'],
    ])
  })

  it('reports missing palettes and renders the icon unpainted', async () => {
    const result = await card('@brand/github palette=renamed-away', ' palette="nope"')

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['unknown-palette', 'unknown-palette'])
    expect(result.warnings.join(' ')).toMatch(/Unknown palette "nope" on "card"/)
    expect(prop(svgs(result.html)[0], 'dataPmdPalette')).toBeUndefined()
    expect(withPalette(result.html).map((element) => prop(element, 'style'))).toEqual([undefined])
  })

  it('reports invalid configured palettes once and ignores them', async () => {
    const result = await renderMarkdown(':::card[A]{palette="bad"}\nx\n:::', {
      palettes: [{ name: 'bad', color: 'url(x)' }],
      settings: false,
    })

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['palette-config', 'unknown-palette'])
  })

  it('renders content without palettes exactly as before', async () => {
    const result = await compileMarkdown(
      ':::card[A]{icon="@brand/github, @fa-duotone/duotone-styled"}\nx\n:::\n\n::button[B]{href="/b" icon="@brand/github"}',
      { icons },
    )

    expect(result.warnings).toEqual([])
    expect(result.html).not.toMatch(/pmd-icon--palette|data-pmd-palette|data-palette|style="/)
  })

  it('reports extra icons on directives that show one', async () => {
    const result = await renderMarkdown(':::callout[A]{icon="@brand/github, @brand/swirl"}\nx\n:::', { icons, settings: false })

    expect(result.warnings).toEqual(['"callout" shows one icon; "@brand/swirl" is ignored. Only cards show a list of icons.'])
    expect(
      lintMarkdownDirectives('::button[B]{href="/b" icon="@a/b, @a/c, @a/d"}', {}).map((diagnostic) => diagnostic.message),
    ).toEqual(['"button" shows one icon; "@a/c", "@a/d" are ignored. Only cards show a list of icons.'])
  })

  it('paints button icons and keeps the icon-only class', async () => {
    const result = await compileMarkdown('::button{href="/x" icon="@brand/github palette=ubuntu" ariaLabel="GitHub"}', {
      icons,
      palettes,
    })

    expect(result.html).toMatch(/class="pmd-button pmd-button--primary pmd-button--md pmd-button--icon-only"/)
    expect(prop(svgs(result.html)[0], 'dataPmdPalette')).toBe('ubuntu')
  })
})

describe('editor lint', () => {
  it('reports unknown palettes and icon options like the renderer', () => {
    const diagnostics = lintMarkdownDirectives(
      ':::card[A]{icon="@brand/github palette=nope size=1" palette="teal"}\nx\n:::',
      { palettes: ['teal', 'debian'] },
    ).map((diagnostic) => diagnostic.message)

    expect(diagnostics).toEqual([
      'Unknown icon option "size=1" on "@brand/github". Write options as key=value; supported: palette.',
      'Unknown palette "nope" on "card". It renders without that palette. Known palettes: debian, teal.',
    ])
  })

  it('stays quiet about palettes when their names are not known yet', () => {
    expect(lintMarkdownDirectives(':::card[A]{palette="from-admin"}\nx\n:::', {})).toEqual([])
  })
})

describe('appearance option', () => {
  it('registers runtime palettes even when the app defines the global itself', () => {
    const existing = { slug: 'markdown-appearance', fields: [{ name: 'palettes', type: 'array' as const, fields: [] }] }
    const config = payloadMarkdown({ appearance: true })({ collections: [], globals: [existing] } as unknown as Config) as Config

    expect(config.globals).toEqual([existing])
    expect(getAppearanceSlug()).toBe('markdown-appearance')
  })
})
