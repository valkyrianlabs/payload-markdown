import type { Config } from 'payload'

import { beforeEach, describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import {
  layoutDirectiveRegistry,
  parseDirectiveAttributes,
  parseDirectiveLine,
} from '../src/directives'
import { payloadMarkdown } from '../src/index.ts'
import {
  clearPayloadMarkdownSettings,
  getPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
  resolveMarkdownFieldDefaults,
} from '../src/runtime'

const countLayout = (html: string, layout: string): number =>
  (html.match(new RegExp(`data-vl-layout="${layout}"`, 'g')) ?? []).length

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
    expect(parseDirectiveLine(':::section {#hero .wide .dark tone="info" open}')).toEqual({
      name: 'section',
      attributes: {
        id: 'hero',
        class: 'wide dark',
        open: true,
        tone: 'info',
      },
      rawAttributes: '{#hero .wide .dark tone="info" open}',
    })

    expect(parseDirectiveAttributes('{class="from-key" .from-dot title=\'A title\'}')).toEqual({
      class: 'from-key from-dot',
      title: 'A title',
    })

    expect(layoutDirectiveRegistry.parseMarkdownLine(':::section {#hero}')).toBeNull()
  })
})

describe('compileMarkdown layout directives', () => {
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
    expect(result.html).toContain('<h2>Inside section</h2>')
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
    expect(result.html).toContain('<h3>First explicit cell</h3>')
    expect(result.html).toContain('<h3>Second explicit cell</h3>')
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

    expect(result.warnings).toEqual([])
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
})
