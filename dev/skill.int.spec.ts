import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { buildManifest, hashSkillDir, listSkillFiles, packageSkillDir, SKILL_VARIANTS } from '../bin/skill.mjs'
import { PAYLOAD_MARKDOWN_SKILL_SHA256 } from '../src/agent/skill'

const CLI = path.resolve('bin/payload-markdown.mjs')
const VARIANTS = Object.keys(SKILL_VARIANTS) as Array<'claude' | 'codex'>
const projects: string[] = []

const run = (cwd: string, ...args: string[]) => {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' })

  return { output: `${result.stdout}${result.stderr}`, status: result.status }
}

const project = (...files: string[]) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-skill-'))
  projects.push(dir)

  for (const file of files) {
    if (file.endsWith('/')) {
      fs.mkdirSync(path.join(dir, file), { recursive: true })
      continue
    }

    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.writeFileSync(path.join(dir, file), '')
  }

  return dir
}

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'))

afterEach(() => {
  for (const dir of projects.splice(0)) fs.rmSync(dir, { force: true, recursive: true })
})

describe('skill manifest', () => {
  it('matches the committed skill.json and src/agent/skill.ts (regenerate with `pnpm generate:skill`)', () => {
    for (const variant of VARIANTS) {
      const manifest = buildManifest(variant)

      expect(readJson(path.join(packageSkillDir(variant), 'skill.json'))).toEqual(manifest)
      expect(PAYLOAD_MARKDOWN_SKILL_SHA256[variant]).toBe(manifest.sha256)
    }
  })

  it('hashes paths and content, ignores line endings and the manifest itself', () => {
    const dir = project('a/SKILL.md', 'a/reference/x.md')
    const skill = path.join(dir, 'a')
    fs.writeFileSync(path.join(skill, 'SKILL.md'), 'one\ntwo\n')
    const hash = hashSkillDir(skill)

    fs.writeFileSync(path.join(skill, 'SKILL.md'), 'one\r\ntwo\r\n')
    fs.writeFileSync(path.join(skill, 'skill.json'), '{}')
    fs.mkdirSync(path.join(skill, 'scripts/__pycache__'), { recursive: true })
    fs.writeFileSync(path.join(skill, 'scripts/__pycache__/x.pyc'), 'cache')
    expect(hashSkillDir(skill)).toBe(hash)
    expect(listSkillFiles(skill)).toEqual(['SKILL.md', 'reference/x.md'])

    fs.renameSync(path.join(skill, 'reference/x.md'), path.join(skill, 'reference/y.md'))
    expect(hashSkillDir(skill)).not.toBe(hash)
  })
})

describe('payload-markdown CLI', () => {
  it('installs the variant for the agents a project uses, then reports it current', () => {
    const dir = project('.claude/')
    const target = path.join(dir, '.claude/skills/payload-markdown')

    expect(run(dir, 'skill', 'install')).toMatchObject({ status: 0 })
    expect(fs.existsSync(path.join(dir, '.agents'))).toBe(false)
    expect(readJson(path.join(target, 'skill.json'))).toEqual(buildManifest('claude'))
    expect(listSkillFiles(target)).toEqual(listSkillFiles(packageSkillDir('claude')))
    expect(hashSkillDir(target)).toBe(PAYLOAD_MARKDOWN_SKILL_SHA256.claude)

    expect(run(dir, 'skill', 'check')).toMatchObject({ status: 0 })
    expect(run(dir, 'skill', 'install').output).toContain('up to date')
  })

  it('installs every variant when the project shows no agent, or with --agent all', () => {
    for (const args of [[], ['--agent', 'all']]) {
      const dir = project()

      expect(run(dir, 'skill', 'install', ...args)).toMatchObject({ status: 0 })
      for (const variant of VARIANTS)
        expect(readJson(path.join(dir, SKILL_VARIANTS[variant].target, 'skill.json')).variant).toBe(variant)
    }

    const codexOnly = project('AGENTS.md')
    run(codexOnly, 'skill', 'install')
    expect(fs.existsSync(path.join(codexOnly, '.agents/skills/payload-markdown/SKILL.md'))).toBe(true)
    expect(fs.existsSync(path.join(codexOnly, '.claude'))).toBe(false)
  })

  it('reports an outdated or unversioned skill and updates it in place', () => {
    const dir = project()
    run(dir, 'skill', 'install', '--agent', 'codex')
    const target = path.join(dir, '.agents/skills/payload-markdown')

    // A copy installed from an older release: different files, its own consistent manifest.
    fs.writeFileSync(path.join(target, 'SKILL.md'), '---\nname: payload-markdown\n---\nold\n')
    fs.writeFileSync(
      path.join(target, 'skill.json'),
      JSON.stringify({ ...buildManifest('codex'), sha256: hashSkillDir(target), version: '1.0.0' }),
    )

    const outdated = run(dir, 'skill', 'check')
    expect(outdated.status).toBe(1)
    expect(outdated.output).toMatch(/outdated .agents\/skills\/payload-markdown is v1\.0\.0/)

    expect(run(dir, 'skill', 'install').output).toContain('was v1.0.0')
    expect(run(dir, 'skill', 'check')).toMatchObject({ status: 0 })

    // A manual copy from before skill.json existed.
    fs.rmSync(path.join(target, 'skill.json'))
    expect(run(dir, 'skill', 'check').output).toContain('unversioned')
    expect(run(dir, 'skill', 'install')).toMatchObject({ status: 0 })
    expect(run(dir, 'skill', 'check')).toMatchObject({ status: 0 })
  })

  it('protects local edits and unrelated directories unless --force is given', () => {
    const dir = project('.claude/skills/payload-markdown/notes.md')
    const target = path.join(dir, '.claude/skills/payload-markdown')

    const foreign = run(dir, 'skill', 'install', '--agent', 'claude')
    expect(foreign.status).toBe(1)
    expect(foreign.output).toContain('is not the payload-markdown skill')
    expect(fs.existsSync(path.join(target, 'notes.md'))).toBe(true)

    expect(run(dir, 'skill', 'install', '--agent', 'claude', '--force')).toMatchObject({ status: 0 })
    fs.appendFileSync(path.join(target, 'SKILL.md'), '\nLocal rule.\n')

    const modified = run(dir, 'skill', 'check')
    expect(modified.status).toBe(1)
    expect(modified.output).toContain('has local edits')
    expect(run(dir, 'skill', 'install').status).toBe(1)
    expect(fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8')).toContain('Local rule.')

    expect(run(dir, 'skill', 'install', '--force')).toMatchObject({ status: 0 })
    expect(run(dir, 'skill', 'check')).toMatchObject({ status: 0 })
  })

  it('fails check when nothing is installed and rejects bad usage', () => {
    const dir = project()

    expect(run(dir, 'skill', 'check')).toMatchObject({ status: 1 })
    expect(run(dir, 'skill', 'check').output).toContain('npx payload-markdown skill install')
    expect(run(dir, 'skill', 'install', '--agent', 'cursor').status).toBe(2)
    expect(run(dir, 'skill', 'remove').status).toBe(2)
    expect(run(dir, '--version').output.trim()).toBe(readJson('package.json').version)
  })
})
