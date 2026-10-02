import type * as Shiki from 'shiki'

import { describe, expect, it, vi } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'

const shikiControl = vi.hoisted(() => ({
  codeToHtmlOptions: [] as Array<{ tokenizeTimeLimit?: number }>,
  failThemeOnce: new Set<string>(),
}))

vi.mock('shiki', async (importOriginal) => {
  const actual = await importOriginal<typeof Shiki>()

  return {
    ...actual,
    createHighlighter: (options: Parameters<typeof actual.createHighlighter>[0]) => {
      const requested = options.themes?.[0]
      const theme = typeof requested === 'string' ? requested : ''

      if (shikiControl.failThemeOnce.has(theme)) {
        shikiControl.failThemeOnce.delete(theme)
        return Promise.reject(new Error(`simulated load failure for ${theme}`))
      }

      return actual.createHighlighter(options).then((highlighter) => {
        const codeToHtml = highlighter.codeToHtml.bind(highlighter)

        highlighter.codeToHtml = (code, codeOptions) => {
          shikiControl.codeToHtmlOptions.push(codeOptions)
          return codeToHtml(code, codeOptions)
        }

        return highlighter
      })
    },
  }
})

const jsFence = '```js\nconst a = 1\n```'

describe('CORE-11: invalid Shiki configuration never blanks code pages', () => {
  it('falls back to the default theme for an unknown theme', async () => {
    const result = await compileMarkdown(jsFence, { code: { shikiTheme: 'not-a-theme' } })

    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual(['Unknown Shiki theme "not-a-theme". Falling back to "github-dark".'])
    expect(result.html).toContain('shiki github-dark')
    expect(result.html).toContain('style="color')
  })

  it('ignores unknown languages and keeps highlighting the valid ones', async () => {
    const result = await compileMarkdown(jsFence, { code: { langs: ['js', 'not-a-lang'] } })

    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual(['Unknown Shiki language "not-a-lang" in code langs. It was ignored.'])
    expect(result.html).toContain('style="color')
  })

  it('accepts configured languages case-insensitively', async () => {
    const result = await compileMarkdown('```ts\nconst a: number = 1\n```', {
      code: { langs: ['TypeScript'] },
    })

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('style="color')
  })

  it('reports a bad config once per render, not once per code block', async () => {
    const result = await compileMarkdown(`${jsFence}\n\n${jsFence}`, {
      code: { shikiTheme: 'nope' },
    })

    expect(result.warnings).toEqual(['Unknown Shiki theme "nope". Falling back to "github-dark".'])
  })

  it('does not cache a rejected highlighter', async () => {
    shikiControl.failThemeOnce.add('github-light')

    const first = await compileMarkdown(jsFence, { code: { shikiTheme: 'github-light' } })
    const second = await compileMarkdown(jsFence, { code: { shikiTheme: 'github-light' } })

    expect(first.errors).toEqual([])
    expect(first.html).toContain('shiki github-dark')
    expect(first.warnings[0]).toContain('Failed to load the configured Shiki highlighter')
    expect(second.warnings).toEqual([])
    expect(second.html).toContain('shiki github-light')
  })
})

describe('CORE-14: fence language resolution', () => {
  for (const lang of ['JS', 'Js', 'javascript', 'TS', 'TypeScript', 'JSON']) {
    it(`highlights ${lang} through the loaded language set`, async () => {
      const result = await compileMarkdown(`\`\`\`${lang}\nconst a = { "b": 1 }\n\`\`\``)

      expect(result.warnings).toEqual([])
      expect(result.html).toContain('style="color')
    })
  }

  it('reports languages that are not loaded and renders them as plain text', async () => {
    const result = await compileMarkdown('```bash\npnpm add x\n```\n\n```bash\nnpm i x\n```')

    expect(result.warnings).toEqual([
      'Code block language "bash" is not loaded, so it is rendered as plain text. Add it to code.langs to highlight it.',
    ])
    expect(result.html).not.toContain('style="color')
  })

  it('highlights a language once it is configured', async () => {
    const result = await compileMarkdown('```bash\npnpm add x\n```', {
      code: { langs: ['js', 'bash'] },
    })

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('style="color')
  })

  it('treats plain text fences and fences without a language as intentional', async () => {
    const result = await compileMarkdown('```\nplain\n```\n\n```text\nplain\n```\n\n```TXT\nplain\n```')

    expect(result.warnings).toEqual([])
  })
})

describe('deterministic highlighting under load', () => {
  it('passes a generous per-line tokenize budget so slow first tokenization never degrades output', async () => {
    shikiControl.codeToHtmlOptions.length = 0
    const result = await compileMarkdown(jsFence)

    expect(result.html).toContain('<span style="color:#F97583">const</span>')
    expect(shikiControl.codeToHtmlOptions.length).toBeGreaterThan(0)
    for (const options of shikiControl.codeToHtmlOptions) {
      expect(options.tokenizeTimeLimit).toBeGreaterThanOrEqual(5000)
    }
  })
})
