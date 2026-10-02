import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }

const built = fs.existsSync(path.resolve('dist/exports/render.js'))

describe('package exports', () => {
  it('declares every subpath in exports and publishConfig.exports alike', () => {
    expect(Object.keys(packageJson.exports)).toEqual(
      expect.arrayContaining(['.', './advanced', './client', './render', './server', './styles.css']),
    )
    expect(packageJson.publishConfig.exports).toEqual(packageJson.exports)
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
