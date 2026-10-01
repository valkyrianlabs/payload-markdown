import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'
import {
  createHeadingSlugger,
  extractHeadingAnchors,
  slugifyHeading,
} from '../src/exports/advanced'

type SlugVectors = {
  cases: Array<{ headings: string[]; ids: string[]; name: string }>
}

const vectors = JSON.parse(
  fs.readFileSync(path.resolve('tests/fixtures/heading-slug-vectors.json'), 'utf8'),
) as SlugVectors

function headingIds(html: string): string[] {
  return [...html.matchAll(/data-heading-anchor="([^"]*)"/g)].map((match) => match[1])
}

describe('CORE-10: heading anchors', () => {
  for (const vector of vectors.cases) {
    it(`slugs ${vector.name}`, async () => {
      const slugger = createHeadingSlugger()
      const markdown = vector.headings.map((heading) => `## ${heading}`).join('\n\n')

      expect(vector.headings.map((heading) => slugger.slug(heading))).toEqual(vector.ids)
      expect(extractHeadingAnchors(markdown).map((anchor) => anchor.id)).toEqual(vector.ids)
      expect(headingIds((await compileMarkdown(markdown)).html)).toEqual(vector.ids)
    })
  }

  it('never emits duplicate ids for suffix collisions and links the TOC to each heading', async () => {
    const result = await compileMarkdown('# Foo\n\n# Foo\n\n# Foo 1\n\n:::toc\n:::')
    const ids = headingIds(result.html)

    expect(new Set(ids).size).toBe(ids.length)
    expect(result.html).toContain('<li><a href="#foo">Foo</a></li>')
    expect(result.html).toContain('<li><a href="#foo-1">Foo</a></li>')
    expect(result.html).toContain('<li><a href="#foo-1-1">Foo 1</a></li>')
  })

  it('keeps inline HTML out of TOC text without changing the anchor', async () => {
    const result = await compileMarkdown('## <b>Bold</b> head\n\n:::toc\n:::')

    expect(result.html).toContain('<h2 id="b-bold-b-head" data-heading-anchor="b-bold-b-head"><b>Bold</b> head</h2>')
    expect(result.html).toContain('<li><a href="#b-bold-b-head">Bold head</a></li>')
    expect(result.html).not.toContain('&#x3C;b>')
    expect(extractHeadingAnchors('## <b>Bold</b> head')).toEqual([
      { id: 'b-bold-b-head', depth: 2, text: 'Bold head' },
    ])
  })

  it('exposes the pure slug function', () => {
    expect(slugifyHeading('Configure the Plugin!')).toBe('configure-the-plugin')
    expect(slugifyHeading('日本語')).toBe('section')
  })

  it('extractHeadingAnchors matches the renderer on the docs corpus', async () => {
    const docsDir = path.resolve('docs')
    const files = fs
      .readdirSync(docsDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(entry.parentPath, entry.name))

    for (const file of files) {
      const markdown = fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      const rendered = headingIds((await compileMarkdown(markdown)).html)

      expect({ file, ids: extractHeadingAnchors(markdown).map((anchor) => anchor.id) }).toEqual({
        file,
        ids: rendered,
      })
    }
  })
})

describe('CORE-10: tab values for labels without ASCII letters', () => {
  const markdown = ':::tabs{default="中文"}\n:::tab[日本]\na\n:::\n:::tab[中文]\nb\n:::\n:::'

  it('gives each tab a distinct positional value and honours a non-ASCII default', async () => {
    const result = await compileMarkdown(markdown)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('id="tabs-trigger-tab-1"')
    expect(result.html).toContain('id="tabs-trigger-tab-2"')
    expect(result.html).toContain('data-default="tab-2"')
    expect(result.html).toMatch(/id="tabs-trigger-tab-2"[^>]*aria-selected="true"/)
  })

  it('uses the same algorithm in the editor linter', () => {
    expect(lintMarkdownDirectives(markdown)).toEqual([])
    expect(
      lintMarkdownDirectives(':::tabs{default="한국"}\n:::tab[日本]\na\n:::\n:::tab[中文]\nb\n:::\n:::').map(
        (diagnostic) => diagnostic.message,
      ),
    ).toEqual(['Invalid tabs default "한국". Falling back to the first tab.'])
  })

  it('numbers unlabeled tabs by position', async () => {
    const result = await compileMarkdown(':::tabs\n:::tab\na\n:::\n:::tab\nb\n:::\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('>Tab 1</button>')
    expect(result.html).toContain('>Tab 2</button>')
    expect(result.html).toContain('id="tabs-panel-tab-2"')
  })
})

describe('CORE-20: generated ids are unique within one render', () => {
  it('keeps the first tabs block ids and suffixes the second', async () => {
    const result = await compileMarkdown(
      ':::tabs\n:::tab[npm]\na\n:::\n:::\n\n:::tabs\n:::tab[npm]\nb\n:::\n:::',
    )
    const ids = [...result.html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1])

    expect(ids).toEqual(['tabs-trigger-npm', 'tabs-panel-npm', 'tabs-trigger-npm-1', 'tabs-panel-npm-1'])
    expect(result.html).toContain('aria-controls="tabs-panel-npm-1"')
    expect(result.html).toContain('aria-labelledby="tabs-trigger-npm-1"')
  })

  it('does not let tab ids collide with heading anchors', async () => {
    const result = await compileMarkdown('# Tabs panel npm\n\n:::tabs\n:::tab[npm]\na\n:::\n:::')
    const ids = [...result.html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1])

    expect(ids).toEqual(['tabs-panel-npm', 'tabs-trigger-npm-1', 'tabs-panel-npm-1'])
  })
})
