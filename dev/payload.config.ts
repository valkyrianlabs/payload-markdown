import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Archive } from './blocks/ArchiveBlock/config.ts'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { testEmailAdapter } from './helpers/testEmailAdapter'
import { seed } from './seed'

// @ts-expect-error - This is a valid import.meta use, the dev config doesn't actually export to js
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URL = `${memoryDB.getUri()}&retryWrites=true`
  }

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
              wrapperClassName: '[&_li::marker]:!text-cyan-200/90',
            },
          },
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

export default buildConfigWithMemoryDB()
