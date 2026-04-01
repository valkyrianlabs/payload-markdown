import type { Config } from 'payload'

import { describe, expect, test } from 'vitest'

import { payloadMarkdown } from '../src/index.ts'

describe('payload-markdown plugin', () => {
  test('adds markdown block globally', async () => {
    const config = await payloadMarkdown({
      enabled: true,
    })({
      collections: [],
    } as unknown as Config)

    const block = config.blocks?.find((b) => b.slug === '@valkyrianlabs/markdown-block')

    expect(block).toBeDefined()
  })

  test('injects markdown field into collection', async () => {
    const baseConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
      ],
    } as unknown as Config

    const config = await payloadMarkdown({
      collections: {
        posts: true,
      },
      enabled: true,
    })(baseConfig)

    const collection = config.collections?.find((c) => c.slug === 'posts')

    const field = collection?.fields.find((f) => 'name' in f && f.name === 'content')

    expect(field).toBeDefined()
  })

  test('respects custom field name', async () => {
    const baseConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
      ],
    } as unknown as Config

    const config = await payloadMarkdown({
      collections: {
        posts: {
          fieldName: 'markdownBody',
        },
      },
      enabled: true,
    })(baseConfig)

    const collection = config.collections?.find((c) => c.slug === 'posts')

    const field = collection?.fields.find((f) => 'name' in f && f.name === 'markdownBody')

    expect(field).toBeDefined()
  })
})
