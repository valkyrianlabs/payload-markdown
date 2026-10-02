import type { ReactElement } from 'react'

import { beforeEach, describe, expect, it } from 'vitest'

import { MarkdownBlockComponent } from '../src/blocks/MarkdownBlock/Component'
import { resolveMarkdownBlockParams } from '../src/blocks/MarkdownBlock/params'
import { clearPayloadMarkdownSettings } from '../src/runtime'

type AsyncComponentElement = ReactElement<
  Record<string, unknown>,
  (props: Record<string, unknown>) => Promise<unknown>
>

async function renderBlock(props: Record<string, unknown>): Promise<string> {
  const element = MarkdownBlockComponent(props as never) as AsyncComponentElement

  return JSON.stringify(await element.type(element.props)).replace(/payload-markdown-[0-9a-f-]{36}/g, 'ID')
}

beforeEach(() => {
  clearPayloadMarkdownSettings()
})

describe('CORE-6: md-params mapping (decision-neutral helper)', () => {
  it('maps the admin field names onto renderer config names', () => {
    expect(
      resolveMarkdownBlockParams({
        config: {
          className: ' extra ',
          enableGutter: true,
          options: { enhancedCodeBlocks: false, showLineNumbers: false, theme: 'github-light' },
          size: 'md',
          variant: 'docs',
          wrapperClassName: '',
        },
        enable: true,
      }),
    ).toEqual({
      className: 'extra',
      code: { enhanced: false, lineNumbers: false, shikiTheme: 'github-light' },
      enableGutter: true,
      size: 'md',
      variant: 'docs',
    })
  })

  it('returns nothing when params are disabled, empty or invalid', () => {
    expect(resolveMarkdownBlockParams(undefined)).toBeUndefined()
    expect(resolveMarkdownBlockParams({ config: { size: 'md' }, enable: false })).toBeUndefined()
    expect(resolveMarkdownBlockParams({ config: { size: 'huge', variant: 'x' }, enable: true })).toBeUndefined()
  })

  it('documents current behaviour: MarkdownBlockComponent ignores stored md-params', async () => {
    const withoutParams = await renderBlock({ blockType: 'vlMdBlock', content: '```js\nconst a = 1\n```' })
    const withParams = await renderBlock({
      blockType: 'vlMdBlock',
      content: '```js\nconst a = 1\n```',
      'md-params': {
        config: { options: { showLineNumbers: false, theme: 'github-light' }, size: 'sm' },
        enable: true,
      },
    })

    expect(withParams).toBe(withoutParams)
    expect(withParams).toContain('md-line-number')
  })
})
