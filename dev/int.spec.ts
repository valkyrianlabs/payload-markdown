import type { Config } from 'payload'

import { beforeEach, describe, expect, it } from 'vitest'

import { payloadMarkdown } from '../src/index.ts'
import {
  clearPayloadMarkdownSettings,
  getPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
  resolveMarkdownFieldDefaults,
} from '../src/runtime'

describe('payloadMarkdown', () => {
  beforeEach(() => {
    clearPayloadMarkdownSettings()
  })

  it('registers plugin settings and applies inferred install behavior for field and block collections', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      collections: [
        {
          slug: 'posts',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
          ],
        },
        {
          slug: 'pages',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'hero',
                  fields: [],
                },
              ],
            },
          ],
        },
      ],
    } as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: true,
        posts: true,
      },
      config: {
        blocks: {
          size: 'md',
          variant: 'docs',
        },
        field: {
          size: 'lg',
          variant: 'blog',
        },
      },
    })

    const result = await plugin(config)

    const posts = result.collections?.find((collection) => collection.slug === 'posts')
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(posts).toBeDefined()
    expect(pages).toBeDefined()

    // posts has no blocks field, so it should get a standalone markdown field by default
    expect(posts?.fields.some((field) => 'name' in field && field.name === 'content')).toBe(true)

    // pages has a blocks field, so it should get the markdown block installed into that blocks field
    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(layoutField).toBeDefined()
    expect(layoutField && 'blocks' in layoutField && Array.isArray(layoutField.blocks)).toBe(true)
    expect(
      layoutField &&
        'blocks' in layoutField &&
        layoutField.blocks?.some((block) => block.slug === 'vlMdBlock'),
    ).toBe(true)

    // pages should not get a standalone markdown field by default because it already has a blocks field
    expect(pages?.fields.some((field) => 'name' in field && field.name === 'content')).toBe(false)

    // registry should be seeded
    const settings = getPayloadMarkdownSettings()

    expect(settings.enabled).toBe(true)
    expect(settings.collections.posts).toBe(true)
    expect(settings.collections.pages).toBe(true)

    // runtime config resolution should respect split field/block config
    expect(resolveMarkdownFieldDefaults('posts')).toMatchObject({
      size: 'lg',
      variant: 'blog',
    })

    expect(resolveMarkdownBlockDefaults('pages')).toMatchObject({
      size: 'md',
      variant: 'docs',
    })
  })

  it('respects explicit install overrides', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      collections: [
        {
          slug: 'pages',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [],
            },
          ],
        },
      ],
    } as unknown as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: {
          fieldName: 'body',
          installField: true,
          installIntoBlocks: false,
        },
      },
    })

    const result = await plugin(config)
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(pages?.fields.some((field) => 'name' in field && field.name === 'body')).toBe(true)

    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(
      layoutField &&
        'blocks' in layoutField &&
        Array.isArray(layoutField.blocks) &&
        layoutField.blocks.some((block) => block.slug === 'vlMdBlock'),
    ).toBe(false)
  })

  it('does not duplicate injected markdown field or markdown block', async () => {
    const config: Config = {
      admin: {} as Config['admin'],
      blocks: [
        {
          slug: 'vlMdBlock',
          fields: [],
        },
      ],
      collections: [
        {
          slug: 'pages',
          fields: [
            {
              name: 'content',
              type: 'textarea',
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'vlMdBlock',
                  fields: [],
                },
              ],
            },
          ],
        },
      ],
    } as unknown as Config

    const plugin = payloadMarkdown({
      collections: {
        pages: {
          installField: true,
          installIntoBlocks: true,
        },
      },
    })

    const result = await plugin(config)
    const pages = result.collections?.find((collection) => collection.slug === 'pages')

    expect(result.blocks?.filter((block) => block.slug === 'vlMdBlock').length).toBe(1)

    expect(
      pages?.fields.filter((field) => 'name' in field && field.name === 'content').length,
    ).toBe(1)

    const layoutField = pages?.fields.find((field) => 'name' in field && field.name === 'layout')

    expect(
      layoutField &&
        'blocks' in layoutField &&
        Array.isArray(layoutField.blocks) &&
        layoutField.blocks.filter((block) => block.slug === 'vlMdBlock').length,
    ).toBe(1)
  })
})
