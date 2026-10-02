import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { compileMarkdown, renderMarkdownDocument as renderMarkdown } from '../src/core/renderMarkdown'
import { extractHeadingAnchors } from '../src/directives/extractHeadings'

afterEach(() => {
  vi.restoreAllMocks()
})

function walkMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) return walkMarkdownFiles(entryPath)

    return entry.name.endsWith('.md') ? [entryPath] : []
  })
}

function emittedHeadingIds(html: string): string[] {
  return [...html.matchAll(/<h[1-6] id="([^"]*)" data-heading-anchor="/g)].map((match) => match[1])
}

const SAMPLE = [
  '# Title', // 1
  '', // 2
  'Intro with [a link](/docs) and ![alt text](/i.png).', // 3
  '', // 4
  ':::callout{variant="tip" theme="nope"}', // 5
  'Hello **world**', // 6
  ':::', // 7
  '', // 8
  '- :::card', // 9
  '', // 10
  ':::', // 11
  '', // 12
  '```bash', // 13
  'echo hi', // 14
  '```', // 15
  '', // 16
  '## Title', // 17
  '', // 18
  '::button[Go]{href="/go"}', // 19
  '', // 20
  ':::card{href="javascript:alert(1)" title="Card title"}', // 21
  'Body <span>raw</span>', // 22
  ':::', // 23
  '', // 24
  '  :::nope', // 25
  '', // 26
  ':::section', // 27
  'unclosed', // 28
  '', // 29
  '[ref]: https://example.com', // 30
].join('\n')

describe('renderMarkdown: headless structured render API', () => {
  it('returns the same html, warnings and errors as compileMarkdown', async () => {
    const full = await renderMarkdown(SAMPLE)
    const compiled = await compileMarkdown(SAMPLE)

    expect(compiled).toEqual({ errors: full.errors, html: full.html, warnings: full.warnings })
    expect(full.warnings).toEqual(full.diagnostics.map((diagnostic) => diagnostic.message))
    expect(full.errors).toEqual([])
  })

  it('reports diagnostics with source, severity and source positions', async () => {
    const { diagnostics } = await renderMarkdown(SAMPLE)

    expect(diagnostics).toEqual([
      {
        column: 1,
        line: 21,
        message: expect.stringContaining('Unsafe href on "card"'),
        severity: 'warning',
        source: 'directive',
      },
      {
        column: 3,
        line: 25,
        message: 'Unknown directive "nope".',
        severity: 'warning',
        source: 'directive',
      },
      {
        code: 'nested-directive-marker',
        column: 3,
        line: 9,
        message: expect.stringContaining('Directive marker ":::card" inside a list item'),
        severity: 'warning',
        source: 'directive',
      },
      {
        code: 'stray-directive-close',
        column: 1,
        line: 11,
        message: 'Encountered ::: with no open layout block.',
        severity: 'warning',
        source: 'directive',
      },
      {
        code: 'unclosed-directive',
        column: 1,
        line: 27,
        message: 'Auto-closing unclosed layout block: section',
        severity: 'warning',
        source: 'directive',
      },
      {
        code: 'unknown-theme',
        column: 1,
        line: 5,
        message: 'Unknown theme "nope" on "callout". Falling back to "soft".',
        severity: 'warning',
        source: 'theme',
      },
      {
        column: 1,
        line: 13,
        message: expect.stringContaining('Code block language "bash" is not loaded'),
        severity: 'info',
        source: 'code',
      },
    ])
  })

  it('positions leaf directive and mdast validation diagnostics', async () => {
    const { diagnostics } = await renderMarkdown(
      ['Text', '', '::button{href="/x"}', '', ':::tabs', 'no tabs', ':::'].join('\n'),
    )

    expect(diagnostics).toEqual([
      {
        column: 1,
        line: 3,
        message: 'Icon-only button requires an ariaLabel attribute.',
        severity: 'warning',
        source: 'directive',
      },
      {
        column: 1,
        line: 5,
        message: 'Directive "tabs" has no child "tab" directives.',
        severity: 'warning',
        source: 'directive',
      },
    ])
  })

  it('returns the heading ids that are emitted in the html', async () => {
    const result = await renderMarkdown(SAMPLE)

    expect(result.headings).toEqual([
      { id: 'title', depth: 1, text: 'Title' },
      { id: 'title-1', depth: 2, text: 'Title' },
    ])
    expect(emittedHeadingIds(result.html)).toEqual(result.headings.map((heading) => heading.id))
  })

  it('returns plain text without directive markup or raw html', async () => {
    const { text } = await renderMarkdown(SAMPLE)

    expect(text).toContain('Intro with a link and alt text.')
    expect(text).toContain('Hello world')
    expect(text).toContain('Card title\n\nBody raw')
    expect(text).toContain('echo hi')
    expect(text).toContain('Go')
    expect(text).not.toContain('variant=')
    expect(text).not.toContain('<span>')
    expect(text).not.toMatch(/^:::callout/m)
    expect(text).not.toMatch(/^:::$/m)
  })

  it('returns authored urls in document order with their kind', async () => {
    const { links } = await renderMarkdown(SAMPLE)

    expect(links).toEqual([
      { kind: 'link', url: '/docs' },
      { kind: 'image', url: '/i.png' },
      { kind: 'directive', url: '/go' },
      { kind: 'directive', url: 'javascript:alert(1)' },
      { kind: 'definition', url: 'https://example.com' },
    ])
  })

  it('returns a structured error result for compile failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const result = await renderMarkdown('# Hi', { icons: { baseDir: '.', packs: 5 as never } })

    expect(result).toEqual({
      diagnostics: [
        { code: 'render-failed', message: expect.any(String), severity: 'error', source: 'render' },
      ],
      errors: [result.diagnostics[0].message],
      headings: [],
      html: '<p>Failed to render markdown.</p>',
      links: [],
      text: '',
      warnings: [result.diagnostics[0].message],
    })
  })

  it('agrees with extractHeadingAnchors and the emitted ids for the docs corpus', async () => {
    for (const file of walkMarkdownFiles(path.resolve('docs'))) {
      const markdown = fs
        .readFileSync(file, 'utf8')
        .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      const result = await renderMarkdown(markdown)

      expect({ file, ids: emittedHeadingIds(result.html) }).toEqual({
        file,
        ids: result.headings.map((heading) => heading.id),
      })
      expect(result.headings).toEqual(extractHeadingAnchors(markdown))
    }
  })
})
