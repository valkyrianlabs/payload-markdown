import type { Payload } from 'payload'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { devUser } from './helpers/credentials'

const demosDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'demos')

function titleFromMarkdown(markdown: string, fallback: string): string {
  return /^#\s+(.+)$/m.exec(markdown)?.[1]?.trim() ?? fallback
}

/**
 * Seeds one published `demo-<name>` post per `dev/demos/<name>.md`, viewable at
 * `/posts/demo-<name>`. Existing demo posts are left alone so edits made in the
 * admin survive restarts; set `PMD_RESEED_DEMOS=1` to overwrite them from disk.
 */
async function seedDemoPosts(payload: Payload) {
  if (!fs.existsSync(demosDir)) return

  const reseed = process.env.PMD_RESEED_DEMOS === '1'
  const files = fs.readdirSync(demosDir).filter((file) => file.endsWith('.md')).sort()

  for (const file of files) {
    const name = path.basename(file, '.md')
    const slug = `demo-${name}`
    const content = fs.readFileSync(path.join(demosDir, file), 'utf8')
    const data = {
      _status: 'published' as const,
      content,
      generateSlug: false,
      publishedAt: new Date().toISOString(),
      slug,
      title: `Demo: ${titleFromMarkdown(content, name)}`,
    }

    const { docs } = await payload.find({
      collection: 'posts',
      limit: 1,
      pagination: false,
      where: { slug: { equals: slug } },
    })
    const existing = docs[0]

    // onInit can run inside a render, where revalidatePath throws.
    const context = { disableRevalidate: true }

    if (!existing) await payload.create({ collection: 'posts', context, data })
    else if (reseed) await payload.update({ id: existing.id, collection: 'posts', context, data })
  }
}

export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }

  await seedDemoPosts(payload)
}
