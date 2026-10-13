import type { ReactElement } from 'react'

import { describe, expect, it } from 'vitest'

import { MarkdownRenderer } from '../src/components/MarkdownRenderer/Component'
import { compileMarkdown } from '../src/core/renderMarkdown'
import { PMD_COLOR_SCHEME_CLASS_NAMES } from '../src/styles/directiveSurface'

type Element = ReactElement<{ children?: unknown; className?: string }>

// MarkdownRenderer returns <div>{client}{lead}<Tag className=... /></div>.
async function rootClassName(props: Parameters<typeof MarkdownRenderer>[0]): Promise<string> {
  const element = (await MarkdownRenderer({ markdown: '# Hi', settings: false, ...props })) as Element
  const children = element.props.children as Array<Element | null>

  return children[2]?.props.className ?? ''
}

const tokens = (className: string): string[] => className.split(/\s+/).filter(Boolean)

/** Markdown that exercises every directive, theme, and variant the defaults style. */
const EVERY_DIRECTIVE = `
:::toc
:::

## Heading

:::section
### Section
:::

:::2col {theme="panel" cellTheme="panel"}
### One
A
### Two
B
:::endcol

:::cards {columns="4" href="/x" linkScope="section"}
:::card[Default]{eyebrow="E" icon="@x/y"}
Body with [a link](/x) and \`code\`.
:::
:::card[Muted]{theme="muted"}
x
:::
:::card[Glass]{theme="glass"}
x
:::
:::card[Cyan]{theme="cyan"}
x
:::
:::card[Violet]{theme="violet"}
x
:::
:::card[Emerald]{theme="emerald"}
x
:::
:::card[Amber]{theme="amber"}
x
:::
:::card[Danger]{theme="danger"}
x
:::
:::

:::card[Linked]{href="/x"}
x
:::

:::card[Title link]{href="/x" linkScope="title"}
x
:::

:::callout[Note]{variant="note"}
x
:::
:::callout[Info]{variant="info" theme="solid"}
x
:::
:::callout[Tip]{variant="tip" theme="glass"}
x
:::
:::callout[Warning]{variant="warning"}
x
:::
:::callout[Danger]{variant="danger"}
x
:::
:::callout[Success]{variant="success"}
x
:::

:::details[More]{theme="muted"}
x
:::

:::tabs {theme="underline"}
:::tab[One]
x
:::
:::tab[Two]{disabled}
y
:::
:::

:::tabs {theme="pills" tabTheme="glass"}
:::tab[A]
x
:::
:::

:::steps {variant="cards" layout="grid" columns="3" stepTheme="cyan" theme="glass"}
### First
x
### Second
y
:::

:::steps {theme="cyan"}
### One
x
:::
`

// Fixed light-only or dark-only colours (the prefix skips any variants): these would put dark panels on a
// light page (or the reverse). Directive defaults must go through the
// --pmd-scheme-dark tokens instead.
const SINGLE_SCHEME_COLOR = [
  /^(?:.*:)?(?:bg|border|text|ring|inset-ring|shadow|divide|outline)-(?:white|black)(?:\/|$)/,
  /^(?:.*:)?(?:bg|border|text|ring|inset-ring)-\[#/,
  /^(?:.*:)?(?:bg|border|text|ring|inset-ring)-[a-z]+-(?:50|100|200|300|400|600|700|800|900|950)(?:\/|$)/,
  /^dark:/,
  /(?:^|:)(?:text|bg|border)-(?:foreground|muted-foreground|border|card|background)(?:\/|$)/,
]

describe('colour scheme', () => {
  it('follows the host dark variant by default', async () => {
    const className = await rootClassName({})

    expect(tokens(className)).toEqual(expect.arrayContaining(tokens(PMD_COLOR_SCHEME_CLASS_NAMES.auto)))
    expect(tokens(className)).toContain('dark:prose-invert')
    expect(tokens(className)).not.toContain('prose-invert')
  })

  it('pins the palette for colorScheme light and dark', async () => {
    const dark = tokens(await rootClassName({ colorScheme: 'dark' }))
    const light = tokens(await rootClassName({ colorScheme: 'light' }))

    expect(dark).toEqual(expect.arrayContaining(['[--pmd-scheme-dark:1]', 'prose-invert']))
    expect(dark).not.toContain('dark:prose-invert')
    expect(dark).not.toContain('[--pmd-scheme-dark:0]')
    expect(light).toContain('[--pmd-scheme-dark:0]')
    expect(light.some((token) => token.includes('prose-invert'))).toBe(false)
    expect(light.some((token) => token.startsWith('dark:'))).toBe(false)
  })

  it('falls back to auto for an unknown colorScheme', async () => {
    const className = await rootClassName({ colorScheme: 'sepia' as never })

    expect(tokens(className)).toContain('dark:[--pmd-scheme-dark:1]')
  })

  it('lets per-render overrides pick the scheme over renderer props', async () => {
    const className = await rootClassName({ colorScheme: 'dark', overrides: { colorScheme: 'light' } })

    expect(tokens(className)).toContain('[--pmd-scheme-dark:0]')
    expect(tokens(className)).not.toContain('prose-invert')
  })

  it('keeps the scheme for unstyled output without adding typography', async () => {
    const className = await rootClassName({ className: 'my-prose', colorScheme: 'dark', variant: 'unstyled' })

    expect(tokens(className)).toEqual([...tokens(PMD_COLOR_SCHEME_CLASS_NAMES.dark), 'my-prose'])
  })

  it('applies consumer typography classes after the defaults', async () => {
    const className = await rootClassName({ className: 'prose-a:text-pink-600 [--pmd-accent:#db2777]' })

    expect(tokens(className).slice(-2)).toEqual(['prose-a:text-pink-600', '[--pmd-accent:#db2777]'])
  })
})

// Equal-specificity utilities resolve by stylesheet order, not class order, so
// a conflicting default has to be removed for an override to win reliably.
describe('class precedence', () => {
  it('drops a default that a consumer class overrides', async () => {
    const className = tokens(await rootClassName({ className: 'prose-a:font-bold prose-a:text-pink-600' }))

    expect(className).toEqual(expect.arrayContaining(['prose-a:font-bold', 'prose-a:text-pink-600']))
    expect(className).not.toContain('prose-a:font-medium')
    expect(className.some((token) => token.startsWith('prose-a:text-[color:'))).toBe(false)
  })

  it('lets a variant override the base defaults', async () => {
    const compact = tokens(await rootClassName({ variant: 'compact' }))

    expect(compact).toEqual(expect.arrayContaining(['prose-p:leading-6', 'prose-pre:my-5']))
    expect(compact).not.toContain('prose-p:leading-7')
    expect(compact).not.toContain('prose-pre:my-6')
  })

  it('keeps line height alongside a font size for the same element', async () => {
    const blog = tokens(await rootClassName({ variant: 'blog' }))

    expect(blog).toEqual(expect.arrayContaining(['prose-p:leading-7', 'prose-p:text-[1.02rem]']))
  })

  it('merges consumer wrapper classes over the wrapper defaults', async () => {
    const element = (await MarkdownRenderer({
      markdown: '# Hi',
      settings: false,
      wrapperClassName: 'mx-auto w-3/4',
    })) as Element

    expect(tokens(element.props.className ?? '')).toEqual(['mx-auto', 'w-3/4'])
  })
})

describe('directive defaults in both colour schemes', () => {
  it('never hard-code a light-only or dark-only colour', async () => {
    const result = await compileMarkdown(EVERY_DIRECTIVE)
    const classTokens = [...result.html.matchAll(/class="([^"]*)"/g)].flatMap((match) =>
      tokens(match[1].replaceAll('&#x26;', '&')),
    )
    const offenders = [
      ...new Set(classTokens.filter((token) => SINGLE_SCHEME_COLOR.some((pattern) => pattern.test(token)))),
    ]

    expect(classTokens.length).toBeGreaterThan(100)
    expect(offenders).toEqual([])
    expect(result.html).toContain('--pmd-scheme-dark')
  })

  it('reads public tokens before the host design system and the plugin palette', async () => {
    const result = await compileMarkdown(':::card[A]\nx\n:::\n\n:::callout\nx\n:::')

    expect(result.html).toContain('var(--pmd-surface,var(--color-card,')
    expect(result.html).toContain('var(--pmd-border,var(--color-border,')
  })

  it('replaces the default surface with a custom theme', async () => {
    const themes = {
      card: [{ name: 'brand', classes: 'brand-card rounded-none bg-pink-50 dark:bg-pink-950' }],
    }
    const result = await compileMarkdown(':::card[Brand]{theme="brand"}\nx\n:::', { themes })
    const card = /<article[^>]*class="([^"]*)"/.exec(result.html)?.[1] ?? ''

    expect(result.warnings).toEqual([])
    expect(tokens(card)).toEqual(expect.arrayContaining(['brand-card', 'bg-pink-50', 'dark:bg-pink-950']))
    expect(card).not.toContain('--pmd-surface')
  })
})
