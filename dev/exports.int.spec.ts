import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }

const built = fs.existsSync(path.resolve('dist/exports/render.js'))

describe('package exports', () => {
  it('declares every subpath in exports and publishConfig.exports alike', () => {
    expect(Object.keys(packageJson.exports)).toEqual(
      expect.arrayContaining([
        '.',
        './advanced',
        './client',
        './directive-spec.json',
        './render',
        './server',
        './styles.css',
      ]),
    )
    expect(packageJson.publishConfig.exports).toEqual(packageJson.exports)
  })

  it('exports the client field component from ./client and keeps the ./server alias', async () => {
    // @payloadcms/ui imports CSS, so the client entries are checked statically
    // here (they are bundler-only); both must re-export the same module.
    const fieldModule = "from '../field/MarkdownField/Component.js'"
    const client = fs.readFileSync(path.resolve('src/exports/client.ts'), 'utf8')
    const server = fs.readFileSync(path.resolve('src/exports/server.ts'), 'utf8')
    const { markdownField } = await import('../src/field/MarkdownField/config')
    const field = markdownField({ name: 'content' }) as { admin?: { components?: { Field?: string } } }

    expect(client).toContain(`export { PayloadMarkdownField } ${fieldModule}`)
    expect(server).toContain(`export { PayloadMarkdownField } ${fieldModule}`)
    expect(client).toContain('MarkdownRendererClient,')
    expect(fs.readFileSync(path.resolve('src/field/MarkdownField/Component.tsx'), 'utf8')).toMatch(
      /^'use client'/,
    )
    // Existing import maps hard-code this specifier; it must not change.
    expect(field.admin?.components?.Field).toBe(
      '@valkyrianlabs/payload-markdown/server#PayloadMarkdownField',
    )
  })

  // Runs against the built package (`pnpm build` first); CI builds before testing.
  it.skipIf(!built)('imports ., ./render and ./advanced in plain Node without CSS or React', () => {
    const result = spawnSync(process.execPath, ['scripts/smoke-exports.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, NODE_OPTIONS: '' },
    })

    expect({ output: result.stdout + result.stderr, status: result.status }).toMatchObject({
      status: 0,
    })
  })
})
