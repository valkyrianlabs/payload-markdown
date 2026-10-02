import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { getDirectiveCloseLabels } from '../src/directives/closeLabels'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'

const summarize = (markdown: string) =>
  getDirectiveCloseLabels(markdown).map(({ kind, label, line }) => ({ kind, label, line }))

function walkMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) return walkMarkdownFiles(entryPath)

    return entry.name.endsWith('.md') ? [entryPath] : []
  })
}

describe('editor close labels use the shared directive line scanner', () => {
  it('places the widget after the marker and the suffix over the closer text', () => {
    const markdown = ':::section\n  :::card\nBody\n::: \n:::endsection \n'
    const labels = getDirectiveCloseLabels(markdown)
    const widgetFrom = markdown.indexOf('::: ') + 3
    const suffixFrom = markdown.indexOf(':::endsection') + 3

    expect(labels).toEqual([
      { from: widgetFrom, kind: 'widget', label: 'endcard', line: 4, to: widgetFrom },
      {
        from: suffixFrom,
        kind: 'suffix',
        label: 'endsection',
        line: 5,
        to: suffixFrom + 'endsection'.length,
      },
    ])
    expect(markdown.slice(labels[1].from, labels[1].to)).toBe('endsection')
  })

  it('does not label a closer that a hard line break joins to the next line', () => {
    // Two trailing spaces make a hard break; the renderer reports the joined
    // line as a malformed marker and closes nothing.
    expect(summarize(':::callout\nBody\n:::  \n:::end\n')).toEqual([])
  })

  it('computes offsets from the source for CRLF documents', () => {
    const markdown = ':::callout\r\nText\r\n:::\r\n:::end\r\n'
    const [widget, suffix] = getDirectiveCloseLabels(markdown)

    expect(widget).toMatchObject({ from: markdown.indexOf(':::\r') + 3, label: 'endcallout', line: 3 })
    expect(suffix).toMatchObject({ kind: 'suffix', label: 'end', line: 4 })
    expect(markdown.slice(suffix.from, suffix.to)).toBe('end')
  })

  it('ignores markers the renderer does not treat as directive lines', () => {
    const markdown = [
      ':::callout',
      '',
      '~~~~md',
      ':::',
      '```',
      ':::',
      '~~~~',
      '',
      '    :::',
      '',
      '- :::',
      '',
      '> :::',
      '',
      '<div>',
      ':::',
      '</div>',
      '',
      '`:::` inline',
      '\\:::',
      ':::',
    ].join('\n')

    expect(summarize(markdown)).toEqual([{ kind: 'widget', label: 'endcallout', line: 21 }])
  })

  it('skips multi-line attribute blocks and labels the next closer', () => {
    const markdown = [':::cards {', '  title="A"', '  cardTheme="glass"', '}', ':::card', 'Body', ':::', ':::'].join(
      '\n',
    )

    expect(summarize(markdown)).toEqual([
      { kind: 'widget', label: 'endcard', line: 7 },
      { kind: 'widget', label: 'endcards', line: 8 },
    ])
  })

  it('follows the renderer when a shallower heading closes a grid', () => {
    const markdown = [
      ':::section',
      '## Columns',
      ':::2col',
      'Left',
      '# Top',
      ':::',
    ].join('\n')

    expect(summarize(markdown)).toEqual([{ kind: 'widget', label: 'endsection', line: 6 }])
  })

  it('follows the renderer when a new grid opens inside the same section', () => {
    const markdown = [':::section', ':::2col', 'A', '', ':::3col', 'B', ':::', ':::'].join('\n')

    expect(summarize(markdown)).toEqual([
      { kind: 'widget', label: 'endcol', line: 7 },
      { kind: 'widget', label: 'endsection', line: 8 },
    ])
  })

  it('labels stray explicit closers but not stray bare closers', () => {
    expect(summarize(':::\n\n:::endcol\n\n:::end')).toEqual([
      { kind: 'suffix', label: 'endcol', line: 3 },
      { kind: 'suffix', label: 'end', line: 5 },
    ])
  })

  it('labels exactly the closers the linter accepts on the docs corpus', () => {
    const files = walkMarkdownFiles(path.resolve('docs'))

    expect(files.length).toBeGreaterThan(20)

    for (const file of files) {
      const markdown = fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      const labels = getDirectiveCloseLabels(markdown)
      const closerLines = markdown
        .split('\n')
        .flatMap((line, index) => (/^\s*:::(?:end(?:col|section)?)?\s*$/.test(line) ? [index + 1] : []))

      // The corpus is lint-clean, has no markers inside code or nested
      // blocks outside fences, and every top-level closer closes something.
      expect(lintMarkdownDirectives(markdown)).toEqual([])
      for (const label of labels) {
        expect(markdown.slice(label.from - 3, label.from)).toBe(':::')
        expect(closerLines).toContain(label.line)
      }
    }
  })
})
