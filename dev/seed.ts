import type { Payload } from 'payload'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { devUser } from './helpers/credentials'

const demosDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'demos')

function titleFromMarkdown(markdown: string, fallback: string): string {
  return /^# (.+)$/m.exec(markdown)?.[1]?.trim() ?? fallback
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
      slug,
      _status: 'published' as const,
      content,
      generateSlug: false,
      publishedAt: new Date().toISOString(),
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

/**
 * Example palettes for the "Markdown Appearance" global, seeded once while it
 * is empty: brand colours for platform icons and a duotone pair.
 */
const DEMO_PALETTES = [
  { name: 'debian', color: '#a80030', dark: { color: '#ff5277' }, label: 'Debian' },
  { name: 'ubuntu', color: '#e95420', label: 'Ubuntu' },
  { name: 'apple', color: '#555555', dark: { color: '#d4d4d8' }, label: 'Apple' },
  {
    name: 'aurora',
    color: '#0284c7',
    dark: { color: '#38bdf8', secondaryColor: '#c4b5fd' },
    label: 'Aurora (duotone)',
    secondaryColor: '#7c3aed',
    secondaryOpacity: 0.7,
  },
]

async function seedDemoPalettes(payload: Payload) {
  const appearance = await payload.findGlobal({ slug: 'markdown-appearance', depth: 0 })
  if ((appearance.palettes ?? []).length > 0) return

  await payload.updateGlobal({
    slug: 'markdown-appearance',
    context: { disableRevalidate: true },
    data: { palettes: DEMO_PALETTES },
  })
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

  await seedDemoPalettes(payload)
  await seedDemoPosts(payload)
}
