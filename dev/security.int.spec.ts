import { fromHtml } from 'hast-util-from-html'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
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

describe('CORE-3: raw HTML cannot impersonate pipeline markers', () => {
  it('strips reserved data-* markers from raw HTML before directive transforms', async () => {
    const cases = [
      '<article data-vl-layout="card" data-href="javascript:alert(1)" data-title="Evil">x</article>',
      '<section data-vl-layout="cards" data-href="javascript:alert(2)">x</section>',
      '<div data-vl-layout="callout" data-title="Injected" data-icon="@x/y">hi</div>',
      '<button data-tab-trigger data-tab-value="x">t</button>',
      '<span data-pmd-icon-ref="@fa-duotone/book-open" class="x">i</span>',
      '<div data-pmd-pipeline="guess" data-vl-layout="callout" data-title="Forged">hi</div>',
    ]

    for (const markdown of cases) {
      const result = await compileMarkdown(markdown, {
        icons: { baseDir: 'tests/fixtures/icons', packs: [{ alias: 'fa-duotone', path: 'fa-duotone' }] },
      })

      expectNoScriptableUrl(result.html)
      expect(result.html).not.toMatch(/data-(vl-layout|href|title|icon|pmd|tab-)/)
      expect(result.html).not.toContain('vl-md-')
      expect(result.html).not.toContain('<svg')
      expect(result.warnings).toEqual([])
    }
  })

  it('still renders legitimate directives containing raw HTML identically', async () => {
    const result = await compileMarkdown(':::callout[Title]\n<b data-vl-layout="card">bold</b> text\n:::')

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('<div data-vl-layout="callout"')
    expect(result.html).toContain('<b>bold</b> text')
  })
})

describe('CORE-5: DOM clobbering protection for author raw HTML', () => {
  it('prefixes raw-HTML id and name values', async () => {
    const result = await compileMarkdown(
      '<div id="payload-markdown-x"></div>\n\n<a id="foo" name="foo">a</a>\n\n<img name="getElementById" src="x">',
    )

    expect(result.html).toContain('<div id="user-content-payload-markdown-x"></div>')
    expect(result.html).toContain('<a id="user-content-foo" name="user-content-foo">a</a>')
    expect(result.html).toContain('<img name="user-content-getElementById" src="x">')
    expect(result.html).not.toMatch(/name="getElementById"/)
  })

  it('keeps generated heading, footnote and tab ids unprefixed', async () => {
    const result = await compileMarkdown(
      '# Install\n\nText[^1]\n\n[^1]: Note.\n\n:::tabs\n:::tab[npm]\na\n:::\n:::',
    )

    expect(result.html).toContain('<h1 id="install" data-heading-anchor="install">Install</h1>')
    expect(result.html).toContain('id="user-content-fnref-1"')
    expect(result.html).toContain('href="#user-content-fn-1"')
    expect(result.html).not.toContain('user-content-user-content')
    expect(result.html).toContain('id="tabs-trigger-npm"')
    expect(result.html).toContain('id="tabs-panel-npm"')
  })
})

describe('CORE-4: icon SVGs are parsed and sanitized structurally', () => {
  const evilDir = path.resolve('tests/fixtures/icons/evil')
  const evilIcons = fs.readdirSync(evilDir).filter((file) => file.endsWith('.svg'))
  const iconConfig = {
    icons: {
      baseDir: 'tests/fixtures/icons',
      packs: [
        { alias: 'evil', path: 'evil' },
        { alias: 'brand', path: 'brand' },
      ],
    },
  }

  it('has adversarial fixtures', () => {
    expect(evilIcons.length).toBeGreaterThanOrEqual(13)
  })

  for (const file of evilIcons) {
    it(`neutralizes evil icon ${file}`, async () => {
      const name = file.replace(/\.svg$/, '')
      const result = await compileMarkdown(`::button[Go]{href="/x" icon="@evil/${name}"}`, iconConfig)
      const tree = fromHtml(result.html, { fragment: true })
      const tagNames: string[] = []
      const propertyNames: string[] = []

      visit(tree, 'element', (node) => {
        tagNames.push(node.tagName)
        for (const [key, value] of Object.entries(node.properties ?? {})) {
          propertyNames.push(key)
          if (['href', 'xLinkHref'].includes(key) && node.tagName !== 'a')
            expect(String(value).startsWith('#')).toBe(true)
        }
      })

      expect(result.warnings).toEqual([])
      expect(tagNames.filter((tagName) => tagName === 'svg')).toHaveLength(1)
      for (const forbidden of [
        'script',
        'style',
        'foreignObject',
        'animate',
        'animateTransform',
        'set',
        'iframe',
        'img',
        'image',
        'div',
      ])
        expect(tagNames).not.toContain(forbidden)
      expect(propertyNames.filter((key) => /^on/i.test(key))).toEqual([])
      expect(result.html).not.toMatch(/javascript:|alert\(|evil\.example|data-x/i)
      expectNoScriptableUrl(result.html)
      expect(result.html).toContain('>Go</a>')
    })
  }

  it('keeps legitimate gradients, fragment refs and authored classes', async () => {
    const result = await compileMarkdown('::button[Go]{href="/x" icon="@brand/gradient"}', iconConfig)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain(
              'class="brand-icon pmd-button__icon pmd-button__icon--left" aria-hidden="true" focusable="false"',
    )
    expect(result.html).toContain('<linearGradient id="g" x1="0" x2="1" gradientUnits="objectBoundingBox">')
    expect(result.html).toContain('<use href="#p" fill="url(#g)"></use>')
    expect(result.html).toContain('<use xlink:href="#p" stroke="currentColor" stroke-width="2" stroke-linecap="round"></use>')
  })

  it('keeps duotone appearance by translating safe class rules into attributes, never emitting <style>', async () => {
    const result = await compileMarkdown('::button[Go]{href="/x" icon="@fa-duotone/duotone-styled"}', {
      icons: { baseDir: 'tests/fixtures/icons', packs: [{ alias: 'fa-duotone', path: 'fa-duotone' }] },
    })

    expect(result.warnings).toEqual([])
    expect(result.html).not.toContain('<style')
    expect(result.html).toContain('<path class="fa-secondary" d="M1 1h14v6H1z" opacity=".4"></path>')
    expect(result.html).toContain('<path class="fa-primary" d="M1 9h14v6H1z"></path>')
  })

  it('keeps design-tool exports (Illustrator/Figma class styles) looking the same', async () => {
    const result = await compileMarkdown('::button[Go]{href="/x" icon="@export/logo"}', {
      icons: { baseDir: 'tests/fixtures/icons', packs: [{ alias: 'export', path: 'design-export' }] },
    })

    expect(result.warnings).toEqual([])
    expect(result.html).not.toContain('<style')
    expect(result.html).toContain(
      '<circle class="cls-1" cx="12" cy="12" r="10" fill="#0a84ff" stroke="#003366" stroke-miterlimit="10" stroke-width=".5px"></circle>',
    )
    expect(result.html).toContain(
      '<path class="cls-2" d="M4 12h16" fill="none" stroke="#ff9f0a" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 1"></path>',
    )
    expect(result.html).toContain('fill="rgb(52, 199, 89)" opacity="0.8"')
  })

  it('never turns unsafe style values into attributes', async () => {
    const { parseAndSanitizeSvg } = await import('../src/icons/sanitizeSvg')
    const svg = parseAndSanitizeSvg(
      [
        '<svg viewBox="0 0 1 1"><style>',
        '.x{fill:url(#g);stroke:url(https://evil.example/s.svg#a);opacity:.5}',
        '.x{fill:var(--evil);stroke:attr(data-x);color:expression(alert(1))}',
        '.x{font-family:"Inter\\" onload=alert(1)";stroke-width:calc(1px + 1px)}',
        '.x{fill:javascript:alert(1);stroke:red;}',
        '</style><path class="x" d="M0 0"/></svg>',
      ].join(''),
    )
    const pathNode = svg?.children.find((child) => child.type === 'element' && child.tagName === 'path')

    expect(pathNode && 'properties' in pathNode ? pathNode.properties : undefined).toEqual({
      className: ['x'],
      d: 'M0 0',
      opacity: '.5',
      stroke: 'red',
    })
  })

  it('ignores style rules that are not plain class selectors with safe paint values', async () => {
    const { parseAndSanitizeSvg } = await import('../src/icons/sanitizeSvg')
    const svg = parseAndSanitizeSvg(
      [
        '<svg viewBox="0 0 1 1"><style>',
        '.a{fill:url(https://evil.example/x)}',
        '.b{opacity:.4;background:red}',
        'path{opacity:.1}',
        '.c[d]{opacity:.2}',
        '@import "https://evil.example/x.css";',
        '.d{fill:expression(alert(1))}',
        '.e{fill:#ff0000;stroke:currentColor}',
        '</style><path class="a b c d e" d="M0 0"/></svg>',
      ].join(''),
    )
    const pathNode = svg?.children.find((child) => child.type === 'element' && child.tagName === 'path')

    expect(pathNode && 'properties' in pathNode ? pathNode.properties : undefined).toEqual({
      className: ['a', 'b', 'c', 'd', 'e'],
      d: 'M0 0',
      fill: '#ff0000',
      // `.b{opacity:.4;background:red}`: the safe declaration applies, the unsupported one is skipped
      opacity: '.4',
      stroke: 'currentColor',
    })
  })

  it('re-reads an icon when the file changes', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pmd-icons-'))
    const iconFile = path.join(dir, 'pack', 'dot.svg')
    const config = { icons: { baseDir: dir, packs: [{ alias: 'tmp', path: 'pack' }] } }

    fs.mkdirSync(path.dirname(iconFile))
    fs.writeFileSync(iconFile, '<svg viewBox="0 0 1 1"><path d="M0"/></svg>')

    const first = await compileMarkdown('::button[Go]{href="/x" icon="@tmp/dot"}', config)
    fs.writeFileSync(iconFile, '<svg viewBox="0 0 2 2"><circle r="1"/></svg>')
    fs.utimesSync(iconFile, new Date(Date.now() + 5000), new Date(Date.now() + 5000))
    const second = await compileMarkdown('::button[Go]{href="/x" icon="@tmp/dot"}', config)

    expect(first.html).toContain('<path d="M0"></path>')
    expect(second.html).toContain('<circle r="1"></circle>')
    expect(second.html).not.toContain('<path d="M0">')
    fs.rmSync(dir, { force: true, recursive: true })
  })
})

describe('CORE-12: prototype keys in badge types', () => {
  for (const type of ['constructor', 'toString', 'hasOwnProperty', '__proto__', 'valueOf']) {
    it(`reports type="${type}" as unsupported without crashing`, async () => {
      const markdown = `# Page\n\n::badge[x]{type="${type}"}\n\nAfter.`
      const result = await compileMarkdown(markdown)

      expect(result.html).not.toContain('Failed to render markdown.')
      expect(result.html).toContain('<p>After.</p>')
      expect(result.warnings).toContain(`Unsupported badge type "${type}".`)
      expect(() => lintMarkdownDirectives(markdown)).not.toThrow()
      expect(lintMarkdownDirectives(markdown).map((diagnostic) => diagnostic.message)).toContain(
        `Unsupported badge type "${type}".`,
      )
    })
  }
})
