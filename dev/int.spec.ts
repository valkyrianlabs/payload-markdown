import type { Config } from 'payload'

import { beforeEach, describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import {
  layoutDirectiveRegistry,
  parseDirectiveAttributes,
  parseDirectiveLine,
} from '../src/directives'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'
import { getDirectiveCompletionOptions } from '../src/editor/directives/completions'
import { payloadMarkdown } from '../src/index.ts'
import {
  clearPayloadMarkdownSettings,
  getPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
  resolveMarkdownFieldDefaults,
} from '../src/runtime'

const countLayout = (html: string, layout: string): number =>
  (html.match(new RegExp(`data-vl-layout="${layout}"`, 'g')) ?? []).length

const countDirective = (html: string, directive: string): number =>
  (html.match(new RegExp(`data-directive="${directive}"`, 'g')) ?? []).length

const hasWarning = (warnings: string[], value: string): boolean =>
  warnings.some((warning) => warning.includes(value))

describe('payloadMarkdown', () => {
  beforeEach(() => {
    clearPayloadMarkdownSettings()
  })

  it('registers plugin settings and applies inferred install behavior for field and block collections', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      collections: [
        {
          slug: 'posts',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
          ],
        },
        {
          slug: 'pages',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'hero',
                  fields: [],
                },
              ],
            },
          ],
        },
      ],
    } as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: true,
        posts: true,
      },
      config: {
        blocks: {
          size: 'md',
          variant: 'docs',
        },
        field: {
          size: 'lg',
          variant: 'blog',
        },
      },
    })

    const result = await plugin(config)

    const posts = result.collections?.find((collection) => collection.slug === 'posts')
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(posts).toBeDefined()
    expect(pages).toBeDefined()

    // posts has no blocks field, so it should get a standalone markdown field by default
    expect(posts?.fields.some((field) => 'name' in field && field.name === 'content')).toBe(true)

    // pages has a blocks field, so it should get the markdown block installed into that blocks field
    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(layoutField).toBeDefined()
    expect(layoutField && 'blocks' in layoutField && Array.isArray(layoutField.blocks)).toBe(true)
    expect(
      layoutField &&
        'blocks' in layoutField &&
        layoutField.blocks?.some((block) => block.slug === 'vlMdBlock'),
    ).toBe(true)

    // pages should not get a standalone markdown field by default because it already has a blocks field
    expect(pages?.fields.some((field) => 'name' in field && field.name === 'content')).toBe(false)

    // registry should be seeded
    const settings = getPayloadMarkdownSettings()

    expect(settings.enabled).toBe(true)
    expect(settings.collections.posts).toBe(true)
    expect(settings.collections.pages).toBe(true)

    // runtime config resolution should respect split field/block config
    expect(resolveMarkdownFieldDefaults('posts')).toMatchObject({
      size: 'lg',
      variant: 'blog',
    })

    expect(resolveMarkdownBlockDefaults('pages')).toMatchObject({
      size: 'md',
      variant: 'docs',
    })
  })

  it('respects explicit install overrides', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      collections: [
        {
          slug: 'pages',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [],
            },
          ],
        },
      ],
    } as unknown as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: {
          fieldName: 'body',
          installField: true,
          installIntoBlocks: false,
        },
      },
    })

    const result = await plugin(config)
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(pages?.fields.some((field) => 'name' in field && field.name === 'body')).toBe(true)

    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(
      layoutField &&
        'blocks' in layoutField &&
        Array.isArray(layoutField.blocks) &&
        layoutField.blocks.some((block) => block.slug === 'vlMdBlock'),
    ).toBe(false)
  })

  it('does not duplicate injected markdown field or markdown block', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      blocks: [
        {
          slug: 'vlMdBlock',
          fields: [],
        },
      ],
      collections: [
        {
          slug: 'pages',
          fields: [
            {
              name: 'content',
              type: 'textarea',
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'vlMdBlock',
                  fields: [],
                },
              ],
            },
          ],
        },
      ],
    } as unknown as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: {
          installField: true,
          installIntoBlocks: true,
        },
      },
    })

    const result = await plugin(config)
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(result.blocks?.filter((block) => block.slug === 'vlMdBlock').length).toBe(1)

    expect(
      pages?.fields.filter((field) => 'name' in field && field.name === 'content').length,
    ).toBe(1)

    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(
      layoutField &&
        'blocks' in layoutField &&
        Array.isArray(layoutField.blocks) &&
        layoutField.blocks.filter((block) => block.slug === 'vlMdBlock').length,
    ).toBe(1)
  })
})

describe('layout directive registry', () => {
  it('centralizes existing directive definitions and close markers', () => {
    expect(layoutDirectiveRegistry.all.map((definition) => definition.name)).toEqual([
      'section',
      '2col',
      '3col',
      'cell',
      'callout',
      'details',
      'toc',
      'steps',
    ])

    expect(layoutDirectiveRegistry.parseMarkdownLine(':::section')).toMatchObject({
      name: 'section',
      action: 'open',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::2col')).toMatchObject({
      name: '2col',
      action: 'open',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::3col')).toMatchObject({
      name: '3col',
      action: 'open',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::cell')).toMatchObject({
      name: 'cell',
      action: 'open',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::callout {variant="warning"}')).toMatchObject({
      name: 'callout',
      action: 'open',
      attributes: {
        variant: 'warning',
      },
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::details {title="Read more"}')).toMatchObject({
      name: 'details',
      action: 'open',
      attributes: {
        title: 'Read more',
      },
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::toc {title="Contents" depth="2"}')).toMatchObject({
      name: 'toc',
      action: 'open',
      attributes: {
        depth: '2',
        title: 'Contents',
      },
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::steps')).toMatchObject({
      name: 'steps',
      action: 'open',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::endcol')).toMatchObject({
      action: 'closeGrid',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::endsection')).toMatchObject({
      action: 'closeSection',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::end')).toMatchObject({
      action: 'closeSection',
    })
    expect(layoutDirectiveRegistry.parseMarkdownLine(':::')).toMatchObject({
      action: 'close',
    })
  })

  it('parses directive attributes without enabling attributed layout markers yet', () => {
    expect(parseDirectiveLine(':::section {#hero .wide .dark tone="info" open}')).toMatchObject({
      name: 'section',
      attributes: {
        id: 'hero',
        class: 'wide dark',
        open: true,
        tone: 'info',
      },
      rawAttributes: '{#hero .wide .dark tone="info" open}',
      warnings: [],
    })

    expect(parseDirectiveAttributes('{class="from-key" .from-dot title=\'A title\'}')).toEqual({
      class: 'from-key from-dot',
      title: 'A title',
    })

    expect(layoutDirectiveRegistry.parseMarkdownLine(':::section {#hero}')).toBeNull()
  })

  it('exposes public directive snippets from registry metadata', () => {
    const publicNames = layoutDirectiveRegistry
      .getPublicDefinitions()
      .map((definition) => definition.name)

    expect(publicNames).toEqual([
      'section',
      '2col',
      '3col',
      'cell',
      'callout',
      'details',
      'toc',
      'steps',
    ])

    const completions = getDirectiveCompletionOptions()

    expect(completions.map((completion) => completion.label)).toEqual([
      ':::section',
      ':::2col',
      ':::3col',
      ':::cell',
      ':::callout',
      ':::details',
      ':::toc',
      ':::steps',
    ])

    const snippets = layoutDirectiveRegistry
      .getPublicDefinitions()
      .map((definition) => definition.editor.snippet)

    expect(snippets.some((snippet) => snippet.includes('${Content}'))).toBe(true)
    expect(snippets.some((snippet) => snippet.includes('${Step title}'))).toBe(true)
    expect(snippets.every((snippet) => snippet.includes('${}'))).toBe(true)
  })
})

describe('compileMarkdown layout directives', () => {
  it('renders stable heading anchors with deterministic duplicate slugs', async () => {
    const result = await compileMarkdown(`
## Install

## Install

### Configure Payload!
`)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('id="install"')
    expect(result.html).toContain('data-heading-anchor="install"')
    expect(result.html).toContain('id="install-1"')
    expect(result.html).toContain('data-heading-anchor="install-1"')
    expect(result.html).toContain('id="configure-payload"')
    expect(result.html).toContain('data-heading-anchor="configure-payload"')
  })

  it('renders toc links from generated heading anchors', async () => {
    const result = await compileMarkdown(`
:::toc
:::

# Guide

## Install

### Configure

#### Hidden deeper heading
`)

    expect(result.warnings).toEqual([])
    expect(countDirective(result.html, 'toc')).toBe(1)
    expect(result.html).toContain('aria-label="On this page"')
    expect(result.html).toContain('href="#guide"')
    expect(result.html).toContain('href="#install"')
    expect(result.html).toContain('href="#configure"')
    expect(result.html).not.toContain('href="#hidden-deeper-heading"')
  })

  it('renders toc with custom title and depth', async () => {
    const result = await compileMarkdown(`
:::toc {title="Guide contents" depth="2"}
:::

# Overview

## Install

### Excluded
`)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('aria-label="Guide contents"')
    expect(result.html).toContain('data-title="Guide contents"')
    expect(result.html).toContain('href="#overview"')
    expect(result.html).toContain('href="#install"')
    expect(result.html).not.toContain('href="#excluded"')
  })

  it('falls back malformed toc depth and reports diagnostics', async () => {
    const result = await compileMarkdown(`
:::toc {depth="bad"}
:::

### Included by fallback depth

#### Excluded by fallback depth
`)

    expect(hasWarning(result.warnings, 'Invalid toc depth "bad"')).toBe(true)
    expect(result.html).toContain('href="#included-by-fallback-depth"')
    expect(result.html).not.toContain('href="#excluded-by-fallback-depth"')
  })

  it('renders steps as an ordered flow with nested markdown', async () => {
    const result = await compileMarkdown(`
:::steps

### Install the package

\`\`\`bash
pnpm add @valkyrianlabs/payload-markdown
\`\`\`

### Register the plugin

Add it to \`payload.config.ts\` with **markdown** enabled.

:::
`)

    expect(result.warnings).toEqual([])
    expect(countDirective(result.html, 'steps')).toBe(1)
    expect(result.html).toContain('<ol')
    expect(result.html).toContain('data-step="1"')
    expect(result.html).toContain('data-step="2"')
    expect(result.html).toContain('id="install-the-package"')
    expect(result.html).toContain('pnpm add @valkyrianlabs/payload-markdown')
    expect(result.html).toContain('<strong>markdown</strong>')
  })

  it('renders callout with default variant and nested markdown', async () => {
    const result = await compileMarkdown(`
:::callout
Default note with **strong text** and [a link](https://example.com).
:::

After callout.
`)

    expect(result.warnings).toEqual([])
    expect(countDirective(result.html, 'callout')).toBe(1)
    expect(result.html).toContain('data-variant="note"')
    expect(result.html).toContain('<strong>strong text</strong>')
    expect(result.html).toContain('href="https://example.com"')
    expect(result.html).toContain('<p>After callout.</p>')
    expect(result.html.indexOf('<p>After callout.</p>')).toBeGreaterThan(
      result.html.indexOf('data-directive="callout"'),
    )
  })

  it('renders callout variants and titles with stable semantic markers', async () => {
    const result = await compileMarkdown(`
:::callout {variant="info" title="Info Title"}
Info body.
:::

:::callout {variant="tip" title="Tip Title"}
Tip body.
:::

:::callout {variant="warning" title="Warning Title"}
Warning body.
:::

:::callout {variant="danger" title="Danger Title"}
Danger body.
:::

:::callout {variant="success" title="Success Title"}
Success body.
:::
`)

    expect(result.warnings).toEqual([])
    expect(countDirective(result.html, 'callout')).toBe(5)

    for (const variant of ['info', 'tip', 'warning', 'danger', 'success'])
      expect(result.html).toContain(`data-variant="${variant}"`)

    expect(result.html).toContain('Info Title')
    expect(result.html).toContain('data-directive-title="callout"')
  })

  it('falls back invalid callout variants and reports diagnostics', async () => {
    const result = await compileMarkdown(`
:::callout {variant="weird" title="Fallback"}
Body.
:::
`)

    expect(countDirective(result.html, 'callout')).toBe(1)
    expect(result.html).toContain('data-variant="note"')
    expect(hasWarning(result.warnings, 'Unsupported callout variant "weird"')).toBe(true)
  })

  it('renders details with default and explicit titles plus nested markdown', async () => {
    const result = await compileMarkdown(`
:::details
Default title body with **markdown**.
:::

:::details {title="Advanced install notes"}
1. Install dependencies.
2. Run tests.

:::

After details.
`)

    expect(result.warnings).toEqual([])
    expect(countDirective(result.html, 'details')).toBe(2)
    expect(result.html).toContain('>Details</summary>')
    expect(result.html).toContain('>Advanced install notes</summary>')
    expect(result.html).toContain('<strong>markdown</strong>')
    expect(result.html).toContain('<ol>')
    expect(result.html).toContain('<p>After details.</p>')
  })

  it('reports malformed static directive attributes without crashing rendering', async () => {
    const result = await compileMarkdown(`
:::details {title="Broken"
Body still renders.
:::
`)

    expect(countDirective(result.html, 'details')).toBe(1)
    expect(result.html).toContain('Body still renders.')
    expect(hasWarning(result.warnings, 'Malformed directive attributes')).toBe(true)
  })

  it('renders section directives without swallowing unrelated markdown', async () => {
    const result = await compileMarkdown(`
Before section.

:::section
## Inside section

Section body.
:::endsection

After section.
`)

    expect(result.warnings).toEqual([])
    expect(countLayout(result.html, 'section')).toBe(1)
    expect(result.html).toContain('<p>Before section.</p>')
    expect(result.html).toContain('Inside section</h2>')
    expect(result.html).toContain('<p>After section.</p>')
    expect(result.html.indexOf('<p>After section.</p>')).toBeGreaterThan(
      result.html.indexOf('</section>'),
    )
  })

  it('groups 2-column and 3-column directives into stable cells', async () => {
    const result = await compileMarkdown(`
## Two Column Group

:::2col
### First
Alpha

### Second
Beta
:::endcol

## Three Column Group

:::3col
### One
First

### Two
Second

### Three
Third
:::endcol
`)

    expect(result.warnings).toEqual([])
    expect(countLayout(result.html, '2col')).toBe(1)
    expect(countLayout(result.html, '3col')).toBe(1)
    expect(countLayout(result.html, 'cell')).toBe(5)
    expect(result.html).toContain('md:grid-cols-2')
    expect(result.html).toContain('md:grid-cols-3')
    expect(result.html).toContain('data-vl-cell-heading-depth="3"')
  })

  it('preserves explicit cell directives inside grids', async () => {
    const result = await compileMarkdown(`
## Explicit Cells

:::2col
:::cell
### First explicit cell
Alpha
:::

:::cell
### Second explicit cell
Beta
:::
:::endcol
`)

    expect(result.warnings).toEqual([])
    expect(countLayout(result.html, '2col')).toBe(1)
    expect(countLayout(result.html, 'cell')).toBe(2)
    expect(result.html).not.toContain('<p>:::cell</p>')
    expect(result.html).toContain('First explicit cell</h3>')
    expect(result.html).toContain('Second explicit cell</h3>')
  })

  it('supports nested section and grid rendering', async () => {
    const result = await compileMarkdown(`
:::section
## Nested layout

:::2col
### Left
Left body.

### Right
Right body.
:::endcol

Section tail.
:::endsection
`)

    expect(result.warnings).toEqual([])
    expect(countLayout(result.html, 'section')).toBe(1)
    expect(countLayout(result.html, '2col')).toBe(1)
    expect(countLayout(result.html, 'cell')).toBe(2)
    expect(result.html.indexOf('data-vl-layout="2col"')).toBeGreaterThan(
      result.html.indexOf('data-vl-layout="section"'),
    )
    expect(result.html).toContain('<p>Section tail.</p>')
  })

  it('leaves unknown directives and normal markdown as markdown content', async () => {
    const result = await compileMarkdown(`
:::unknown

Regular **markdown** still works.

- one
- two
`)

    expect(hasWarning(result.warnings, 'Unknown directive "unknown"')).toBe(true)
    expect(result.html).toContain('<p>:::unknown</p>')
    expect(result.html).toContain('<strong>markdown</strong>')
    expect(result.html).toContain('<li>one</li>')
    expect(countLayout(result.html, 'section')).toBe(0)
  })

  it('auto-closes unterminated layout directives without crashing', async () => {
    const result = await compileMarkdown(`
## Unterminated Group

:::2col
### First
Alpha

### Second
Beta
`)

    expect(result.html).toContain('data-vl-layout="2col"')
    expect(countLayout(result.html, 'cell')).toBe(2)
    expect(result.html).toContain('<p>Beta</p>')
    expect(hasWarning(result.warnings, 'Auto-closing unclosed layout block: 2col')).toBe(true)
  })

  it('does not lift directive-looking text inside fenced code blocks', async () => {
    const result = await compileMarkdown(`
\`\`\`ts
const marker = ':::section'
console.log(marker)
\`\`\`
`)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain(':::section')
    expect(result.html).toContain('md-code-enhanced')
    expect(countLayout(result.html, 'section')).toBe(0)
  })

  it('preserves section and column class overrides', async () => {
    const result = await compileMarkdown(
      `
:::section
## Styled

:::2col
### First
Alpha

### Second
Beta
:::endcol
:::endsection
`,
      {
        columnClassName: 'custom-column-class gap-10',
        sectionClassName: 'custom-section-class',
      },
    )

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('custom-section-class')
    expect(result.html).toContain('custom-column-class')
    expect(result.html).toContain('gap-10')
  })

  it('provides basic registry-powered directive diagnostics', () => {
    const diagnostics = lintMarkdownDirectives(`
:::callout {variant="weird" unexpected="true"}
Body.

:::details {title="Broken"
Body.
:::

:::toc {depth="bad"}
:::

:::steps {mode="bad"}
### Step
Body.
:::

:::not-real

\`\`\`md
:::not-a-directive-in-code
\`\`\`
`)

    expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      'Unknown attribute "unexpected" on "callout".',
      'Unsupported callout variant "weird". Falling back to "note".',
      'Malformed directive attributes: braces must be balanced.',
      'Invalid toc depth "bad". Falling back to "3".',
      'Unknown attribute "mode" on "steps".',
      'Unknown directive "not-real".',
      'Unclosed directive "callout".',
    ])
  })
})
