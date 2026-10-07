#!/usr/bin/env node
/**
 * Verifies the two npm distributions of this package, @valkyrianlabs/payload-markdown and its
 * `[[npm.aliases]]` name payload-markdown, the way consumers install them.
 *
 *   node scripts/verify-npm-packages.mjs [--release <dir>]   tarballs vlr built (default: release/)
 *   node scripts/verify-npm-packages.mjs --pack              rehearsal: pack dist/ now (run `pnpm build`
 *                                                            first) and derive the alias like vlr does
 *
 * Checks, failing with a non-zero exit:
 * - both tarballs hold the same files with the same bytes and modes, except package.json (only
 *   `name` differs) and the alias's `rewrite` members (only the package name differs);
 * - every export (root, /server, /client, /render, /advanced, /mcp, /styles.css,
 *   /directive-spec.json) works from both names in plain Node (scripts/smoke-exports.mjs per name),
 *   and admin component paths use the installed name;
 * - the types of every subpath resolve from both names (tsc, `bundler` and `nodenext`);
 * - the `payload-markdown` bin runs from both (`--version`, `skill install`, `skill check`).
 *
 * Packages are unpacked into build/npm-verify/node_modules; their dependencies resolve from this
 * repository's node_modules. Prints an `npm pack --dry-run`-style summary of both packages.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const work = path.join(root, 'build/npm-verify')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const canonical = manifest.name
const version = manifest.version
const alias = readAlias()

const failures = []
const ok = (message) => console.log(`ok   ${message}`)
const fail = (message) => {
  failures.push(message)
  console.log(`FAIL ${message}`)
}

/** The `[[npm.aliases]]` entry of release.toml (name and rewrite members). */
function readAlias() {
  const toml = fs.readFileSync(path.join(root, 'release.toml'), 'utf8')
  const match = toml.match(/\[\[npm\.aliases\]\]\s*\nname\s*=\s*"([^"]+)"\s*\nrewrite\s*=\s*\[([^\]]*)\]/)
  if (!match) throw new Error('release.toml has no [[npm.aliases]] entry with name and rewrite')

  return { name: match[1], rewrite: [...match[2].matchAll(/"([^"]+)"/g)].map((m) => m[1]) }
}

/** npm's pack file name: `@scope/pkg` 1.2.3 -> `scope-pkg-1.2.3.tgz` (as vlr names it too). */
const tarballName = (name) => `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`

const run = (command, args, options = {}) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options })

/** Same rename as vlr: only the top-level `"name"`, formatting untouched. */
function renameManifest(text) {
  const pattern = new RegExp(`("name"\\s*:\\s*)${JSON.stringify(canonical).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`, 'g')
  const count = text.match(pattern)?.length ?? 0
  if (count !== 1) throw new Error(`expected exactly one "name": "${canonical}" in package.json, found ${count}`)

  return text.replace(pattern, (_match, prefix) => `${prefix}${JSON.stringify(alias.name)}`)
}

/** Rehearsal: pack the built package and derive the alias tarball like `vlr build-npm`. */
function packLocally(dir) {
  if (!fs.existsSync(path.join(root, 'dist/index.js'))) throw new Error('dist/ is missing; run `pnpm build` first')

  fs.rmSync(dir, { force: true, recursive: true })
  fs.mkdirSync(dir, { recursive: true })
  run('npm', ['pack', '--ignore-scripts', '--pack-destination', dir], { cwd: root })

  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-alias-'))
  run('tar', ['-xzf', path.join(dir, tarballName(canonical)), '-C', stage])
  const pkg = path.join(stage, 'package')
  fs.writeFileSync(path.join(pkg, 'package.json'), renameManifest(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8')))

  for (const member of alias.rewrite) {
    const file = path.join(stage, member)
    const text = fs.readFileSync(file, 'utf8')
    if (!text.includes(canonical)) throw new Error(`${member} does not contain ${canonical}`)
    fs.writeFileSync(file, text.split(canonical).join(alias.name))
  }

  run('npm', ['pack', '--ignore-scripts', '--pack-destination', dir], { cwd: pkg })
  fs.rmSync(stage, { force: true, recursive: true })

  return dir
}

/** Every file under `dir` (POSIX paths, sorted). */
function listFiles(dir, prefix = '') {
  return fs
    .readdirSync(path.join(dir, prefix), { withFileTypes: true })
    .flatMap((entry) => {
      const child = prefix ? `${prefix}/${entry.name}` : entry.name
      return entry.isDirectory() ? listFiles(dir, child) : [child]
    })
    .sort()
}

function unpack(tarball, name) {
  const target = path.join(work, 'node_modules', name)
  fs.rmSync(target, { force: true, recursive: true })
  fs.mkdirSync(target, { recursive: true })
  run('tar', ['-xzf', tarball, '-C', target, '--strip-components=1'])

  return target
}

function summarize(name, tarball, dir) {
  const files = listFiles(dir)
  const unpacked = files.reduce((total, file) => total + fs.statSync(path.join(dir, file)).size, 0)
  const integrity = `sha512-${createHash('sha512').update(fs.readFileSync(tarball)).digest('base64')}`

  console.log(`\n  ${name}@${version}  ${path.relative(root, tarball)}`)
  console.log(`    files: ${files.length}  unpacked: ${(unpacked / 1024).toFixed(1)} kB  packed: ${(fs.statSync(tarball).size / 1024).toFixed(1)} kB`)
  console.log(`    integrity: ${integrity}`)
}

function compare(canonicalDir, aliasDir) {
  const left = listFiles(canonicalDir)
  const right = listFiles(aliasDir)

  if (left.join('\n') !== right.join('\n')) {
    const extra = right.filter((file) => !left.includes(file))
    const missing = left.filter((file) => !right.includes(file))
    fail(`file lists differ (alias extra: ${extra.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'})`)
    return
  }

  const rewrite = new Set(alias.rewrite.map((member) => member.replace(/^package\//, '')))
  let differing = 0

  for (const file of left) {
    const a = fs.readFileSync(path.join(canonicalDir, file))
    const b = fs.readFileSync(path.join(aliasDir, file))
    const modeA = fs.statSync(path.join(canonicalDir, file)).mode & 0o777
    const modeB = fs.statSync(path.join(aliasDir, file)).mode & 0o777

    if (modeA !== modeB) fail(`${file}: mode ${modeB.toString(8)} differs from ${modeA.toString(8)}`)

    if (file === 'package.json') {
      const expected = { ...JSON.parse(a.toString('utf8')), name: alias.name }
      if (JSON.stringify(JSON.parse(b.toString('utf8'))) !== JSON.stringify(expected))
        fail('package.json differs in more than "name"')
      differing++
    } else if (rewrite.has(file)) {
      if (b.toString('utf8') !== a.toString('utf8').split(canonical).join(alias.name))
        fail(`${file} differs in more than the package name`)
      differing++
    } else if (!a.equals(b)) {
      fail(`${file} differs between the packages`)
    }
  }

  ok(`${left.length} files; identical except package.json name and ${[...rewrite].join(', ')} (${differing} renamed)`)
}

function smoke(name) {
  const result = spawnSync(process.execPath, [path.join(work, 'smoke-exports.mjs')], {
    cwd: work,
    encoding: 'utf8',
    env: { ...process.env, PAYLOAD_MARKDOWN_SMOKE_PACKAGE: name },
  })

  if (result.status === 0) ok(`exports smoke from ${name} (${result.stdout.split('\n').filter((l) => l.startsWith('ok')).length} checks)`)
  else fail(`exports smoke from ${name}:\n${result.stdout}${result.stderr}`)
}

function checkBin(name, dir) {
  const bin = path.join(dir, 'bin/payload-markdown.mjs')
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-bin-'))

  try {
    const printed = run(process.execPath, [bin, '--version']).trim()
    if (printed !== version) fail(`${name} bin --version printed ${printed}`)
    run(process.execPath, [bin, 'skill', 'install', '--agent', 'all', '--dir', project])
    run(process.execPath, [bin, 'skill', 'check', '--dir', project])
    ok(`${name} bin: --version, skill install, skill check`)
  } catch (error) {
    fail(`${name} bin: ${error.stderr || error.message}`)
  } finally {
    fs.rmSync(project, { force: true, recursive: true })
  }
}

const SUBPATH_SYMBOLS = {
  '': 'payloadMarkdown',
  '/advanced': 'vlMdConfig',
  '/client': 'PayloadMarkdownField',
  '/mcp': 'withPayloadMarkdownMcp',
  '/render': 'renderMarkdown',
  '/server': 'MarkdownRenderer',
}

function checkTypes(names) {
  const lines = ['type IsAny<T> = 0 extends 1 & T ? true : false', '']

  names.forEach((name, index) => {
    for (const [subpath, symbol] of Object.entries(SUBPATH_SYMBOLS)) {
      const local = `${symbol}${index}`
      lines.push(
        `import { ${symbol} as ${local} } from '${name}${subpath}'`,
        `export const ${local}Typed: IsAny<typeof ${local}> = false`,
      )
    }
  })
  fs.writeFileSync(path.join(work, 'types.ts'), `${lines.join('\n')}\n`)

  for (const [module, moduleResolution] of [
    ['esnext', 'bundler'],
    ['nodenext', 'nodenext'],
  ]) {
    const config = {
      compilerOptions: { jsx: 'react-jsx', module, moduleResolution, noEmit: true, skipLibCheck: true, strict: true, target: 'es2022', types: [] },
      files: ['types.ts'],
    }
    fs.writeFileSync(path.join(work, 'tsconfig.json'), JSON.stringify(config, null, 2))
    const result = spawnSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', work], { encoding: 'utf8' })

    if (result.status === 0) ok(`types of ${Object.keys(SUBPATH_SYMBOLS).length} subpaths from ${names.join(' and ')} (${moduleResolution})`)
    else fail(`types (${moduleResolution}):\n${result.stdout}${result.stderr}`)
  }
}

const args = process.argv.slice(2)
const source = args.includes('--pack')
  ? packLocally(path.join(root, 'build/npm-packages'))
  : path.resolve(root, args[args.indexOf('--release') + 1] && args.includes('--release') ? args[args.indexOf('--release') + 1] : 'release')
const names = [canonical, alias.name]
const tarballs = names.map((name) => path.join(source, tarballName(name)))

for (const tarball of tarballs) if (!fs.existsSync(tarball)) throw new Error(`missing ${tarball} (run \`vlr build-npm\` or use --pack)`)

fs.rmSync(work, { force: true, recursive: true })
fs.mkdirSync(work, { recursive: true })
// Its own package scope, so the scoped name cannot self-resolve to this repository.
fs.writeFileSync(path.join(work, 'package.json'), '{ "name": "npm-verify", "private": true, "type": "module" }\n')
fs.copyFileSync(path.join(root, 'scripts/smoke-exports.mjs'), path.join(work, 'smoke-exports.mjs'))

const dirs = names.map((name, index) => unpack(tarballs[index], name))

console.log(`npm packages (${source === path.join(root, 'build/npm-packages') ? 'rehearsal pack' : path.relative(root, source)}):`)
names.forEach((name, index) => summarize(name, tarballs[index], dirs[index]))
console.log('')

compare(dirs[0], dirs[1])
names.forEach((name, index) => {
  smoke(name)
  checkBin(name, dirs[index])
})
checkTypes(names)

if (failures.length > 0) {
  console.log(`\n${failures.length} package verification failure(s)`)
  process.exit(1)
}
