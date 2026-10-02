import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { compileMarkdown } from '../src/core/renderMarkdown'
import { layoutDirectiveRegistry } from '../src/directives/registry'
import { resolveShieldsBadge, SHIELDS_BADGE_TARGETS } from '../src/directives/shields'
import { getDirectiveSpec } from '../src/directives/spec'

const SKILL_SPEC_PATHS = [
  'skills/payload-markdown/claude/reference/directive-spec.json',
  'skills/payload-markdown/codex/reference/directive-spec.json',
]
const CHECKER_PATHS = [
  'skills/payload-markdown/claude/scripts/check_payload_markdown_doc.py',
  'skills/payload-markdown/codex/scripts/check_payload_markdown_doc.py',
]

const specJson = `${JSON.stringify(getDirectiveSpec(), null, 2)}\n`

describe('generated directive spec', () => {
  it('matches the committed skill copies (regenerate with `pnpm generate:spec`)', () => {
    for (const file of SKILL_SPEC_PATHS) expect({ file, json: fs.readFileSync(file, 'utf8') }).toEqual({ file, json: specJson })
  })

  it.skipIf(!fs.existsSync('dist/directive-spec.json'))('matches the built dist/directive-spec.json', () => {
    expect(fs.readFileSync('dist/directive-spec.json', 'utf8')).toBe(specJson)
  })

  it('describes every registry directive, attribute and close marker', () => {
    const spec = getDirectiveSpec()

    expect(spec.specVersion).toBe(1)
    expect(spec.directives.map((directive) => directive.name)).toEqual(
      layoutDirectiveRegistry.all.map((definition) => definition.name),
    )
    expect(spec.directives.filter((directive) => directive.kind === 'leaf').map((d) => d.name)).toEqual(
      layoutDirectiveRegistry.leafDirectiveNames,
    )
    expect(spec.closeMarkers.map((marker) => marker.marker).sort()).toEqual([
      ':::',
      ':::end',
      ':::endcol',
      ':::endsection',
    ])

    for (const definition of layoutDirectiveRegistry.all) {
      const directive = spec.directives.find((entry) => entry.name === definition.name)

      expect(directive?.attributes.map((attribute) => attribute.name)).toEqual(
        [...(definition.allowedAttributes ?? [])].sort(),
      )

      for (const attribute of directive?.attributes ?? []) {
        if (attribute.type === 'enum') expect(attribute.values?.length).toBeGreaterThan(0)
        if (attribute.themeGroup) expect(spec.themes[attribute.themeGroup]).toBeDefined()
      }
    }

    const callout = spec.directives.find((directive) => directive.name === 'callout')
    const card = spec.directives.find((directive) => directive.name === 'card')

    expect(callout?.attributes.find((attribute) => attribute.name === 'variant')).toMatchObject({
      type: 'enum',
      values: ['note', 'info', 'tip', 'warning', 'danger', 'success'],
    })
    expect(card?.attributes.find((attribute) => attribute.name === 'href')?.type).toBe('url')
    expect(card?.attributes.find((attribute) => attribute.name === 'newTab')?.type).toBe('boolean')
    expect(spec.directives.find((directive) => directive.name === '2col')?.closeMarkers).toEqual([
      ':::',
      ':::endcol',
    ])
  })

  it('publishes badge targets that the resolvers actually accept', () => {
    const spec = getDirectiveSpec()
    const requiredValues: Record<string, string> = {
      color: 'blue',
      label: 'l',
      message: 'm',
      package: 'pkg',
      repo: 'o/r',
      workflow: 'ci.yml',
    }

    expect(Object.keys(SHIELDS_BADGE_TARGETS).sort()).toEqual([...spec.badges.types].sort())

    for (const type of spec.badges.types) {
      const base = Object.fromEntries(
        spec.badges.requiredAttributes[type].map((name) => [name, requiredValues[name] ?? '']),
      )

      for (const target of spec.badges.targets[type])
        expect({
          type,
          target,
          warnings: resolveShieldsBadge({
            ...base,
            ...(target === 'workflow' ? { workflow: requiredValues.workflow } : {}),
            type,
            target,
          }).warnings,
        }).toEqual({
          type,
          target,
          warnings: [],
        })

      if (type !== 'static')
        // apt shares the debian resolver (and its message).
        expect(resolveShieldsBadge({ ...base, type, target: 'nope' }).warnings).toEqual([
          expect.stringContaining('Unsupported badge target "nope"'),
        ])
    }
  })
})

const python = spawnSync('python3', ['--version']).status === 0

type Vector = { expect: string[]; markdown: string; name: string }

const VECTORS: Vector[] = [
  { name: 'clean', expect: [], markdown: '# T\n\n:::callout{variant="tip"}\nBody\n:::\n' },
  {
    name: 'unbraced-key-value',
    expect: [],
    markdown: '# T\n\n:::callout variant="tip"\nBody\n:::\n',
  },
  {
    name: 'bare-words',
    expect: ['unexpected text after :::callout', 'closing marker ::: has no open directive'],
    markdown: '# T\n\n:::callout Remember this\nBody\n:::\n',
  },
  {
    name: 'list-item',
    expect: ['directive marker :::callout inside a list item'],
    markdown: '# T\n\n- :::callout\n',
  },
  {
    name: 'blockquote',
    expect: ['directive marker :::callout inside a blockquote'],
    markdown: '# T\n\n> :::callout\n',
  },
  {
    name: 'stray-endcol',
    expect: ['closing marker :::endcol has no open directive'],
    markdown: '# T\n\n:::endcol\n',
  },
  { name: 'unclosed', expect: ['unclosed directive :::section'], markdown: '# T\n\n:::section\nBody\n' },
  {
    name: 'bad-enum',
    expect: ['unsupported variant value for callout: weird'],
    markdown: '# T\n\n:::callout{variant="weird"}\nBody\n:::\n',
  },
  {
    name: 'unknown-attribute',
    expect: ['unknown attribute on card: titel'],
    markdown: '# T\n\n:::card{titel="x"}\nBody\n:::\n',
  },
  {
    name: 'unknown-directive',
    expect: [
      'unsupported Payload Markdown directive: mermaid',
      'closing marker ::: has no open directive',
    ],
    markdown: '# T\n\n:::mermaid\nx\n:::\n',
  },
]

function runChecker(script: string, files: string[], extra: string[] = []) {
  const result = spawnSync('python3', [script, ...extra, ...files], { encoding: 'utf8' })

  return { lines: result.stdout.split('\n').filter(Boolean), status: result.status }
}

describe.skipIf(!python)('Python doc checker', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pmd-checker-'))
  const files = Object.fromEntries(
    VECTORS.map((vector) => {
      const file = path.join(dir, `${vector.name}.md`)
      fs.writeFileSync(file, vector.markdown)

      return [vector.name, file]
    }),
  )

  it('keeps the claude and codex copies identical', () => {
    expect(fs.readFileSync(CHECKER_PATHS[0], 'utf8')).toBe(fs.readFileSync(CHECKER_PATHS[1], 'utf8'))
  })

  for (const script of CHECKER_PATHS)
    it(`flags the vectors with the spec (${script.split('/')[2]})`, () => {
      for (const vector of VECTORS) {
        const { lines, status } = runChecker(script, [files[vector.name]])

        expect({ name: vector.name, status }).toEqual({ name: vector.name, status: vector.expect.length ? 1 : 0 })
        expect({ name: vector.name, count: lines.length }).toEqual({
          name: vector.name,
          count: vector.expect.length,
        })
        for (const expected of vector.expect)
          expect({ name: vector.name, lines }).toEqual({
            name: vector.name,
            lines: expect.arrayContaining([expect.stringContaining(expected)]),
          })
      }
    })

  it('agrees with the renderer on which vectors have problems', async () => {
    for (const vector of VECTORS) {
      const { warnings } = await compileMarkdown(vector.markdown)

      expect({ name: vector.name, renderer: warnings.length > 0 }).toEqual({
        name: vector.name,
        renderer: vector.expect.length > 0,
      })
    }
  })

  it('falls back to its embedded tables when the spec is missing', () => {
    const scriptDir = path.join(dir, 'scripts')
    fs.mkdirSync(scriptDir, { recursive: true })
    const script = path.join(scriptDir, 'check_payload_markdown_doc.py')
    fs.copyFileSync(CHECKER_PATHS[0], script)

    expect(runChecker(script, [files.clean]).status).toBe(0)
    expect(runChecker(script, [files['bare-words']]).lines.join('\n')).toContain('unexpected text')
    expect(runChecker(script, [files.unclosed]).lines.join('\n')).toContain('unclosed directive')
    expect(runChecker(script, [files['unknown-directive']]).lines.join('\n')).toContain('mermaid')
    // Enum and attribute checks need the spec.
    expect(runChecker(script, [files['bad-enum']]).status).toBe(0)
    expect(runChecker(script, [files['bad-enum']], ['--spec', SKILL_SPEC_PATHS[0]]).status).toBe(1)
  })

  it('reports nothing for the repository docs and skill examples', () => {
    const docs = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name)
        if (entry.isDirectory()) return docs(entryPath)
        return entry.name.endsWith('.md') ? [entryPath] : []
      })

    const result = runChecker(CHECKER_PATHS[0], [
      ...docs('docs'),
      ...docs('skills/payload-markdown/claude/examples'),
    ])

    expect(result).toEqual({ lines: [], status: 0 })
  })
})
