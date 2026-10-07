import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }

const read = (file: string) => fs.readFileSync(path.resolve(file), 'utf8')

const deploy = read('.github/workflows/deploy.yml')
const release = read('.github/workflows/release.yml')

// Fork pull requests (untrusted code) run on GitHub-hosted runners; pushes and same-repository
// pull requests run on the self-hosted runner.
const FORK_ROUTED_RUNNER =
  "runs-on: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository && 'ubuntu-latest' || fromJSON('[\"self-hosted\",\"Linux\",\"X64\",\"ubuntu-latest-lts\"]') }}"

/** `run:` commands of a workflow (single-line and block scalars). */
function getRunCommands(workflow: string): string[] {
  const commands: string[] = []
  const lines = workflow.split('\n')

  for (let index = 0; index < lines.length; ++index) {
    const match = lines[index].match(/^( *)run:(.*)$/)
    if (!match) continue

    if (match[2].trim() !== '|') {
      commands.push(match[2].trim())
      continue
    }

    const indent = match[1].length
    for (let next = index + 1; next < lines.length; ++next) {
      const line = lines[next]
      if (line.trim() && line.search(/\S/) <= indent) break
      if (line.trim()) commands.push(line.trim())
    }
  }

  return commands
}

/** A workflow without its comment lines. */
const code = (workflow: string) =>
  workflow
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')

/** Index of the first command that runs `gate` in the CI container, or -1. */
const inContainer = (commands: string[], gate: string) =>
  commands.findIndex((command) => /^\.\/ci\/run-(?:ci|playwright)\b/.test(command) && command.includes(gate))

describe('CI workflows enforce the package contract', () => {
  it('pins every action to a commit SHA with its version', () => {
    for (const [name, workflow] of [
      ['deploy.yml', deploy],
      ['release.yml', release],
    ]) {
      const uses = [...workflow.matchAll(/uses: (\S+)(?: (.*))?$/gm)]

      expect(uses.length).toBeGreaterThan(0)
      for (const [, action, comment] of uses)
        expect({ name, action, comment: (comment ?? '').trim() }).toMatchObject({
          action: expect.stringMatching(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/),
          comment: expect.stringMatching(/^# v\d+\.\d+\.\d+$/),
        })
    }
  })

  it('keeps fork pull requests off the self-hosted runner with read-only permissions', () => {
    const runsOn = [...deploy.matchAll(/^\s*runs-on:.*$/gm)].map(([line]) => line.trim())

    expect(deploy).toMatch(/^permissions:\n {2}contents: read$/m)
    expect(runsOn.length).toBeGreaterThanOrEqual(2)
    for (const line of runsOn) expect(line).toBe(FORK_ROUTED_RUNNER)
  })

  it('runs every contract gate in the CI container on pushes and pull requests', () => {
    const commands = getRunCommands(deploy)

    for (const gate of [
      'actionlint',
      'pnpm install --frozen-lockfile --prefer-offline',
      'pnpm lint',
      'pnpm build',
      'pnpm exec tsc -p dev/tsconfig.json --noEmit',
      'pnpm test:int',
      'pnpm test:exports',
      'pnpm verify:packages',
      'pnpm dlx @arethetypeswrong/cli@0.18.5 --pack --profile esm-only',
    ])
      expect({ gate, index: inContainer(commands, gate) }).toMatchObject({ index: expect.any(Number) })
    for (const gate of ['pnpm build', 'pnpm test:int', 'pnpm verify:packages'])
      expect(inContainer(commands, gate)).toBeGreaterThanOrEqual(0)

    // Tests run after the build so the dist-backed checks are not skipped.
    expect(inContainer(commands, 'pnpm test:int')).toBeGreaterThan(inContainer(commands, 'pnpm build'))
    // Playwright (browsers, OS libraries, Postgres) lives entirely in the container.
    expect(commands).toContain('./ci/run-playwright')
    // Nothing touches the host: no sudo, no host packages, no Docker service containers.
    expect(code(deploy)).not.toMatch(/\bsudo\b|apt-get|services:|--with-deps|setup-node/)
  })

  it('releases through vl-release in the CI container with every gate before npm publication', () => {
    const commands = getRunCommands(release)
    const publish = commands.indexOf('vlr publish-npm --require-enabled')

    expect(publish).toBeGreaterThan(0)
    for (const gate of [
      'vlr check --release --tag "${RELEASE_REF#refs/tags/}"',
      'vlr prepare --record release/meta/prepare.json',
      'pnpm install --frozen-lockfile --prefer-offline',
      'vlr build-npm',
      'pnpm test:int',
      'pnpm lint',
      'pnpm exec tsc -p dev/tsconfig.json --noEmit',
      'pnpm test:exports',
      'scripts/verify-npm-packages.mjs --release release',
      'vlr validate-artifacts',
      'vlr publish-npm --mode enabled --dry-run',
    ]) {
      const index = inContainer(commands, gate)
      expect({ gate, index }).toMatchObject({ index: expect.any(Number) })
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(publish)
    }

    // npm trusted publishing only accepts GitHub-hosted runners: publish-npm is the one job that
    // leaves the self-hosted runner, bound to this workflow file and the Production environment.
    const runners = [...release.matchAll(/^ {2}([\w-]+):\n(?: {4}.*\n)*? {4}runs-on: (.+)$/gm)].map(
      ([, job, runner]) => [job, runner],
    )
    expect(runners.filter(([, runner]) => runner !== 'self-hosted')).toEqual([['publish-npm', 'ubuntu-latest']])
    expect(release).toMatch(/^ {4}environment:\n {6}name: Production$/m)
    expect(release).toContain('id-token: write # npm trusted publishing')
    expect(code(release)).not.toMatch(/\bsudo\b|services:/)
    // The release is recorded on main only after publication and the GitHub release.
    expect(inContainer(commands, 'vlr finalize --record release/meta/prepare.json')).toBeGreaterThan(
      inContainer(commands, 'vlr github-release'),
    )
  })

  it('smoke-tests every published subpath', () => {
    const smoke = read('scripts/smoke-exports.mjs')
    const importedOrResolved = [
      ...[...smoke.matchAll(/for \(const subpath of \[([^\]]*)\]\)/g)].flatMap(([, list]) =>
        [...list.matchAll(/'([^']*)'/g)].map(([, subpath]) => `.${subpath}`),
      ),
      ...[...smoke.matchAll(/import\.meta\.resolve\(`\$\{PACKAGE\}(\/[^`]+)`\)/g)].map(
        ([, subpath]) => `.${subpath}`,
      ),
    ]

    for (const subpath of Object.keys(packageJson.exports))
      expect(importedOrResolved).toContain(subpath)
  })
})
