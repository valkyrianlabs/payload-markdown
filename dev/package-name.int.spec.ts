import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { isMarkdownField } from '../src/agent/targets'
import { MARKDOWN_BLOCK_PARAMS_ENABLE_FIELD_COMPONENT } from '../src/blocks/MarkdownBlock/constants'
import { PAYLOAD_MARKDOWN_FIELD_COMPONENT } from '../src/field/MarkdownField/config'
import { PAYLOAD_MARKDOWN_PACKAGE } from '../src/package'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const CANONICAL = '@valkyrianlabs/payload-markdown'

const listFiles = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? listFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))

describe('package name (published as @valkyrianlabs/payload-markdown and payload-markdown)', () => {
  it('derives admin component paths from the installed package name', () => {
    expect(PAYLOAD_MARKDOWN_PACKAGE).toBe(packageJson.name)
    expect(PAYLOAD_MARKDOWN_FIELD_COMPONENT).toBe(`${packageJson.name}/server#PayloadMarkdownField`)
    expect(MARKDOWN_BLOCK_PARAMS_ENABLE_FIELD_COMPONENT).toBe(`${packageJson.name}/client#MarkdownBlockParamsEnableField`)
  })

  it('recognizes markdown fields created under either name', () => {
    for (const name of [CANONICAL, 'payload-markdown']) {
      const field = { name: 'body', type: 'text', admin: { components: { Field: `${name}/server#PayloadMarkdownField` } } }
      expect(isMarkdownField(field as never)).toBe(true)
    }
    const other = { name: 'body', type: 'text', admin: { components: { Field: 'other-markdown/server#PayloadMarkdownField' } } }
    expect(isMarkdownField(other as never)).toBe(false)
  })

  it('keeps the name in src/package.ts only, which the npm alias rewrites', () => {
    const release = fs.readFileSync('release.toml', 'utf8')

    expect(release).toMatch(
      /\[\[npm\.aliases\]\]\s*\nname = "payload-markdown"\s*\nrewrite = \["package\/dist\/package\.js", "package\/dist\/package\.js\.map"\]/,
    )
    expect(fs.readFileSync('src/package.ts', 'utf8').split(CANONICAL)).toHaveLength(2)

    // Deliberate exceptions: the settings registry key is shared by both names (duplicate-copy
    // detection), and the directive spec names its origin package as metadata.
    const allowed = new Set([path.join('src', 'directives', 'spec.ts'), path.join('src', 'package.ts'), path.join('src', 'runtime', 'index.ts')])
    const offenders = listFiles('src').filter(
      (file) => /\.tsx?$/.test(file) && !allowed.has(file) && fs.readFileSync(file, 'utf8').includes(CANONICAL),
    )

    expect(offenders).toEqual([])
  })

  it.skipIf(!fs.existsSync('dist/package.js'))('builds no self-import through the scoped name', () => {
    expect(fs.readFileSync('dist/package.js', 'utf8').split(CANONICAL)).toHaveLength(2)
    expect(fs.readFileSync('dist/package.d.ts', 'utf8')).not.toContain(CANONICAL)

    const selfImport = new RegExp(`(?:from |import\\(?)\\s?['"]${CANONICAL}`)
    const offenders = listFiles('dist').filter((file) => /\.(?:js|d\.ts)$/.test(file) && selfImport.test(fs.readFileSync(file, 'utf8')))

    expect(offenders).toEqual([])
  })
})
