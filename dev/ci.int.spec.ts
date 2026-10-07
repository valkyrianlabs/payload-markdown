import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }

const containerfile = fs.readFileSync('ci/Containerfile', 'utf8')
const lockfile = fs.readFileSync('pnpm-lock.yaml', 'utf8')

describe('CI container (ci/)', () => {
  it('matches the Playwright, Node and pnpm versions the project uses', () => {
    const playwright = lockfile.match(/^ {2}playwright@(\d+\.\d+\.\d+):$/m)?.[1]
    const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim()

    expect(playwright).toBeDefined()
    expect(containerfile).toMatch(
      new RegExp(`^FROM mcr\\.microsoft\\.com/playwright:v${playwright}-noble@sha256:[0-9a-f]{64}$`, 'm'),
    )
    expect(containerfile.match(/^ARG NODE_VERSION=(\S+)$/m)?.[1]).toMatch(new RegExp(`^${nvmrc}(\\.|$)`))
    expect(`pnpm@${containerfile.match(/^ARG PNPM_VERSION=(\S+)$/m)?.[1]}`).toBe(packageJson.packageManager)
  })

  it('keeps the host broker strict', () => {
    const broker = fs.readFileSync('ci/host/ci-host', 'utf8')
    const sudoers = fs.readFileSync('ci/host/sudoers', 'utf8')

    // One sudoers rule, for the broker's "service" interface only.
    expect(sudoers.split('\n').filter((line) => /NOPASSWD/.test(line))).toEqual([
      'gh-runner ALL=(root) NOPASSWD: /usr/local/sbin/ci-host service *',
    ])
    // No shell evaluation of caller input anywhere in the broker.
    expect(broker).not.toMatch(/\beval\b|sh -c|bash -c/)
    expect(broker).toContain('[[ "$unit" =~ ^[a-z0-9][a-z0-9-]{0,62}$ ]]')

    for (const file of ['ci/host/ci-host', 'ci/run-ci', 'ci/run-playwright', 'ci/bootstrap'])
      expect(spawnSync('bash', ['-n', file]).status).toBe(0)
  })
})
