import type { Payload, PayloadRequest } from 'payload'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { buildConfig, createLocalReq, createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  getMarkdownGuide,
  MARKDOWN_GUIDE_EXAMPLES,
  MarkdownAgentError,
  publishMarkdown,
  readMarkdownDocuments,
  validateMarkdown,
  withPayloadMarkdownMcp,
  writeMarkdown,
} from '../src/exports/mcp'
import { markdownField, payloadMarkdown } from '../src/index'

const API_KEY = 'payload-markdown-mcp-test-key-0123456789abcdef'

let payload: Payload
let req: PayloadRequest
let homeId: number | string
let postId: number | string

async function expectAgentError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  )

  expect(error).toBeInstanceOf(MarkdownAgentError)
  expect((error as MarkdownAgentError).code).toBe(code)

  return error as MarkdownAgentError
}

beforeAll(async () => {
  const config = await buildConfig({
    admin: { user: 'users' },
    collections: [
      { slug: 'users', auth: true, fields: [] },
      {
        slug: 'pages',
        admin: { useAsTitle: 'title' },
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'slug', type: 'text' },
          {
            name: 'layout',
            type: 'blocks',
            blocks: [{ slug: 'hero', fields: [{ name: 'heading', type: 'text' }] }],
          },
        ],
        versions: { drafts: true },
      },
      {
        slug: 'posts',
        admin: { useAsTitle: 'title' },
        fields: [{ name: 'title', type: 'text' }],
      },
      {
        // Blocks from config.blocks (blockReferences), not installed by payloadMarkdown().
        slug: 'docs',
        fields: [{ name: 'body', type: 'blocks', blockReferences: ['vlMdBlock'], blocks: [] }],
      },
    ],
    db: sqliteAdapter({ client: { url: ':memory:' } }),
    globals: [
      {
        slug: 'footer',
        fields: [{ name: 'about', type: 'group', fields: [markdownField({ name: 'body' })] }],
        versions: { drafts: true },
      },
    ],
    plugins: [
      payloadMarkdown({ collections: { pages: true, posts: true } }),
      mcpPlugin(
        withPayloadMarkdownMcp({
          collections: {
            pages: { enabled: { find: true, update: true } },
            posts: { enabled: { find: true, update: true } },
          },
          globals: { footer: { enabled: { find: true, update: true } } },
        }),
      ),
    ],
    secret: 'payload-markdown-mcp-test-secret',
    telemetry: false,
  })

  payload = await getPayload({ config, importMap: {} })

  const user = await payload.create({
    collection: 'users',
    data: { email: 'agent@example.com', password: 'test' },
  })

  req = await createLocalReq({ user: { ...user, collection: 'users' } as never }, payload)

  const home = await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      _status: 'published',
      layout: [
        { blockName: 'Intro', blockType: 'vlMdBlock', content: '# Welcome\n\nOld intro.' },
        { blockType: 'hero', heading: 'Keep me' },
        { blockName: 'Features', blockType: 'vlMdBlock', content: '## Features\n\n- One' },
      ],
      title: 'Home',
    } as never,
  })
  homeId = home.id

  const post = await payload.create({ collection: 'posts', data: { content: '# Post', title: 'First post' } as never })
  postId = post.id

  // pages: read/write; posts: read only; footer: read/write.
  await payload.create({
    collection: 'payload-mcp-api-keys' as never,
    data: {
      apiKey: API_KEY,
      enableAPIKey: true,
      footer: { find: true, update: true },
      label: 'test agent',
      pages: { find: true, update: true },
      posts: { find: true, update: false },
    } as never,
    overrideAccess: false,
    user: { ...user, collection: 'users' } as never,
  })
}, 60_000)

afterAll(async () => {
  await payload?.destroy()
})

describe('readMarkdownDocuments', () => {
  it('finds a document by search and lists markdown blocks with stable refs', async () => {
    const { docs, totalDocs } = await readMarkdownDocuments({ collection: 'pages', req, search: 'Home' })

    expect(totalDocs).toBe(1)
    const [home] = docs

    expect(home.title).toBe('Home')
    expect(home.drafts).toBe(true)
    expect(home.adminUrl).toBe(`/admin/collections/pages/${homeId}`)
    expect(home.targets.map((target) => [target.label, target.scope, target.path])).toEqual([
      ['Intro', 'blocks', 'layout.0.content'],
      ['Features', 'blocks', 'layout.2.content'],
    ])
    // Markdown blocks are addressed by their block id, not by index.
    expect(home.targets[0].ref).toBe(home.targets[0].block?.id)
    expect(home.targets[0].markdown).toBe('# Welcome\n\nOld intro.')
    expect(home.blocks).toHaveLength(1)
    expect(home.blocks[0]).toMatchObject({ acceptsMarkdownBlocks: true, path: 'layout' })
    expect(home.blocks[0].rows.map((row) => row.type)).toEqual(['vlMdBlock', 'hero', 'vlMdBlock'])
  })

  it('addresses markdown fields by path, in collections and nested in globals', async () => {
    const post = await readMarkdownDocuments({ id: postId, collection: 'posts', req })
    expect(post.docs[0].targets).toEqual([
      expect.objectContaining({ chars: 6, markdown: '# Post', path: 'content', ref: 'content', scope: 'field' }),
    ])
    expect(post.docs[0].drafts).toBe(false)

    const footer = await readMarkdownDocuments({ global: 'footer', req })
    expect(footer.docs[0].targets.map((target) => target.ref)).toEqual(['about.body'])
    expect(footer.docs[0].adminUrl).toBe('/admin/globals/footer')
  })
})

describe('blockReferences', () => {
  it('finds and inserts markdown blocks referenced from config.blocks', async () => {
    const doc = await payload.create({
      collection: 'docs',
      data: { body: [{ blockType: 'vlMdBlock', content: '# Ref' }] } as never,
    })

    const [read] = (await readMarkdownDocuments({ id: doc.id, collection: 'docs', req })).docs
    expect(read.targets).toEqual([expect.objectContaining({ markdown: '# Ref', path: 'body.0.content', scope: 'blocks' })])
    expect(read.blocks[0].acceptsMarkdownBlocks).toBe(true)

    await writeMarkdown({
      id: doc.id,
      collection: 'docs',
      edits: [{ action: 'insert', field: 'body', markdown: '## Added' }],
      req,
    })
    const [after] = (await readMarkdownDocuments({ id: doc.id, collection: 'docs', req })).docs
    expect(after.targets.map((target) => target.markdown)).toEqual(['# Ref', '## Added'])
  })
})

describe('validateMarkdown', () => {
  it('reports what the site renderer would flag', async () => {
    const clean = await validateMarkdown(':::callout[Tip]{variant="tip"}\nBody\n:::', { payload })
    expect(clean.ok).toBe(true)

    const theme = await validateMarkdown(':::callout{theme="neon"}\nBody\n:::', { payload })
    expect(theme.ok).toBe(false)
    expect(theme.counts.warning).toBeGreaterThan(0)
    expect(theme.diagnostics[0]).toMatchObject({ severity: 'warning' })

    // Unloaded code languages fall back to plain text: informational, still ok.
    const code = await validateMarkdown('```bash\nls\n```', { payload })
    expect(code.ok).toBe(true)
    expect(code.counts.info).toBe(1)
  })

  it('validates every guide example cleanly', async () => {
    for (const example of MARKDOWN_GUIDE_EXAMPLES) {
      const result = await validateMarkdown(example.markdown, { payload, scope: 'blocks' })
      expect(result.diagnostics, example.title).toEqual([])
      expect(result.ok, example.title).toBe(true)
    }
  })
})

describe('writeMarkdown', () => {
  it('saves block replacements as a draft and leaves other blocks and the published version alone', async () => {
    const [home] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs
    const intro = home.targets[0]

    const result = await writeMarkdown({
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'replace', markdown: '# Welcome\n\n:::callout[New]{variant="tip"}\nFresh intro.\n:::', target: intro.ref }],
      ifUpdatedAt: home.updatedAt,
      req,
    })

    expect(result).toMatchObject({ saved: true, status: 'draft' })
    expect(result.edits[0].validation?.ok).toBe(true)

    const draft = await payload.findByID({ id: homeId, collection: 'pages', draft: true })
    const published = await payload.findByID({ id: homeId, collection: 'pages' })
    const draftLayout = draft.layout as Array<Record<string, unknown>>

    expect(draftLayout[0].content).toContain('Fresh intro.')
    expect(draftLayout[0].id).toBe(intro.ref)
    expect(draftLayout[1]).toMatchObject({ blockType: 'hero', heading: 'Keep me' })
    expect(draftLayout[2].content).toBe('## Features\n\n- One')
    expect((published.layout as Array<Record<string, unknown>>)[0].content).toBe('# Welcome\n\nOld intro.')
  })

  it('refuses edits that do not validate and saves nothing', async () => {
    const [home] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs

    const error = await expectAgentError(
      writeMarkdown({
        id: homeId,
        collection: 'pages',
        edits: [
          { action: 'replace', markdown: '## Features\n\n- Two', target: home.targets[1].ref },
          { action: 'replace', markdown: ':::callout{theme="neon"}\nNope\n:::', target: home.targets[0].ref },
        ],
        req,
      }),
      'validation_failed',
    )
    expect(JSON.stringify(error.details)).toContain('neon')

    const draft = await payload.findByID({ id: homeId, collection: 'pages', draft: true })
    expect((draft.layout as Array<Record<string, unknown>>)[2].content).toBe('## Features\n\n- One')
  })

  it('saves despite warnings only with allowWarnings, and dry runs save nothing', async () => {
    const [home] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs
    const edit = { action: 'replace' as const, markdown: ':::callout{theme="neon"}\nAccepted\n:::', target: home.targets[1].ref }

    const dry = await writeMarkdown({ id: homeId, collection: 'pages', dryRun: true, edits: [edit], req })
    expect(dry.saved).toBe(false)
    expect(dry.edits[0].validation?.counts.warning).toBeGreaterThan(0)

    const saved = await writeMarkdown({ id: homeId, allowWarnings: true, collection: 'pages', edits: [edit], req })
    expect(saved.saved).toBe(true)

    // Restore a clean block for the publish test.
    await writeMarkdown({
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'replace', markdown: '## Features\n\n- One\n- Two', target: home.targets[1].ref }],
      req,
    })
  })

  it('inserts and removes markdown blocks around other block types', async () => {
    const [home] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs
    const heroId = home.blocks[0].rows[1].id

    const inserted = await writeMarkdown({
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'insert', after: heroId, blockName: 'FAQ', field: 'layout', markdown: '## FAQ\n\nAsk away.' }],
      req,
    })
    expect(inserted.edits[0].blockId).toEqual(expect.any(String))

    const [withFaq] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs
    expect(withFaq.blocks[0].rows.map((row) => row.name ?? row.type)).toEqual(['Intro', 'hero', 'FAQ', 'Features'])

    await writeMarkdown({
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'remove', target: inserted.edits[0].blockId as string }],
      req,
    })

    const [after] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs
    expect(after.blocks[0].rows.map((row) => row.name ?? row.type)).toEqual(['Intro', 'hero', 'Features'])
  })

  it('refuses stale writes, unknown refs, field removals and publish on collections without drafts', async () => {
    const [home] = (await readMarkdownDocuments({ id: homeId, collection: 'pages', req })).docs

    await expectAgentError(
      writeMarkdown({
        id: homeId,
        collection: 'pages',
        edits: [{ action: 'replace', markdown: '# x', target: home.targets[0].ref }],
        ifUpdatedAt: '2000-01-01T00:00:00.000Z',
        req,
      }),
      'conflict',
    )
    await expectAgentError(
      writeMarkdown({ id: homeId, collection: 'pages', edits: [{ action: 'replace', markdown: '# x', target: 'nope' }], req }),
      'invalid_edit',
    )
    await expectAgentError(
      writeMarkdown({ id: postId, collection: 'posts', edits: [{ action: 'remove', target: 'content' }], req }),
      'invalid_edit',
    )
    await expectAgentError(
      writeMarkdown({ id: postId, collection: 'posts', edits: [{ action: 'replace', markdown: '# x', target: 'content' }], publish: true, req }),
      'no_drafts',
    )
  })

  it('writes live to collections without drafts and to nested markdown fields in globals', async () => {
    const post = await writeMarkdown({
      id: postId,
      collection: 'posts',
      edits: [{ action: 'replace', markdown: '# Post\n\nUpdated.', target: 'content' }],
      req,
    })
    expect(post.status).toBe('live')
    expect((await payload.findByID({ id: postId, collection: 'posts' })).content).toBe('# Post\n\nUpdated.')

    const footer = await writeMarkdown({
      edits: [{ action: 'replace', markdown: 'Made with **Payload**.', target: 'about.body' }],
      global: 'footer',
      req,
    })
    expect(footer.status).toBe('draft')
    expect(((await payload.findGlobal({ slug: 'footer', draft: true })) as { about: { body: string } }).about.body).toBe(
      'Made with **Payload**.',
    )
  })
})

describe('publishMarkdown', () => {
  it('publishes the latest draft after validating it', async () => {
    const result = await publishMarkdown({ id: homeId, collection: 'pages', req })
    expect(result).toMatchObject({ saved: true, status: 'published' })

    const published = await payload.findByID({ id: homeId, collection: 'pages' })
    expect((published.layout as Array<Record<string, unknown>>)[0].content).toContain('Fresh intro.')
    expect(published._status).toBe('published')
  })
})

describe('access', () => {
  it('requires a user and, in mcpApiKey mode, the API key permissions on the request', async () => {
    const anonymous = await createLocalReq({}, payload)
    await expectAgentError(readMarkdownDocuments({ collection: 'pages', req: anonymous, search: 'Home' }), 'forbidden')
    await expectAgentError(readMarkdownDocuments({ access: 'mcpApiKey', collection: 'pages', req, search: 'Home' }), 'forbidden')
  })
})

describe('getMarkdownGuide', () => {
  it('describes where markdown lives and the site settings', () => {
    const guide = getMarkdownGuide({ payload })

    expect(guide).toContain('## Workflow')
    expect(guide).toMatch(/`pages` \(collection, drafts, title field `title`\): `layout\[\]` \(markdown blocks\)/)
    expect(guide).toMatch(/`posts` \(collection, no drafts: writes go live.*`content` \(markdown field\)/)
    expect(guide).toMatch(/`footer` \(global, drafts\): `about.body` \(markdown field\)/)
    expect(guide).toContain('- callout: `soft`, `solid`, `glass`')
    expect(guide).toContain('No icon packs are configured')
    expect(guide).toContain('`:::callout[label]{…}`')
  })
})

describe('MCP protocol', () => {
  let client: Client

  beforeAll(async () => {
    const endpoint = (method: string) =>
      payload.config.endpoints.find((entry) => entry.path === '/mcp' && entry.method === method)

    // Route the official MCP client straight into plugin-mcp's endpoint handler.
    const fetchViaPayload = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      const payloadRequest = await createPayloadRequest({ config: payload.config, request })
      const handler = endpoint(request.method.toLowerCase())?.handler

      if (!handler) return new Response(null, { status: 405 })
      return handler(payloadRequest)
    }

    client = new Client({ name: 'payload-markdown-test', version: '1.0.0' })
    await client.connect(
      new StreamableHTTPClientTransport(new URL('http://localhost/api/mcp'), {
        fetch: fetchViaPayload,
        requestInit: { headers: { Authorization: `Bearer ${API_KEY}` } },
      }),
    )
  })

  afterAll(async () => {
    await client?.close()
  })

  const call = async (name: string, args: Record<string, unknown>) => {
    const result = (await client.callTool({ name, arguments: args })) as {
      content: Array<{ text: string }>
      isError?: boolean
    }

    return { isError: Boolean(result.isError), text: result.content[0].text }
  }

  it('lists the markdown tools and the edit prompt', async () => {
    const { tools } = await client.listTools()
    const names = tools.map((tool) => tool.name)

    expect(names).toEqual(
      expect.arrayContaining(['markdownGuide', 'markdownValidate', 'markdownRead', 'markdownWrite', 'markdownPublish']),
    )

    const write = tools.find((tool) => tool.name === 'markdownWrite')
    expect(write?.inputSchema.required).toEqual(['edits'])

    const { prompts } = await client.listPrompts()
    expect(prompts.map((prompt) => prompt.name)).toContain('markdownEditDocument')
  })

  it('serves a guide filtered by the API key and reads documents', async () => {
    const guide = await call('markdownGuide', {})
    expect(guide.text).toMatch(/`pages` \(collection, drafts, title field `title`, read\/write\)/)
    expect(guide.text).toMatch(/`posts` \(collection, .*read only\)/)

    const read = await call('markdownRead', { collection: 'pages', search: 'home' })
    expect(read.isError).toBe(false)
    expect(JSON.parse(read.text).docs[0].title).toBe('Home')
  })

  it('writes through MCP and enforces the key permissions', async () => {
    const [home] = JSON.parse((await call('markdownRead', { id: homeId, collection: 'pages' })).text).docs
    const write = await call('markdownWrite', {
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'replace', markdown: '## Features\n\n- Written over MCP', target: home.targets[1].ref }],
      ifUpdatedAt: home.updatedAt,
    })

    expect(write.isError).toBe(false)
    expect(JSON.parse(write.text)).toMatchObject({ saved: true, status: 'draft' })

    const denied = await call('markdownWrite', {
      id: postId,
      collection: 'posts',
      edits: [{ action: 'replace', markdown: '# Nope', target: 'content' }],
    })
    expect(denied.isError).toBe(true)
    expect(JSON.parse(denied.text)).toMatchObject({ error: 'forbidden' })

    const invalid = await call('markdownWrite', {
      id: homeId,
      collection: 'pages',
      edits: [{ action: 'replace', markdown: ':::callout{theme="neon"}\nx\n:::', target: home.targets[1].ref }],
    })
    expect(JSON.parse(invalid.text)).toMatchObject({ error: 'validation_failed' })
  })

  it('renders the edit prompt with the workflow', async () => {
    const prompt = await client.getPrompt({
      name: 'markdownEditDocument',
      arguments: { document: 'the Home page', request: 'add an FAQ' },
    })
    const text = (prompt.messages[0].content as { text: string }).text

    expect(text).toContain('the Home page')
    expect(text).toContain('markdownValidate')
  })
})
