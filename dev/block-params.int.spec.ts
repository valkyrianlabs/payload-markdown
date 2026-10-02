import type { ReactElement, ReactNode } from 'react'

import { beforeEach, describe, expect, it } from 'vitest'

import { MarkdownBlockComponent } from '../src/blocks/MarkdownBlock/Component'
import {
  resolveEffectiveMarkdownBlockParams,
  resolveMarkdownBlockParams,
} from '../src/blocks/MarkdownBlock/params'
import {
  applyMarkdownOverrides,
  clearPayloadMarkdownSettings,
  createPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
} from '../src/runtime'

type AsyncComponentElement = ReactElement<
  Record<string, unknown>,
  (props: Record<string, unknown>) => Promise<ReactNode>
>

const code = '```js\nconst a = 1\n```'

// Global block defaults plus a collection layer, like a real plugin config.
const settings = createPayloadMarkdownSettings({
  collections: {
    pages: {
      code: { lineNumbers: false },
      config: { blocks: { mutedHeadings: true, size: 'sm', wrapperClassName: 'pages-wrap' } },
    },
  },
  config: { blocks: { className: 'global-md', variant: 'docs' } },
})

async function renderBlock(params?: Record<string, unknown>): Promise<string> {
  const element = MarkdownBlockComponent({
    blockType: 'vlMdBlock',
    collectionSlug: 'pages',
    content: code,
    ...(params ? { 'md-params': params } : {}),
    settings,
  } as never) as AsyncComponentElement

  return JSON.stringify(await element.type(element.props)).replace(/payload-markdown-[0-9a-f-]{36}/g, 'ID')
}

beforeEach(() => {
  clearPayloadMarkdownSettings()
})

describe('per-block md-params', () => {
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

  it('pre-fills with what the block renders by default (global, collection, then built-ins)', () => {
    expect(resolveEffectiveMarkdownBlockParams(resolveMarkdownBlockDefaults('pages', settings))).toEqual({
      className: 'global-md',
      columnClassName: '',
      enableGutter: false,
      fullBleedCode: false,
      mutedHeadings: true,
      options: { enhancedCodeBlocks: true, showLineNumbers: false, theme: 'github-dark' },
      sectionClassName: '',
      size: 'sm',
      variant: 'docs',
      wrapperClassName: 'pages-wrap',
    })
  })

  it('renders an enabled block with its pre-filled values exactly like a disabled block (no drift)', async () => {
    const effective = resolveEffectiveMarkdownBlockParams(resolveMarkdownBlockDefaults('pages', settings))

    expect(await renderBlock({ config: effective, enable: true })).toBe(await renderBlock())
    expect(await renderBlock({ config: { variant: 'compact' }, enable: false })).toBe(await renderBlock())
  })

  it('gives set block values the highest precedence and lets empty ones inherit', async () => {
    const inherited = await renderBlock()
    const overridden = await renderBlock({
      config: {
        className: '',
        options: { showLineNumbers: true, theme: null },
        size: null,
        variant: 'compact',
        wrapperClassName: 'block-wrap',
      },
      enable: true,
    })

    // inherited from the collection and global layers
    expect(inherited).toContain('pages-wrap')
    expect(inherited).toContain('global-md')
    expect(inherited).not.toContain('md-line-number')

    // block values win; a block class replaces the inherited class instead of appending to it
    expect(overridden).toContain('block-wrap')
    expect(overridden).not.toContain('pages-wrap')
    expect(overridden).toContain('md-line-number')
    expect(overridden).not.toBe(inherited)

    // empty or unset block values keep the inherited settings
    expect(overridden).toContain('global-md')
    expect(overridden).toContain('prose-sm')
  })

  it('never wipes inherited settings with empty or undefined override values', () => {
    const base = {
      className: 'a',
      code: { lineNumbers: false, shikiTheme: 'nord' },
      size: 'sm' as const,
      wrapperClassName: 'w',
    }

    expect(
      applyMarkdownOverrides(base, { className: '  ', code: { lineNumbers: undefined }, size: undefined }),
    ).toEqual(base)
    expect(applyMarkdownOverrides(base, { code: { lineNumbers: true }, wrapperClassName: 'x' })).toEqual({
      ...base,
      code: { lineNumbers: true, shikiTheme: 'nord' },
      wrapperClassName: 'x',
    })
  })
})
