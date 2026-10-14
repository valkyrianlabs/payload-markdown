import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { DEFAULT_CODE_LANGS, payloadMarkdown } from '../dist'
import { withPayloadMarkdownMcp } from '../dist/exports/mcp.js'
import { Archive } from './blocks/ArchiveBlock/config.ts'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { testEmailAdapter } from './helpers/testEmailAdapter'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

// The dev app uses Postgres (CI included). A `file:` DATABASE_URL switches to
// SQLite for local runs without a Postgres server, e.g. DATABASE_URL=file:./dev/dev.db.
const databaseURL = process.env.DATABASE_URL || ''

const buildDevConfig = async () => {
  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
      user: 'users',
    },
    blocks: [Archive],
    collections: [
      // Explicit, because the MCP API key collection is also an auth collection
      // (Payload only adds its default users collection when there is none).
      { slug: 'users', admin: { useAsTitle: 'email' }, auth: true, fields: [] },
      Pages,
      Posts,
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: databaseURL.startsWith('file:')
      ? sqliteAdapter({ client: { url: databaseURL } })
      : postgresAdapter({
          pool: {
            connectionString: databaseURL,
          },
        }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    globals: [],
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      payloadMarkdown({
        collections: {
          // Block-scope defaults for page markdown blocks; the e2e suite checks that
          // per-block params start from these and override only what an editor changes.
          pages: {
            config: {
              blocks: {
                className: 'dev-pages-block',
                mutedHeadings: true,
                size: 'sm',
              },
            },
          },
          posts: {
            config: {
              className: '[&_li::marker]:!text-cyan-600 dark:[&_li::marker]:!text-cyan-200/90',
              options: {
                langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
                lineNumbers: true,
              },
            },
          },
        },
        // Runtime palettes: the "Markdown Appearance" global (seeded in seed.ts).
        appearance: true,
        icons: {
          // public/icons is local (gitignored); the fixture packs are committed
          // so the e2e suite has icons to paint in CI.
          baseDir: '.',
          packs: [
            { alias: 'fa-duotone', path: 'public/icons/fa/duotone' },
            { alias: 'fa-brands', path: 'public/icons/fa/brands' },
            { alias: 'fixture-brand', path: 'tests/fixtures/icons/brand' },
            { alias: 'fixture-duotone', path: 'tests/fixtures/icons/fa-duotone' },
          ]
        },
      }),
      // AI agents: /api/mcp with the payload-markdown tools. Create a key in
      // the admin under MCP → API Keys.
      mcpPlugin(
        withPayloadMarkdownMcp({
          collections: {
            pages: { description: 'Site pages built from layout blocks, including markdown blocks.', enabled: true },
            posts: { description: 'Blog posts with a markdown content field.', enabled: true },
          },
          // Exposes the palettes global so API keys get find/update checkboxes for it.
          globals: {
            'markdown-appearance': { description: 'Colour palettes for markdown.', enabled: true },
          },
        }),
      ),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildDevConfig()
