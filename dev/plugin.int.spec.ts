import type { Config } from 'payload'
import type { ReactElement, ReactNode } from 'react'

import { beforeEach, describe, expect, it } from 'vitest'

import { MarkdownBlockComponent } from '../src/blocks/MarkdownBlock/Component'
import { payloadMarkdown } from '../src/index.ts'
import {
  clearPayloadMarkdownSettings,
  maybeGetPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
} from '../src/runtime'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }

  return value
}

function makeConfig(): Config {
  return {
    admin: {},
    blocks: [{ slug: 'cta', fields: [] }],
    collections: [
      { slug: 'posts', fields: [{ name: 'title', type: 'text' }] },
      {
        slug: 'pages',
        fields: [
          {
            type: 'tabs',
            tabs: [
              {
                fields: [{ name: 'layout', type: 'blocks', blocks: [{ slug: 'hero', fields: [] }] }],
                label: 'Content',
              },
            ],
          },
          { name: 'sidebar', type: 'group', fields: [{ name: 'extra', type: 'blocks', blocks: [] }] },
        ],
      },
    ],
  } as unknown as Config
}

beforeEach(() => {
  clearPayloadMarkdownSettings()
})

describe('CORE-18: plugin configuration hygiene', () => {
  it('does not mutate the caller config, collections or fields', async () => {
    const incoming = deepFreeze(makeConfig())
    const snapshot = JSON.stringify(incoming)
    const result = await payloadMarkdown({ collections: { pages: true, posts: true } })(incoming)

    expect(JSON.stringify(incoming)).toBe(snapshot)
    expect(result.blocks?.map((block) => block.slug)).toEqual(['cta', 'vlMdBlock'])

    const posts = result.collections?.find((collection) => collection.slug === 'posts')
    const pages = result.collections?.find((collection) => collection.slug === 'pages')
    const serialized = JSON.stringify(pages)

    expect(posts?.fields.map((field) => ('name' in field ? field.name : field.type))).toEqual([
      'title',
      'content',
    ])
    expect(serialized.match(/"slug":"vlMdBlock"/g)).toHaveLength(2)
  })

  it('clears previous settings when a later configuration disables the plugin', async () => {
    await payloadMarkdown({ config: { className: 'tenant-a' } })(makeConfig())
    expect(maybeGetPayloadMarkdownSettings()?.config).toEqual({ className: 'tenant-a' })

    const result = await payloadMarkdown({ enabled: false })(makeConfig())

    expect(maybeGetPayloadMarkdownSettings()).toBeNull()
    expect(result.blocks?.map((block) => block.slug)).toEqual(['cta'])
  })

  it('merges block default class names once', async () => {
    await payloadMarkdown({
      collections: { pages: { config: { blocks: { className: 'pages-md' } } } },
      config: { blocks: { className: 'global-md' } },
    })(makeConfig())

    expect(resolveMarkdownBlockDefaults('pages')?.className).toBe('global-md pages-md')

    const element = MarkdownBlockComponent({
      blockType: 'vlMdBlock',
      collectionSlug: 'pages',
      content: '# Hi',
    }) as ReactElement<Record<string, unknown>, (props: Record<string, unknown>) => Promise<ReactNode>>
    const rendered = JSON.stringify(await element.type(element.props))
    const classNames = [...rendered.matchAll(/"className":"([^"]*)"/g)].map((match) => match[1])
    const articleClass = classNames.find((value) => value.includes('global-md')) ?? ''

    expect(articleClass.match(/global-md/g)).toHaveLength(1)
    expect(articleClass.match(/pages-md/g)).toHaveLength(1)
  })
})
