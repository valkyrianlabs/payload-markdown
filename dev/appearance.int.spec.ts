import type { Payload, PayloadRequest } from 'payload'
import type { ReactElement } from 'react'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { buildConfig, createLocalReq, createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { deleteMarkdownPalette, listMarkdownPalettes, saveMarkdownPalette } from '../src/agent/palettes'
import { invalidateAppearancePalettes, loadAppearancePalettes, primeAppearancePalettes } from '../src/appearance/runtime'
import { MarkdownRenderer } from '../src/components/MarkdownRenderer/Component'
import { MarkdownAgentError, validateMarkdown, withPayloadMarkdownMcp } from '../src/exports/mcp'
import { payloadMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render/renderMarkdown'

const EDITOR_KEY = 'payload-markdown-appearance-editor-key-0123456789'
const READER_KEY = 'payload-markdown-appearance-reader-key-0123456789'
const SLUG = 'markdown-appearance'

let payload: Payload
let req: PayloadRequest

beforeAll(async () => {
  const config = await buildConfig({
    admin: { user: 'users' },
    collections: [
      { slug: 'users', auth: true, fields: [] },
      { slug: 'posts', fields: [{ name: 'title', type: 'text' }] },
    ],
    db: sqliteAdapter({ client: { url: ':memory:' } }),
    plugins: [
      payloadMarkdown({ appearance: true, collections: { posts: true }, palettes: [{ name: 'brand', color: '#123456' }] }),
      mcpPlugin(
        withPayloadMarkdownMcp({
          collections: { posts: { enabled: { find: true, update: true } } },
          globals: { [SLUG]: { enabled: { find: true, update: true } } },
        }),
      ),
    ],
    secret: 'payload-markdown-appearance-test-secret',
    telemetry: false,
    // Payload spawns `generate:types` on init outside production; with this in-memory
    // config it cannot find a config file and never exits.
    typescript: { autoGenerate: false },
  })

  payload = await getPayload({ config, importMap: {} })

  const user = await payload.create({ collection: 'users', data: { email: 'palettes@example.com', password: 'test' } })
  req = await createLocalReq({ user: { ...user, collection: 'users' } as never }, payload)

  for (const [apiKey, update] of [
    [EDITOR_KEY, true],
    [READER_KEY, false],
  ] as const)
    await payload.create({
      collection: 'payload-mcp-api-keys' as never,
      data: {
        apiKey,
        enableAPIKey: true,
        label: update ? 'palette editor' : 'palette reader',
        markdownAppearance: { find: true, update },
        posts: { find: true, update: true },
      } as never,
      overrideAccess: false,
      user: { ...user, collection: 'users' } as never,
    })
}, 60_000)

afterAll(async () => {
  await payload?.destroy?.()
})

async function expectAgentError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  )

  expect(error).toBeInstanceOf(MarkdownAgentError)
  expect((error as MarkdownAgentError).code).toBe(code)
}

/** HTML a MarkdownRenderer element renders. */
async function renderedHtml(markdown: string): Promise<string> {
  const element = (await MarkdownRenderer({ markdown, settings: payload })) as ReactElement<{ children: unknown[] }>
  const tag = element.props.children[2] as ReactElement<{ dangerouslySetInnerHTML: { __html: string } }>

  return tag.props.dangerouslySetInnerHTML.__html
}

describe('Markdown Appearance global', () => {
  it('is added by the appearance option', () => {
    const global = payload.config.globals.find((entry) => entry.slug === SLUG)

    expect(global?.label).toBe('Markdown Appearance')
    expect(global?.fields.map((field) => 'name' in field && field.name)).toContain('palettes')
  })

  it('validates names, colours and uniqueness on save', async () => {
    await expect(
      payload.updateGlobal({ slug: SLUG as never, data: { palettes: [{ name: 'Bad Name' }] } as never }),
    ).rejects.toThrow()
    await expect(
      payload.updateGlobal({ slug: SLUG as never, data: { palettes: [{ name: 'x', color: 'url(evil)' }] } as never }),
    ).rejects.toThrow()
    await expect(
      payload.updateGlobal({ slug: SLUG as never, data: { palettes: [{ name: 'x' }, { name: 'x' }] } as never }),
    ).rejects.toThrow()
  })

  it('denies anonymous reads and updates by default', async () => {
    await expect(payload.findGlobal({ slug: SLUG as never, overrideAccess: false })).rejects.toThrow()
  })
})

describe('runtime palettes', () => {
  it('load once per cache lifetime, not per render', async () => {
    invalidateAppearancePalettes()
    const spy = vi.spyOn(payload, 'findGlobal')

    await Promise.all([loadAppearancePalettes(payload), loadAppearancePalettes(payload), loadAppearancePalettes(payload)])
    await loadAppearancePalettes(payload)

    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('render the new colours after a save, without a rebuild', async () => {
    const markdown = ':::card[Linux]{icon="@x/y palette=debian"}\nBody.\n:::'

    await saveMarkdownPalette({ palette: { name: 'debian', color: '#a80030' }, req })
    const before = await renderedHtml(':::card[Linux]{palette="debian"}\nBody.\n:::')

    await saveMarkdownPalette({ palette: { name: 'debian', background: '#fce7ee', color: '#c70036' }, req })
    const after = await renderedHtml(':::card[Linux]{palette="debian"}\nBody.\n:::')

    expect(before).not.toContain('--pmd-surface:')
    expect(after).toContain('--pmd-surface:#fce7ee')
    expect((await validateMarkdown(markdown, { payload })).diagnostics.map((d) => d.code)).not.toContain('unknown-palette')
  })

  it('keep serving the last palettes loaded through a read error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    // The last good load survives an invalidation and is served while the database errors.
    primeAppearancePalettes([{ name: 'kept', color: '#123456' }])
    invalidateAppearancePalettes()
    expect(await loadAppearancePalettes({ findGlobal: () => Promise.reject(new Error('connection reset')) })).toEqual([
      { name: 'kept', color: '#123456' },
    ])
    warn.mockRestore()
    invalidateAppearancePalettes()
  })

  it('load admin palettes in headless renderMarkdown when settings is the Payload instance', async () => {
    await saveMarkdownPalette({ palette: { name: 'headless', color: '#0f766e' }, req })
    const result = await renderMarkdown(':::card[A]{icon="@x/y palette=headless"}\nx\n:::', { settings: payload })

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).not.toContain('unknown-palette')
  })

  it('warn once while the global cannot be read, without throwing', async () => {
    invalidateAppearancePalettes()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const broken = { findGlobal: () => Promise.reject(new Error('no such table')) }
    const first = await loadAppearancePalettes(broken)

    invalidateAppearancePalettes()
    expect(await loadAppearancePalettes(broken)).toEqual(first)
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
    invalidateAppearancePalettes()
  })
})

describe('agent palette operations', () => {
  it('list built-in, configured and admin palettes with their source', async () => {
    await saveMarkdownPalette({ palette: { name: 'ubuntu', color: '#e95420', label: 'Ubuntu' }, req })
    const listing = await listMarkdownPalettes({ req })
    const source = (name: string) => listing.palettes.find((palette) => palette.name === name)?.source

    expect(listing.appearance).toEqual({ slug: SLUG, enabled: true, readable: true })
    expect([source('ubuntu'), source('brand'), source('red')]).toEqual(['admin', 'config', 'built-in'])
    expect(listing.usage.join(' ')).toContain('palette=')
  })

  it('list built-in and configured palettes when the global cannot be read', async () => {
    const failing = Object.create(req) as PayloadRequest
    failing.payload = Object.create(payload, {
      findGlobal: { value: () => Promise.reject(new Error('no such table')) },
    }) as Payload

    const listing = await listMarkdownPalettes({ req: failing })

    expect(listing.appearance).toMatchObject({ enabled: true, readable: false })
    expect(listing.palettes.map((palette) => palette.name)).toEqual(expect.arrayContaining(['brand', 'red']))
  })

  it('reject invalid palettes before saving anything', async () => {
    await expectAgentError(saveMarkdownPalette({ palette: { name: 'evil', color: 'red;}*{color:red' }, req }), 'invalid_palette')
    expect((await listMarkdownPalettes({ req })).palettes.some((palette) => palette.name === 'evil')).toBe(false)
  })

  it('rename and delete admin palettes; markdown using the old name reports it', async () => {
    await saveMarkdownPalette({ palette: { name: 'apple', color: '#555555' }, req })
    await saveMarkdownPalette({ palette: { name: 'apple-silver', color: '#555555', dark: { color: '#d4d4d8' } }, previousName: 'apple', req })

    const stale = await validateMarkdown(':::card[macOS]{palette="apple"}\nx\n:::', { payload })
    expect(stale.diagnostics.map((diagnostic) => diagnostic.code)).toContain('unknown-palette')

    await deleteMarkdownPalette({ name: 'apple-silver', req })
    await expectAgentError(deleteMarkdownPalette({ name: 'apple-silver', req }), 'not_found')
    await expectAgentError(deleteMarkdownPalette({ name: 'brand', req }), 'not_found')
  })
})

describe('MCP palette tools', () => {
  const connect = async (apiKey: string) => {
    const endpoint = (method: string) =>
      payload.config.endpoints.find((entry) => entry.path === '/mcp' && entry.method === method)
    const client = new Client({ name: 'payload-markdown-appearance-test', version: '1.0.0' })

    await client.connect(
      new StreamableHTTPClientTransport(new URL('http://localhost/api/mcp'), {
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
          const request = new Request(input, init)
          const handler = endpoint(request.method.toLowerCase())?.handler

          return handler ? handler(await createPayloadRequest({ config: payload.config, request })) : new Response(null, { status: 405 })
        },
        requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
      }),
    )

    return async (name: string, args: Record<string, unknown>) => {
      const result = (await client.callTool({ name, arguments: args })) as { content: Array<{ text: string }>; isError?: boolean }

      return { isError: Boolean(result.isError), text: result.content[0].text }
    }
  }

  it('let a key with update permission create a palette that markdown can use at once', async () => {
    const call = await connect(EDITOR_KEY)
    const saved = await call('markdownPaletteSave', {
      palette: { name: 'agent-red', color: '#c70036', dark: { color: '#ff6b8b' }, label: 'Agent red' },
    })

    expect(saved.isError, saved.text).toBe(false)
    expect(JSON.parse(saved.text)).toMatchObject({ created: true, palette: { name: 'agent-red' } })

    const markdown = ':::card[Linux]{icon="@x/debian palette=agent-red, @x/ubuntu palette=ubuntu"}\nBoth.\n:::'
    const validation = JSON.parse((await call('markdownValidate', { markdown })).text) as { diagnostics: Array<{ code?: string }> }

    expect(validation.diagnostics.map((diagnostic) => diagnostic.code)).not.toContain('unknown-palette')
    expect((await call('markdownGuide', {})).text).toContain('`agent-red` (Agent red): #c70036 / dark #ff6b8b')
    expect(JSON.parse((await call('markdownPalettes', {})).text).palettes).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'agent-red', source: 'admin' })]),
    )
  })

  it('refuse writes for a key without update permission on the global', async () => {
    const call = await connect(READER_KEY)
    const denied = await call('markdownPaletteSave', { palette: { name: 'nope', color: '#000000' } })

    expect(denied.isError).toBe(true)
    expect(JSON.parse(denied.text).error).toBe('forbidden')
    expect((await call('markdownPalettes', {})).isError).toBe(false)
  })
})
