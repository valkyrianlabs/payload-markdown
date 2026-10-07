#!/usr/bin/env node
/**
 * payload-markdown CLI: installs the bundled agent skill into a project and
 * reports when an installed copy has drifted from the package.
 *
 *   payload-markdown skill install [--agent claude|codex|all] [--dir <project>] [--force]
 *   payload-markdown skill check [--dir <project>]
 */
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { installSkill, isPayloadMarkdownSkill, packageVersion, SKILL_VARIANTS, skillStatus } from './skill.mjs'

const USAGE = `Usage: payload-markdown <command>

Commands:
  skill install   Install or update the payload-markdown agent skill in this project
  skill check     Exit non-zero when an installed skill differs from this package

Options:
  --agent <name>  claude, codex or all (install; default: the agents this project uses)
  --dir <path>    Project root (default: the current directory)
  --force         Overwrite local edits or a directory that is not this skill
  -v, --version   Print the package version
  -h, --help      Show this help

Skill locations:
${Object.values(SKILL_VARIANTS)
  .map((variant) => `  ${variant.label.padEnd(12)} ${variant.target}`)
  .join('\n')}`

const short = (sha) => (sha ? sha.slice(0, 12) : 'none')

function fail(message, code = 1) {
  console.error(`payload-markdown: ${message}`)
  process.exit(code)
}

/** Variants to install when --agent is not given: existing installs, else the agents the project uses. */
function detectVariants(root) {
  const installed = Object.keys(SKILL_VARIANTS).filter((variant) =>
    fs.existsSync(path.join(root, SKILL_VARIANTS[variant].target)),
  )
  if (installed.length > 0) return installed

  const exists = (file) => fs.existsSync(path.join(root, file))
  const used = [
    ...(exists('.claude') || exists('CLAUDE.md') ? ['claude'] : []),
    ...(exists('.agents') || exists('.codex') || exists('AGENTS.md') ? ['codex'] : []),
  ]

  return used.length > 0 ? used : Object.keys(SKILL_VARIANTS)
}

function install(root, variants, force) {
  let failed = false

  for (const variant of variants) {
    const { target } = SKILL_VARIANTS[variant]
    const dir = path.join(root, target)
    const result = skillStatus(dir, variant)
    const version = result.expected?.version ?? packageVersion()

    if (result.status === 'current' && result.installed.version === version) {
      console.log(`ok       ${target} is up to date (v${version})`)
      continue
    }

    if (!force && result.status !== 'missing' && !isPayloadMarkdownSkill(dir)) {
      console.error(`refused  ${target} exists and is not the payload-markdown skill (--force to replace it)`)
      failed = true
      continue
    }

    if (!force && result.status === 'modified') {
      console.error(`refused  ${target} has local edits (--force to discard them)`)
      failed = true
      continue
    }

    installSkill(dir, variant)

    const from = result.status === 'missing' ? '' : ` (was ${result.installed?.version ? `v${result.installed.version}` : 'unversioned'})`
    console.log(`${result.status === 'missing' ? 'installed' : 'updated  '} ${target} v${version}${from}`)
  }

  if (failed) process.exit(1)
}

function check(root) {
  const found = Object.keys(SKILL_VARIANTS)
    .map((variant) => ({ variant, ...SKILL_VARIANTS[variant] }))
    .map((entry) => ({ ...entry, result: skillStatus(path.join(root, entry.target), entry.variant) }))
    .filter((entry) => entry.result.status !== 'missing')

  if (found.length === 0) fail('the payload-markdown skill is not installed; run `npx payload-markdown skill install`')

  let drift = false

  for (const { result, target } of found) {
    const { expected, installed, status } = result

    if (status === 'current') {
      console.log(`ok       ${target} matches the package (sha256 ${short(expected.sha256)})`)
      continue
    }

    drift = true

    if (status === 'modified')
      console.error(`modified ${target} has local edits since it was installed (sha256 ${short(installed.sha256)})`)
    else
      console.error(
        `outdated ${target} is ${installed?.version ? `v${installed.version} (sha256 ${short(installed.sha256)})` : 'unversioned'}; the package has v${expected.version} (sha256 ${short(expected.sha256)})`,
      )
  }

  if (drift)
    fail('run `npx payload-markdown skill install` to update (add --force to discard local edits)')
}

let parsed

try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      agent: { type: 'string' },
      dir: { type: 'string' },
      force: { type: 'boolean' },
      help: { short: 'h', type: 'boolean' },
      version: { short: 'v', type: 'boolean' },
    },
  })
} catch (error) {
  fail(`${error.message}\n\n${USAGE}`, 2)
}

const { positionals, values } = parsed
const [group, command] = positionals

if (values.version) {
  console.log(packageVersion())
} else if (values.help || positionals.length === 0) {
  console.log(USAGE)
} else if (group === 'skill' && (command === 'install' || command === 'check') && positionals.length === 2) {
  const root = path.resolve(values.dir ?? '.')

  if (!fs.existsSync(root)) fail(`project directory not found: ${root}`, 2)

  if (command === 'check') {
    check(root)
  } else {
    const agent = values.agent ?? 'auto'

    if (agent !== 'auto' && agent !== 'all' && !(agent in SKILL_VARIANTS))
      fail(`unknown --agent "${agent}" (expected claude, codex or all)`, 2)

    install(
      root,
      agent === 'auto' ? detectVariants(root) : agent === 'all' ? Object.keys(SKILL_VARIANTS) : [agent],
      Boolean(values.force),
    )
  }
} else {
  fail(`unknown command: ${positionals.join(' ')}\n\n${USAGE}`, 2)
}
