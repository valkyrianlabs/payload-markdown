import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }

const read = (file: string) => fs.readFileSync(path.resolve(file), 'utf8')

const deploy = read('.github/workflows/deploy.yml')
const release = read('.github/workflows/release.yml')

const PR_ROUTED_RUNNER =
  "runs-on: ${{ github.event_name == 'pull_request' && 'ubuntu-latest' || fromJSON('[\"self-hosted\",\"Linux\",\"X64\",\"ubuntu-latest-lts\"]') }}"

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

  it('keeps pull requests off the self-hosted runners with read-only permissions', () => {
    const runsOn = [...deploy.matchAll(/^\s*runs-on:.*$/gm)].map(([line]) => line.trim())

    expect(deploy).toMatch(/^permissions:\n {2}contents: read$/m)
    expect(runsOn.length).toBeGreaterThanOrEqual(2)
    for (const line of runsOn) expect(line).toBe(PR_ROUTED_RUNNER)
  })

  it('runs every contract gate on pushes and pull requests', () => {
    const commands = getRunCommands(deploy)

    for (const gate of [
      'pnpm install --frozen-lockfile --prefer-offline --unsafe-perm',
      'pnpm lint',
      'pnpm build',
      'pnpm exec tsc -p dev/tsconfig.json --noEmit',
      'pnpm test:int',
      'pnpm test:exports',
      'pnpm dlx @arethetypeswrong/cli@0.18.5 --pack --profile esm-only',
      'pnpm exec playwright install chromium',
      'pnpm test:e2e --reporter=line',
    ])
      expect(commands).toContain(gate)

    // Tests run after the build so the dist-backed checks are not skipped.
    expect(commands.indexOf('pnpm test:int')).toBeGreaterThan(commands.indexOf('pnpm build'))
    // System deps go through plain apt-get (allowed by the self-hosted runner's sudoers),
    // never `--with-deps`, which needs `sudo sh -c`.
    expect(commands.filter((command) => command.includes('--with-deps'))).toEqual([])
    expect(commands).toContain('sudo -n apt-get install -y --no-install-recommends $deps')
    expect(deploy).toContain('image: postgres:16')
    expect(deploy).toContain('--health-cmd "pg_isready -U postgres"')
    expect(deploy).toContain("job.services.postgres.ports['5432']")
  })

  it('releases through vl-release with every gate before npm publication', () => {
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
      'vlr validate-artifacts',
      'vlr publish-npm --mode enabled --dry-run',
    ]) {
      expect(commands).toContain(gate)
      expect(commands.indexOf(gate)).toBeLessThan(publish)
    }

    // npm trusted publishing is bound to this workflow file and the Production environment.
    expect(release).toMatch(/^ {4}environment:\n {6}name: Production$/m)
    expect(release).toContain('id-token: write # npm trusted publishing')
    // The release is recorded on main only after publication and the GitHub release.
    expect(commands.indexOf('vlr finalize --record release/meta/prepare.json')).toBeGreaterThan(
      commands.indexOf('vlr github-release'),
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
