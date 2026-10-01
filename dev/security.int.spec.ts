import { fromHtml } from 'hast-util-from-html'
import { visit } from 'unist-util-visit'
import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'
import { isSafeHref } from '../src/directives/urls'

const UNSAFE_HREFS = [
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  ' javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'java&#x09;script:alert(1)',
  'java&#9;script:alert(1)',
  'javascript&colon;alert(1)',
]

function urlAttributeValues(html: string): string[] {
  const values: string[] = []

  visit(fromHtml(html, { fragment: true }), 'element', (node) => {
    for (const name of ['href', 'src', 'action', 'formAction', 'xLinkHref']) {
      const value = node.properties?.[name]
      if (typeof value === 'string') values.push(value)
    }
  })

  return values
}

function expectNoScriptableUrl(html: string) {
  for (const value of urlAttributeValues(html)) {
    // eslint-disable-next-line no-control-regex
    const normalized = value.replace(/[\u0000-\u0020]/g, '').toLowerCase()

    expect(normalized.startsWith('javascript:')).toBe(false)
    expect(normalized.startsWith('data:')).toBe(false)
    expect(normalized.startsWith('vbscript:')).toBe(false)
  }
}

describe('CORE-1: directive hrefs are protocol-checked', () => {
  it('mirrors the rehype-sanitize href protocol allowlist', () => {
    expect(isSafeHref('/docs')).toBe(true)
    expect(isSafeHref('#anchor')).toBe(true)
    expect(isSafeHref('?q=a:b')).toBe(true)
    expect(isSafeHref('docs/a:b')).toBe(true)
    expect(isSafeHref('https://example.com')).toBe(true)
    expect(isSafeHref('mailto:a@example.com')).toBe(true)
    expect(isSafeHref('javascript:alert(1)')).toBe(false)
    expect(isSafeHref('JAVASCRIPT:alert(1)')).toBe(false)
    expect(isSafeHref('data:text/html,x')).toBe(false)
    expect(isSafeHref('java\tscript:alert(1)')).toBe(false)
    expect(isSafeHref('\u0001javascript:alert(1)')).toBe(false)
  })

  for (const href of UNSAFE_HREFS) {
    it(`never emits a live card link for ${JSON.stringify(href)}`, async () => {
      for (const markdown of [
        `:::card[Click]{href="${href}"}\nBody\n:::`,
        `:::card[Click]{href="${href}" linkScope="title"}\nBody\n:::`,
        `:::cards{href="${href}"}\n:::card[A]\nx\n:::\n:::`,
        `:::cards{href="${href}" linkScope="card"}\n:::card[A]\nx\n:::\n:::`,
        `:::cards{href="${href}" linkScope="title"}\n:::card[A]\nx\n:::\n:::`,
        `:::cards\n:::card[A]{href="${href}"}\nx\n:::\n:::`,
        `::button[Go]{href="${href}"}`,
        `::badge[x]{type="static" label="a" message="b" color="red" href="${href}"}`,
      ]) {
        const result = await compileMarkdown(markdown)

        expectNoScriptableUrl(result.html)
        expect(result.html).not.toContain('Failed to render markdown.')
      }
    })
  }

  it('reports unsafe directive hrefs in the renderer and the editor', async () => {
    const markdown = ':::card[Click]{href="javascript:alert(1)"}\nBody\n:::'
    const result = await compileMarkdown(markdown)
    const expected =
      'Unsafe href on "card": only relative URLs and http, https, irc, ircs, mailto, xmpp links are allowed. The link was removed.'

    expect(result.warnings).toContain(expected)
    expect(lintMarkdownDirectives(markdown).map((diagnostic) => diagnostic.message)).toContain(expected)
    expect(result.html).toContain('data-vl-layout="card"')
    expect(result.html).not.toContain('data-href')
    expect(result.html).not.toContain('data-directive-link')
  })

  it('keeps safe card and cards links unchanged', async () => {
    const card = await compileMarkdown(':::card[Docs]{href="/docs"}\nBody\n:::')
    const cards = await compileMarkdown(
      ':::cards{href="https://example.com/a?b=c:d" newTab="true"}\n:::card[A]\nx\n:::\n:::',
    )

    expect(card.warnings).toEqual([])
    expect(card.html).toContain('<a href="/docs" aria-label="Open Docs"')
    expect(cards.warnings).toEqual([])
    expect(cards.html).toContain(
      '<a href="https://example.com/a?b=c:d" rel="noopener noreferrer" target="_blank" aria-label="Open card section"',
    )
  })
})
