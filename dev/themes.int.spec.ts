import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { getDirectiveThemeNames, mergeMarkdownDirectiveThemes } from '../src/directives/themes'

describe('CORE-17: directive theme merging and fallbacks', () => {
  it('falls back to the first configured theme when built-ins are disabled', async () => {
    const themes = {
      callout: { extendDefaults: false, items: [{ name: 'brand', classes: 'brand-callout' }] },
      card: { extendDefaults: false, items: [{ name: 'promo', classes: 'promo-card' }] },
    }
    const callout = await compileMarkdown(':::callout\nx\n:::', { themes })
    const card = await compileMarkdown(':::card[A]\nx\n:::', { themes })

    expect(callout.warnings).toEqual([])
    expect(callout.html).toContain('data-theme="brand"')
    expect(callout.html).toContain('brand-callout')
    expect(callout.html).not.toContain('vl-md-callout--theme-soft')
    expect(card.warnings).toEqual([])
    expect(card.html).toContain('data-theme="promo"')
    expect(card.html).toContain('promo-card')
  })

  it('keeps the built-in fallback when defaults are extended', async () => {
    const callout = await compileMarkdown(':::callout\nx\n:::', {
      themes: { callout: [{ name: 'brand', classes: 'brand-callout' }] },
    })

    expect(callout.html).toContain('data-theme="soft"')
  })

  it('only changes extendDefaults when a layer sets it explicitly', () => {
    const merged = mergeMarkdownDirectiveThemes(
      { callout: { extendDefaults: false, items: [{ name: 'brand', classes: 'b' }] } },
      { callout: [{ name: 'promo', classes: 'p' }] },
      { callout: { items: [{ name: 'extra', classes: 'e' }] } },
    )

    expect(getDirectiveThemeNames('callout', merged)).toEqual(['brand', 'promo', 'extra'])

    const reenabled = mergeMarkdownDirectiveThemes(merged, {
      callout: { extendDefaults: true, items: [] },
    })

    expect(getDirectiveThemeNames('callout', reenabled)).toEqual([
      'soft',
      'solid',
      'glass',
      'brand',
      'promo',
      'extra',
    ])
  })

  it('names the real fallback theme in unknown-theme warnings', async () => {
    const callout = await compileMarkdown(':::callout{theme="default"}\nx\n:::')
    const card = await compileMarkdown(':::card[A]{theme="missing"}\nx\n:::')
    const custom = await compileMarkdown(':::callout{theme="missing"}\nx\n:::', {
      themes: { callout: { extendDefaults: false, items: [{ name: 'brand', classes: 'b' }] } },
    })

    expect(callout.warnings).toEqual(['Unknown theme "default" on "callout". Falling back to "soft".'])
    expect(card.warnings).toEqual(['Unknown theme "missing" on "card". Falling back to "default".'])
    expect(custom.warnings).toEqual(['Unknown theme "missing" on "callout". Falling back to "brand".'])
  })
})
