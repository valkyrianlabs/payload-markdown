import { afterEach, describe, expect, it, vi } from 'vitest'

import { MarkdownRenderer } from '../src/components/MarkdownRenderer/Component'
import { compileMarkdown } from '../src/core/renderMarkdown'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CORE-13: errors are distinguished from warnings', () => {
  it('reports no errors for successful renders, even with warnings', async () => {
    const result = await compileMarkdown(':::callout{variant="weird"}\nx\n:::')

    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual(['Unsupported callout variant "weird". Falling back to "note".'])
    expect(result.html).toContain('data-vl-layout="callout"')
  })

  it('reports and logs real compile failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const result = await compileMarkdown('# Hi', {
      icons: { baseDir: '.', packs: 5 as never },
    })

    expect(result.html).toBe('<p>Failed to render markdown.</p>')
    expect(result.errors).toHaveLength(1)
    expect(result.warnings).toEqual(result.errors)
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(String(consoleError.mock.calls[0][0])).toContain('[payload-markdown] Failed to render markdown')
  })

  it('MarkdownRenderer renders HTML for warnings and errorFallback only for errors', async () => {
    const withWarnings = await MarkdownRenderer({
      errorFallback: 'FALLBACK',
      markdown: ':::callout{variant="weird"}\nx\n:::',
    })

    expect(withWarnings).not.toBe('FALLBACK')
    expect(JSON.stringify(withWarnings)).toContain('data-vl-layout=\\"callout\\"')

    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const withError = await MarkdownRenderer({
      errorFallback: 'FALLBACK',
      icons: { baseDir: '.', packs: 5 as never },
      markdown: '# Hi',
    })

    expect(withError).toBe('FALLBACK')
  })
})
