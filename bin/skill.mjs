/**
 * The payload-markdown agent skill bundled with this package: where each
 * variant lives, where agents expect it in a project, and the content hash
 * recorded in each variant's `skill.json` manifest.
 *
 * Shared by the `payload-markdown` CLI, scripts/generate-skill-manifest.mjs
 * and the tests, so the hash is computed one way everywhere.
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const SKILL_NAME = 'payload-markdown'
export const MANIFEST_FILE = 'skill.json'

/** Skill variants, their source in this package and their install path in a project. */
export const SKILL_VARIANTS = {
  claude: { label: 'Claude Code', target: '.claude/skills/payload-markdown' },
  codex: { label: 'Codex', target: '.agents/skills/payload-markdown' },
}

/** @param {keyof typeof SKILL_VARIANTS} variant */
export const packageSkillDir = (variant) => path.join(PACKAGE_ROOT, 'skills', SKILL_NAME, variant)

export function packageVersion() {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')).version
}

/** Files that make up a skill directory (POSIX paths, sorted), without the manifest. */
export function listSkillFiles(dir) {
  const files = []

  const visit = (relative) => {
    for (const entry of fs.readdirSync(path.join(dir, relative), { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === '__pycache__') continue

      const child = relative ? `${relative}/${entry.name}` : entry.name

      if (entry.isDirectory()) visit(child)
      else if (entry.isFile() && child !== MANIFEST_FILE) files.push(child)
    }
  }

  visit('')

  return files.sort()
}

/**
 * sha256 over every skill file's path and content (CRLF read as LF), so a copy
 * hashes the same as the package's own files on any platform.
 */
export function hashSkillDir(dir) {
  const hash = createHash('sha256')

  for (const file of listSkillFiles(dir)) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n')
    hash.update(`${file}\0${createHash('sha256').update(content).digest('hex')}\n`)
  }

  return hash.digest('hex')
}

/** The `skill.json` manifest of a skill directory, or `undefined` when it has none. */
export function readManifest(dir) {
  const file = path.join(dir, MANIFEST_FILE)
  if (!fs.existsSync(file)) return undefined

  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return undefined
  }
}

/** The manifest committed for `variant` (what scripts/generate-skill-manifest.mjs writes). */
export function buildManifest(variant) {
  return {
    name: SKILL_NAME,
    package: '@valkyrianlabs/payload-markdown',
    variant,
    version: packageVersion(),
    sha256: hashSkillDir(packageSkillDir(variant)),
  }
}

/** Whether `dir` holds a payload-markdown skill (by manifest or SKILL.md frontmatter). */
export function isPayloadMarkdownSkill(dir) {
  if (readManifest(dir)?.name === SKILL_NAME) return true

  const skillFile = path.join(dir, 'SKILL.md')

  return fs.existsSync(skillFile) && /^name:\s*payload-markdown\s*$/m.test(fs.readFileSync(skillFile, 'utf8'))
}

/**
 * Compares the skill installed at `dir` with this package's copy of `variant`:
 *
 * - `missing`: nothing at `dir`
 * - `current`: same content as this package
 * - `outdated`: installed from a different package version (or without a manifest)
 * - `modified`: files changed since install (the manifest hash no longer matches)
 */
export function skillStatus(dir, variant) {
  if (!fs.existsSync(dir)) return { status: 'missing' }

  const installed = readManifest(dir)
  const expected = buildManifest(variant)

  if (!installed?.sha256) return { expected, status: 'outdated', unversioned: true }
  if (hashSkillDir(dir) !== installed.sha256) return { expected, installed, status: 'modified' }
  if (installed.sha256 !== expected.sha256) return { expected, installed, status: 'outdated' }

  return { expected, installed, status: 'current' }
}

/** Replaces `dir` with this package's copy of `variant`, manifest included. */
export function installSkill(dir, variant) {
  const source = packageSkillDir(variant)

  fs.rmSync(dir, { force: true, recursive: true })

  for (const file of [...listSkillFiles(source), MANIFEST_FILE]) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.copyFileSync(path.join(source, file), path.join(dir, file))
  }
}
