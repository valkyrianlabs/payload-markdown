#!/usr/bin/env node
/**
 * Plain-Node export smoke test for the built package (run after `pnpm build`).
 *
 * - `.`, `./render` and `./advanced` must import in plain Node (no bundler).
 * - The `./render` module graph must contain no CSS and no React/Next/Payload
 *   UI imports.
 * - `./server` and `./client` are bundler-only (CSS side-effect import, React
 *   client components); they must resolve, but are not imported here.
 * - `./styles.css` must resolve to a CSS file.
 *
 * Exits non-zero on failure. Uses the package's self-reference, so it checks
 * the `exports` map exactly as a consumer sees it.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE = '@valkyrianlabs/payload-markdown'
const FORBIDDEN_BARE_IMPORTS = /^(?:react|react-dom|next|@payloadcms\/ui)(?:\/|$)/

const failures = []
const ok = (message) => console.log(`ok   ${message}`)
const fail = (message) => {
  failures.push(message)
  console.log(`FAIL ${message}`)
}

for (const subpath of ['', '/render', '/advanced']) {
  const specifier = `${PACKAGE}${subpath}`

  try {
    const module = await import(specifier)
    const names = Object.keys(module)

    if (names.length === 0) fail(`${specifier} has no exports`)
    else ok(`import ${specifier} (${names.length} exports)`)
  } catch (error) {
    fail(`import ${specifier}: ${error?.code ?? ''} ${error?.message ?? error}`)
  }
}

try {
  const { renderMarkdown } = await import(`${PACKAGE}/render`)
  const result = await renderMarkdown('# Hello\n\n:::callout\nBody\n:::')

  if (!result.html.includes('<h1 id="hello"') || result.headings[0]?.id !== 'hello')
    fail(`renderMarkdown output unexpected: ${JSON.stringify(result.html.slice(0, 120))}`)
  else ok('renderMarkdown renders in plain Node')
} catch (error) {
  fail(`renderMarkdown: ${error?.message ?? error}`)
}

/** Static walk of relative ESM imports starting at `entry`. */
function collectModuleGraph(entry) {
  const seen = new Set()
  const bare = new Set()
  const queue = [entry]
  const pattern =
    /(?<![\w$.])(?:import|export)\s[^'";]*?\sfrom\s*['"]([^'"]+)['"]|(?<![\w$.])import\s*['"]([^'"]+)['"]|(?<![\w$.])import\(\s*['"]([^'"]+)['"]\s*\)/g

  while (queue.length > 0) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)

    if (!file.endsWith('.js')) continue

    const source = fs.readFileSync(file, 'utf8')

    for (const match of source.matchAll(pattern)) {
      const specifier = match[1] ?? match[2] ?? match[3]

      if (specifier.startsWith('.')) queue.push(path.resolve(path.dirname(file), specifier))
      else bare.add(specifier)
    }
  }

  return { bare: [...bare].sort(), files: [...seen].sort() }
}

const renderEntry = fileURLToPath(import.meta.resolve(`${PACKAGE}/render`))
const graph = collectModuleGraph(renderEntry)
const cssFiles = graph.files.filter((file) => !file.endsWith('.js'))
const forbidden = graph.bare.filter((specifier) => FORBIDDEN_BARE_IMPORTS.test(specifier))

if (cssFiles.length > 0) fail(`./render imports non-JS files: ${cssFiles.join(', ')}`)
else ok(`./render graph: ${graph.files.length} modules, no CSS`)

if (forbidden.length > 0) fail(`./render imports UI packages: ${forbidden.join(', ')}`)
else ok(`./render graph: no React/Next/Payload UI (${graph.bare.length} bare imports)`)

// Detector self-check: the RSC entry is known to import CSS and React.
const serverGraph = collectModuleGraph(fileURLToPath(import.meta.resolve(`${PACKAGE}/server`)))

if (!serverGraph.files.some((file) => file.endsWith('.css')) || !serverGraph.bare.includes('react'))
  fail('module graph detector did not see the CSS/React imports of ./server')
else ok('module graph detector sees CSS and React in ./server')

for (const subpath of ['/server', '/client', '/styles.css']) {
  try {
    const resolved = fileURLToPath(import.meta.resolve(`${PACKAGE}${subpath}`))

    if (!fs.existsSync(resolved)) fail(`${PACKAGE}${subpath} resolves to a missing file`)
    else ok(`resolve ${PACKAGE}${subpath} (bundler-only, not imported)`)
  } catch (error) {
    fail(`resolve ${PACKAGE}${subpath}: ${error?.message ?? error}`)
  }
}

if (failures.length > 0) {
  console.log(`\n${failures.length} export smoke failure(s)`)
  process.exit(1)
}
