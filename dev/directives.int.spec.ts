import type { Root } from 'mdast'

import fs from 'node:fs'
import path from 'node:path'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

function walkMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) return walkMarkdownFiles(entryPath)

    return entry.name.endsWith('.md') ? [entryPath] : []
  })
}

function countRootHeadings(markdown: string): number {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)

  return tree.children.filter((node) => node.type === 'heading').length
}

describe('CORE-2: only source lines starting with a marker open directives', () => {
  const hijackPrefixes = [
    '`:::toc`',
    '`:::section`',
    '*:::toc*',
    '_:::steps_',
    '**:::toc**',
    '[:::toc](#x)',
    '\\:::toc',
    '&#58;::toc',
    '`::button[Go]{href="/x"}`',
  ]

  for (const prefix of hijackPrefixes) {
    it(`keeps prose starting with ${prefix} as prose`, async () => {
      const markdown = `# Title\n\n${prefix} links to the same IDs.\n\n## Placement\n\nImportant paragraph.\n\n## Themes\n\nMore text.`
      const result = await compileMarkdown(markdown)

      expect(result.warnings).toEqual([])
      expect(result.html).toContain('<h2 id="placement" data-heading-anchor="placement">Placement</h2>')
      expect(result.html).toContain('<p>Important paragraph.</p>')
      expect(result.html).toContain('<h2 id="themes" data-heading-anchor="themes">Themes</h2>')
      expect(result.html).not.toContain('data-vl-layout')
      expect(lintMarkdownDirectives(markdown)).toEqual([])
    })
  }

  it('reports bare words after a container marker instead of swallowing content', async () => {
    const markdown = ':::toc is generated from headings.\n\n## Placement\n\nImportant paragraph.'
    const result = await compileMarkdown(markdown)
    const expected =
      'Unexpected text "is generated from headings." after ":::toc". Directive attributes must be wrapped in {…}; the line is rendered as text.'

    expect(result.warnings).toEqual([expected])
    expect(result.html).toContain('<p>:::toc is generated from headings.</p>')
    expect(result.html).toContain('<h2 id="placement"')
    expect(result.html).toContain('<p>Important paragraph.</p>')
    expect(result.html).not.toContain('data-vl-layout')
    expect(lintMarkdownDirectives(markdown).map((diagnostic) => diagnostic.message)).toEqual([expected])
  })

  it('reports prose after a leaf marker instead of rendering it silently', async () => {
    const markdown = '::button is a leaf directive.\n\n::badge[npm] renders an image.'
    const result = await compileMarkdown(markdown)

    expect(result.warnings).toEqual([
      'Malformed "::button" directive. Expected ::button[Label]{…}; the line is rendered as text.',
      'Malformed "::badge" directive. Expected ::badge[Label]{…}; the line is rendered as text.',
    ])
    expect(result.html).toContain('<p>::button is a leaf directive.</p>')
    expect(result.html).not.toContain('pmd-button')
  })

  it('still accepts unbraced key=value attributes', async () => {
    const result = await compileMarkdown(':::callout variant="warning" title="Heads up"\nBody\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('data-variant="warning"')
    expect(result.html).toContain('Heads up')
  })

  it('never discards authored toc children', async () => {
    const result = await compileMarkdown('# A\n\n:::toc\nAuthored note.\n\n## B\n:::')

    expect(result.warnings).toEqual([
      'Directive "toc" contains authored content; it is rendered after the generated table of contents. Close ":::toc" with ":::" on the next line.',
    ])
    expect(result.html).toContain('<li><a href="#a">A</a></li>')
    expect(result.html).toContain('<li><a href="#b">B</a></li>')
    expect(result.html).toContain('<p>Authored note.</p>')
    expect(result.html).toContain('<h2 id="b" data-heading-anchor="b">B</h2>')
  })

  it('renders the repository docs corpus with no warnings and no heading loss', async () => {
    const docsDir = path.resolve('docs')
    const files = walkMarkdownFiles(docsDir)

    expect(files.length).toBeGreaterThan(20)

    for (const file of files) {
      const markdown = stripFrontmatter(fs.readFileSync(file, 'utf8'))
      const result = await compileMarkdown(markdown)
      const renderedHeadings = result.html.match(/data-heading-anchor="/g)?.length ?? 0

      expect({ file: path.relative(docsDir, file), warnings: result.warnings }).toEqual({
        file: path.relative(docsDir, file),
        warnings: [],
      })
      expect({ file, headings: renderedHeadings }).toEqual({ file, headings: countRootHeadings(markdown) })
      expect(lintMarkdownDirectives(markdown)).toEqual([])
    }
  })
})

describe('CORE-19: labels and attribute values are parsed from source', () => {
  it('supports balanced brackets in labels', async () => {
    const result = await compileMarkdown(':::callout[Use [x] here]\nhi\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('data-title="Use [x] here"')
  })

  it('keeps emphasis markers in attribute values literally', async () => {
    const result = await compileMarkdown(':::callout{title="*star* and _under_"}\nx\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('data-title="*star* and _under_"')
  })

  it('decodes escapes and character references in attribute values', async () => {
    const result = await compileMarkdown(':::callout{title="a\\\\b \\"q\\" &amp; c"}\nx\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('data-title="a\\b &#x22;q&#x22; &#x26; c"')
  })

  it('reports prototype-named attributes instead of eating them', async () => {
    const result = await compileMarkdown(':::callout{__proto__="x" constructor="y"}\nhi\n:::')

    expect(result.warnings).toEqual([
      'Unknown attribute "__proto__" on "callout".',
      'Unknown attribute "constructor" on "callout".',
    ])
    expect(Object.getPrototypeOf({})).toBe(Object.prototype)
  })

  it('recognises directives whose label or attributes contain HTML', async () => {
    const label = await compileMarkdown(':::callout[<b>Bold</b> title]\nhi\n:::')
    const attribute = await compileMarkdown(':::callout{title="<b>x</b>&amp;"}\nhi\n:::')

    expect(label.warnings).toEqual([])
    expect(label.html).toContain('data-title="Bold title"')
    expect(label.html).not.toContain('<b>')
    expect(attribute.warnings).toEqual([])
    expect(attribute.html).toContain('data-title="<b>x</b>&#x26;"')
    expect(attribute.html).toContain('&#x3C;b>x&#x3C;/b>&#x26;')
  })

  it('keeps label text identical to the previous inline flattening', async () => {
    const result = await compileMarkdown(':::callout[**Bold** `code` _em_ &amp; [link](/x)]\nhi\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('data-title="Bold code em &#x26; link"')
  })

  it('does not turn list-like or heading-like labels into blocks', async () => {
    const result = await compileMarkdown(':::tabs\n:::tab[1. Install]\na\n:::\n:::tab[# Use]\nb\n:::\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('>1. Install</button>')
    expect(result.html).toContain('># Use</button>')
  })
})
