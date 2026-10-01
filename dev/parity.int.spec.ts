import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'

/**
 * Editor/renderer parity (CORE-9).
 *
 * Contract: every renderer warning about directive syntax is also reported by
 * the editor linter. The editor may report more (for example "tab is usually
 * intended inside tabs"). Documented exceptions, which need data the editor
 * does not have, are excluded from these vectors:
 * - icon file resolution ("Unknown icon ...", icon pack config validation)
 *   happens on the server filesystem;
 * - code fence language / Shiki configuration diagnostics.
 *
 * Message mapping: the renderer's "Auto-closing unclosed layout block: X" is
 * the editor's "Unclosed directive "X"." at the opening marker.
 */
function toEditorMessage(rendererWarning: string): string {
  const autoClose = rendererWarning.match(/^Auto-closing unclosed layout block: (.+)$/)

  return autoClose ? `Unclosed directive "${autoClose[1]}".` : rendererWarning
}

export const PARITY_VECTORS: Record<string, string> = {
  badgeConstructorType: '::badge[x]{type="constructor"}',
  badgeHasOwnPropertyType: '::badge[x]{type="hasOwnProperty"}',
  badgePrototypeType: '::badge[x]{type="toString"}',
  bareWordsAfterMarker: ':::toc is generated from headings.\n\n## A',
  blockquoteDirective: '> :::callout\n> q\n> :::',
  closerInsideCallout: ':::callout\nhi\n:::endcol\nafter',
  emphasisLedProse: '*:::toc* explains it\n\n## A',
  endWithoutSection: 'text\n\n:::end',
  footnoteDirective: 'Text[^1]\n\n[^1]: :::callout',
  fourColons: '::::callout\nhi\n::::',
  gridAutoClosedByHeading: '## H\n:::2col\n### A\na\n# Top\n:::endcol',
  gridsInSection: ':::section\n:::2col\n## A\n:::3col\n## B\n:::endsection',
  htmlInLabel: ':::callout[<b>x</b>]\nhi\n:::',
  inlineCodeLedProse: '`:::toc` links to the same IDs.\n\n## Placement',
  lazyListDirective: '- item\n:::callout\nlazy\n:::',
  leafInList: '- ::button[Go]{href="/x"}',
  linkLedProse: '[:::toc](#x) explains it\n\n## A',
  listDirective: '- item\n\n  :::callout\n  inside list\n  :::',
  malformedLeaf: '::button[Go] trailing words',
  nestedCallouts: ':::callout\nouter\n:::callout\ninner\n:::\nback in outer\n:::',
  nestedFenceWithDirective: '````md\n```\n:::callout\n```\n````',
  strayCloser: 'text\n\n:::',
  strayEndcol: ':::endcol',
  tableDirective: '| a | b |\n| - | - |\n| :::callout | x |',
  tabsDefaultUnicode: ':::tabs{default="日本"}\n:::tab[日本]\na\n:::\n:::tab[中文]\nb\n:::\n:::',
  tabsDefaultUnknown: ':::tabs{default="missing"}\n:::tab[日本]\na\n:::\n:::',
  tabsDuplicateValues: ':::tabs\n:::tab[A]{value="same"}\na\n:::\n:::tab[B]{value="same"}\nb\n:::\n:::',
  tocWithContent: '# A\n\n:::toc\nAuthored note.\n:::',
  unclosedToc: '# A\n\n:::toc\n\n## B\n\nText',
  unknownContainer: ':::not-real\nx\n:::',
  unknownLeaf: '::not-leaf[x]',
  unsafeCardHref: ':::card[Click]{href="javascript:alert(1)"}\nBody\n:::',
}

describe('CORE-9: editor diagnostics cover renderer warnings', () => {
  for (const [name, markdown] of Object.entries(PARITY_VECTORS)) {
    it(`agrees on ${name}`, async () => {
      const rendered = await compileMarkdown(markdown)
      const editorMessages = lintMarkdownDirectives(markdown).map((diagnostic) => diagnostic.message)

      for (const warning of rendered.warnings) expect(editorMessages).toContain(toEditorMessage(warning))
    })
  }

  it('reports directive markers inside lists, blockquotes, tables and footnotes', async () => {
    const cases: Array<[string, string, string]> = [
      [PARITY_VECTORS.listDirective, ':::callout', 'list item'],
      [PARITY_VECTORS.lazyListDirective, ':::callout', 'list item'],
      [PARITY_VECTORS.blockquoteDirective, ':::callout', 'blockquote'],
      [PARITY_VECTORS.leafInList, '::button', 'list item'],
      [PARITY_VECTORS.tableDirective, ':::callout', 'table'],
      [PARITY_VECTORS.footnoteDirective, ':::callout', 'footnote'],
    ]

    for (const [markdown, marker, container] of cases) {
      const expected = `Directive marker "${marker}" inside a ${container} is not supported and is rendered as text. Directives must start at the beginning of a top-level line.`
      const rendered = await compileMarkdown(markdown)
      const editor = lintMarkdownDirectives(markdown)

      expect(rendered.warnings).toContain(expected)
      expect(editor.map((diagnostic) => diagnostic.message)).toContain(expected)

      const diagnostic = editor.find((entry) => entry.message === expected)
      expect(markdown.slice(diagnostic?.from, diagnostic?.from === undefined ? 0 : diagnostic.from + 2)).toBe('::')
    }
  })

  it('does not flag directive-looking text inside nested code fences', () => {
    expect(lintMarkdownDirectives(PARITY_VECTORS.nestedFenceWithDirective)).toEqual([])
  })

  it('emulates renderer layout compilation for stray closers and heading-closed grids', () => {
    expect(lintMarkdownDirectives(PARITY_VECTORS.strayCloser).map((entry) => entry.message)).toEqual([
      'Encountered ::: with no open layout block.',
    ])
    expect(lintMarkdownDirectives(PARITY_VECTORS.endWithoutSection).map((entry) => entry.message)).toEqual([
      'Encountered :::end or :::endsection with no open section.',
    ])
    expect(
      lintMarkdownDirectives(PARITY_VECTORS.gridAutoClosedByHeading).map((entry) => entry.message),
    ).toEqual(['Encountered :::endcol with no open grid.'])
  })

  it('reports diagnostics at the marker line', () => {
    const markdown = 'Intro\n\n:::callout{variant="weird"}\nBody\n:::'
    const [diagnostic] = lintMarkdownDirectives(markdown)

    expect(diagnostic.line).toBe(3)
    expect(markdown.slice(diagnostic.from, diagnostic.to)).toBe(':::callout{variant="weird"}')
  })

  it('computes offsets correctly for CRLF documents', () => {
    const markdown = 'Intro\r\n\r\n:::callout{variant="weird"}\r\nBody\r\n:::'
    const [diagnostic] = lintMarkdownDirectives(markdown)

    expect(markdown.slice(diagnostic.from, diagnostic.to)).toBe(':::callout{variant="weird"}')
  })
})
