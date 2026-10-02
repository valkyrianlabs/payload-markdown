import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { DEFAULT_CODE_LANGS, payloadMarkdown } from '../dist'
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

// The dev app always uses the Postgres adapter, so DATABASE_URL must point at
// Postgres in every environment (tests included). It previously swapped in a
// MongoDB memory-server URI under NODE_ENV=test, which the Postgres adapter
// cannot use.
const buildDevConfig = async () => {
  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    blocks: [Archive],
    collections: [
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
    db: postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URL || '',
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
          pages: true,
          posts: {
            config: {
              className: '[&_li::marker]:!text-cyan-200/90',
              options: {
                langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
                lineNumbers: true,
              },
            },
          },
        },
        icons: {
          baseDir: './public/icons',
          packs: [
            { alias: 'fa-duotone', path: 'fa/duotone' }
          ]
        },
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildDevConfig()
