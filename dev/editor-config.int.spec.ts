import type { Block, Config, Field } from 'payload'

import { beforeEach, describe, expect, it } from 'vitest'

import type { MarkdownRenderConfig } from '../src/types/core'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { lintMarkdownDirectives } from '../src/directives/diagnostics'
import {
  createEditorDirectiveConfig,
  readEditorDirectiveConfig,
} from '../src/editor/directiveConfig'
import { getDirectiveThemeValueCompletionOptions } from '../src/editor/directives/completions'
import { payloadMarkdown } from '../src/index.ts'
import { clearPayloadMarkdownSettings } from '../src/runtime'

const renderConfig: MarkdownRenderConfig = {
  icons: { baseDir: 'tests/fixtures/icons', packs: [{ alias: 'brand', path: 'brand' }] },
  themes: {
    callout: [{ name: 'brand', classes: 'brand-callout bg-brand' }],
    card: { extendDefaults: false, items: [{ name: 'promo', classes: 'promo-card' }] },
  },
}

function findField(fields: Field[] | undefined, name: string): Field | undefined {
  return fields?.find((field) => 'name' in field && field.name === name)
}

function blockContentCustom(block: Block | undefined) {
  return readEditorDirectiveConfig(
    (findField(block?.fields, 'content') as { admin?: { custom?: unknown } } | undefined)?.admin?.custom,
  )
}

beforeEach(() => {
  clearPayloadMarkdownSettings()
})

describe('CORE-8: the editor receives configured themes and icon packs', () => {
  it('serializes theme names (not classes) and icon pack aliases', () => {
    expect(createEditorDirectiveConfig(renderConfig)).toEqual({
      iconPacks: ['brand'],
      themes: {
        callout: [{ name: 'brand', classes: '' }],
        card: { extendDefaults: false, items: [{ name: 'promo', classes: '' }] },
      },
    })
  })

  it('injects scoped editor config into installed fields and blocks', async () => {
    const result = await payloadMarkdown({
      ...renderConfig,
      collections: {
        pages: { themes: { callout: [{ name: 'pages-only', classes: 'x' }] } },
        posts: { field: { admin: { custom: { keep: true } } } },
      },
    })({
      admin: {},
      collections: [
        { slug: 'posts', fields: [] },
        { slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [] }] },
      ],
    } as unknown as Config)

    const posts = result.collections?.find((collection) => collection.slug === 'posts')
    const pages = result.collections?.find((collection) => collection.slug === 'pages')
    const postsContent = findField(posts?.fields, 'content') as { admin?: { custom?: Record<string, unknown> } }
    const pagesLayout = findField(pages?.fields, 'layout') as { blocks: Block[] }

    expect(postsContent.admin?.custom?.keep).toBe(true)
    expect(readEditorDirectiveConfig(postsContent.admin?.custom)?.themes?.callout).toEqual({
      extendDefaults: true,
      items: [{ name: 'brand', classes: '' }],
    })
    expect(blockContentCustom(pagesLayout.blocks[0])?.themes?.callout).toEqual({
      extendDefaults: true,
      items: [
        { name: 'brand', classes: '' },
        { name: 'pages-only', classes: '' },
      ],
    })
    expect(
      blockContentCustom(result.blocks?.find((block) => block.slug === 'vlMdBlock'))?.iconPacks,
    ).toEqual(['brand'])
  })

  it('does not report configured custom themes as unknown', () => {
    const editorConfig = createEditorDirectiveConfig(renderConfig)
    const markdown = ':::callout{theme="brand"}\nx\n:::\n\n:::card[A]{theme="promo"}\nx\n:::'

    expect(lintMarkdownDirectives(markdown)).not.toEqual([])
    expect(lintMarkdownDirectives(markdown, editorConfig)).toEqual([])
  })

  it('names the configured fallback and reports unknown icon packs like the renderer', async () => {
    const editorConfig = createEditorDirectiveConfig(renderConfig)
    const markdown =
      ':::card[A]{theme="missing" icon="@other/x"}\nx\n:::\n\n::button[Go]{href="/x" icon="@nope/y"}'
    const rendered = await compileMarkdown(markdown, renderConfig)
    const editor = lintMarkdownDirectives(markdown, editorConfig).map((diagnostic) => diagnostic.message)

    expect(rendered.warnings).toContain('Unknown theme "missing" on "card". Falling back to "promo".')
    expect(rendered.warnings).toContain('Unknown icon pack "other".')
    expect(rendered.warnings).toContain('Unknown icon pack "nope".')

    for (const warning of rendered.warnings) expect(editor).toContain(warning)
  })

  it('completes configured theme names and icon pack prefixes', () => {
    const editorConfig = createEditorDirectiveConfig(renderConfig)

    expect(
      getDirectiveThemeValueCompletionOptions('callout', 'theme', editorConfig).map((option) => option.label),
    ).toEqual(['soft', 'solid', 'glass', 'brand'])
    expect(
      getDirectiveThemeValueCompletionOptions('card', 'theme', editorConfig).map((option) => option.label),
    ).toEqual(['promo'])
    expect(
      getDirectiveThemeValueCompletionOptions('button', 'icon', editorConfig).map((option) => option.label),
    ).toEqual(['@brand/'])
  })

  it('ignores malformed admin.custom values', () => {
    expect(readEditorDirectiveConfig(undefined)).toBeUndefined()
    expect(readEditorDirectiveConfig({ payloadMarkdown: 'x' })).toBeUndefined()
    expect(readEditorDirectiveConfig({ payloadMarkdown: { iconPacks: ['a', 1] } })).toEqual({
      iconPacks: ['a'],
    })
  })
})
