#!/usr/bin/env node
/**
 * Writes the generated directive spec (run after the TypeScript build):
 *
 *   node scripts/generate-directive-spec.mjs            -> dist/directive-spec.json
 *   node scripts/generate-directive-spec.mjs --skills   -> also the skill reference copies
 *
 * The skill copies are committed; dev/spec.int.spec.ts fails when they are
 * stale (regenerate with `pnpm generate:spec`).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { getDirectiveSpec } = await import(
  pathToFileURL(path.join(root, 'dist/directives/spec.js')).href
)

const SKILL_SPEC_PATHS = [
  'skills/payload-markdown/claude/reference/directive-spec.json',
  'skills/payload-markdown/codex/reference/directive-spec.json',
]

const json = `${JSON.stringify(getDirectiveSpec(), null, 2)}\n`
const targets = [
  'dist/directive-spec.json',
  ...(process.argv.includes('--skills') ? SKILL_SPEC_PATHS : []),
]

for (const target of targets) {
  const file = path.join(root, target)

  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === json) continue

  fs.writeFileSync(file, json)
  console.log(`wrote ${target}`)
}
