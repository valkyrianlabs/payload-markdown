import type { Element, ElementContent, Text } from 'hast'

import {
  bundledLanguagesInfo,
  bundledThemes,
  createHighlighter,
  type HighlighterGeneric,
  type ShikiTransformer,
} from 'shiki'

import type { CodeBlockOptions } from '../types/core.js'

/**
 * Per-line tokenization budget passed to Shiki. Shiki's default (500 ms) is meant for
 * interactive use: when a line takes longer (the first tokenization also compiles the
 * grammar, and a busy server makes that slow), Shiki silently emits the rest of the line
 * as one untokenized span, so the same code renders highlighted on one request and
 * partly plain on another. Server rendering is cached and must be deterministic, so the
 * budget only guards against pathological grammars.
 */
export const SHIKI_TOKENIZE_TIME_LIMIT_MS = 10_000

export const DEFAULT_CODE_LANG = 'text'
export const DEFAULT_CODE_THEME = 'github-dark'
export const DEFAULT_CODE_LANGS: readonly string[] = [
  'cpp',
  'java',
  'js',
  'ts',
  'jsx',
  'tsx',
  'json',
  'python',
  'rust',
  'html',
  'css',
  'yaml',
  'sql',
]

/** Fence languages Shiki renders as plain text without loading a grammar. */
const PLAIN_TEXT_LANGS = new Set(['plain', 'plaintext', 'text', 'txt'])

const BUNDLED_LANGUAGE_NAMES = new Set(
  bundledLanguagesInfo.flatMap((language) => [language.id, ...(language.aliases ?? [])]),
)

type Highlighter = HighlighterGeneric<string, string>

const highlighterCache = new Map<string, Promise<Highlighter>>()

function getHighlighterCacheKey(theme: string, langs: readonly string[]) {
  return `${theme}::${[...langs].sort().join(',')}`
}

function getHighlighter(theme: string, langs: readonly string[]): Promise<Highlighter> {
  const cacheKey = getHighlighterCacheKey(theme, langs)
  const existing = highlighterCache.get(cacheKey)
  if (existing) return existing

  const created = createHighlighter({
    langs: [...langs],
    themes: [theme],
  }) as Promise<Highlighter>

  highlighterCache.set(cacheKey, created)

  // Never keep a rejected promise: the next render retries instead of
  // failing for the life of the process (CORE-11).
  created.catch(() => {
    if (highlighterCache.get(cacheKey) === created) highlighterCache.delete(cacheKey)
  })

  return created
}

export type ResolvedHighlighterConfig = {
  langs: string[]
  theme: string
  warnings: string[]
}

/**
 * Validates the configured Shiki theme and languages against the bundled
 * sets. Unknown entries fall back (theme) or are skipped (langs) with a
 * diagnostic, so one bad config value cannot break every code block.
 * Language names are matched case-insensitively.
 */
export function resolveHighlighterConfig(
  theme: string | undefined,
  langs: readonly string[] | undefined,
): ResolvedHighlighterConfig {
  const warnings: string[] = []
  const requestedTheme = theme?.trim() || DEFAULT_CODE_THEME
  let resolvedTheme = requestedTheme

  if (!Object.hasOwn(bundledThemes, requestedTheme)) {
    warnings.push(
      `Unknown Shiki theme "${requestedTheme}". Falling back to "${DEFAULT_CODE_THEME}".`,
    )
    resolvedTheme = DEFAULT_CODE_THEME
  }

  const resolvedLangs: string[] = []

  for (const lang of langs ?? DEFAULT_CODE_LANGS) {
    if (typeof lang !== 'string' || !lang.trim()) continue

    const trimmed = lang.trim()
    const normalized = BUNDLED_LANGUAGE_NAMES.has(trimmed) ? trimmed : trimmed.toLowerCase()

    if (PLAIN_TEXT_LANGS.has(normalized)) continue

    if (!BUNDLED_LANGUAGE_NAMES.has(normalized)) {
      warnings.push(`Unknown Shiki language "${trimmed}" in code langs. It was ignored.`)
      continue
    }

    if (!resolvedLangs.includes(normalized)) resolvedLangs.push(normalized)
  }

  return { langs: resolvedLangs, theme: resolvedTheme, warnings }
}

/**
 * Maps a fence language to a loaded Shiki language: exact match, then
 * case-insensitive match (aliases such as `js`/`javascript` are loaded
 * together). Anything else renders as plain text with a diagnostic (CORE-14).
 */
export function resolveFenceLanguage(
  lang: string | undefined,
  loadedLanguages: ReadonlySet<string>,
): { lang: string; warning?: string } {
  const raw = lang?.trim()

  if (!raw) return { lang: DEFAULT_CODE_LANG }
  if (loadedLanguages.has(raw)) return { lang: raw }

  const lower = raw.toLowerCase()

  if (PLAIN_TEXT_LANGS.has(lower)) return { lang: DEFAULT_CODE_LANG }
  if (loadedLanguages.has(lower)) return { lang: lower }

  return {
    lang: DEFAULT_CODE_LANG,
    warning: `Code block language "${raw}" is not loaded, so it is rendered as plain text. Add it to code.langs to highlight it.`,
  }
}

function countLines(code: string): number {
  return code.length === 0 ? 1 : code.split('\n').length
}

function resolveCodeBlockOptions(
  options: CodeBlockOptions,
): CodeBlockOptions & Required<Pick<CodeBlockOptions, 'enhancedCodeBlocks' | 'lineNumbers'>> {
  const enhancedCodeBlocks = options.enhancedCodeBlocks ?? true

  return {
    ...options,
    enhancedCodeBlocks,
    lineNumbers: enhancedCodeBlocks ? (options.lineNumbers ?? true) : false,
  }
}

function isText(node: ElementContent): node is Text {
  return node.type === 'text'
}

function isElement(node: ElementContent): node is Element {
  return node.type === 'element'
}

function isEmptyText(node: Text): boolean {
  return node.value === ''
}

function isVisuallyEmptyLine(node: Element): boolean {
  if (node.children.length === 0) return true

  return node.children.every((child) => {
    if (isText(child)) return isEmptyText(child)

    if (isElement(child)) {
      if (child.children.length === 0) return true

      return child.children.every((grandchild) => {
        if (isText(grandchild)) return isEmptyText(grandchild)
        return false
      })
    }

    return false
  })
}

function mergeClassNames(existing: unknown, additions: string[]): string[] {
  const current =
    typeof existing === 'string'
      ? existing.split(/\s+/).filter(Boolean)
      : Array.isArray(existing)
        ? existing.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        : []

  return [...new Set([...additions, ...current])]
}

function setMergedClassNames(node: { properties: Record<string, unknown> }, additions: string[]) {
  const merged = mergeClassNames(node.properties.className ?? node.properties.class, additions)

  node.properties.className = merged
  node.properties.class = merged.join(' ')
}

function makeClassElement(className: string, text: string): Element {
  return {
    type: 'element',
    children: [{ type: 'text', value: text }],
    properties: {
      class: className,
      className: [className],
    },
    tagName: 'span',
  }
}

/**
 * Builds the Shiki transformer pipeline used to normalize and enhance
 * rendered fenced code blocks.
 */
function buildTransformers(
  {
    enhancedCodeBlocks,
    lineNumbers,
  }: Required<Pick<CodeBlockOptions, 'enhancedCodeBlocks' | 'lineNumbers'>>,
  totalLines: number,
): ShikiTransformer[] {
  const transformers: ShikiTransformer[] = []
  const useEnhanced = enhancedCodeBlocks
  const digits = Math.max(1, String(totalLines).length)

  transformers.push({
    pre(node) {
      if (!useEnhanced) return
      setMergedClassNames(node, ['md-code-enhanced'])
    },

    code(node) {
      if (!useEnhanced) return

      if (node.children) {
        node.children = node.children.filter((child) => {
          if (child.type !== 'text') return true

          // Shiki inserts raw newline separator text nodes between rendered line spans.
          // Those create fake blank rows once line display is class-driven.
          return !/^\r?\n$/.test(child.value)
        })
      }
    },

    line(node, line) {
      if (!useEnhanced && !lineNumbers) return

      const isEmptyLine = isVisuallyEmptyLine(node)

      if (lineNumbers) setMergedClassNames(node, ['md-line', `md-line-digits-${digits}`])
      else if (useEnhanced) setMergedClassNames(node, ['md-line', 'md-line-no-numbers'])

      if (lineNumbers) node.children.unshift(makeClassElement('md-line-number', String(line)))

      if (isEmptyLine) {
        const lineNumberNode = lineNumbers ? node.children[0] : null

        node.children = [
          ...(lineNumberNode ? [lineNumberNode] : []),
          makeClassElement('md-empty-line', '\u00A0'),
        ]
      }
    },
  })

  return transformers
}

export type HighlightCodeResult = {
  html: string
  /** The subset of `warnings` that is informational (a fence language that is not loaded). */
  info?: string[]
  warnings: string[]
}

async function loadHighlighter(
  options: CodeBlockOptions,
): Promise<{ highlighter: Highlighter; theme: string; warnings: string[] }> {
  const config = resolveHighlighterConfig(options.theme, options.langs)

  try {
    return {
      highlighter: await getHighlighter(config.theme, config.langs),
      theme: config.theme,
      warnings: config.warnings,
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)

    return {
      highlighter: await getHighlighter(DEFAULT_CODE_THEME, DEFAULT_CODE_LANGS),
      theme: DEFAULT_CODE_THEME,
      warnings: [
        ...config.warnings,
        `Failed to load the configured Shiki highlighter (${reason}). Falling back to the default theme and languages.`,
      ],
    }
  }
}

/**
 * Highlights one fenced code block and reports configuration or language
 * fallbacks as warnings instead of throwing.
 */
export async function highlightCode(
  code: string,
  options: CodeBlockOptions = {},
): Promise<HighlightCodeResult> {
  const resolvedOptions = resolveCodeBlockOptions(options)
  const { highlighter, theme, warnings } = await loadHighlighter(resolvedOptions)
  const fence = resolveFenceLanguage(resolvedOptions.lang, new Set(highlighter.getLoadedLanguages()))
  const normalizedCode = code.replace(/\n+$/, '')
  const totalLines = countLines(normalizedCode)
  const transformers = buildTransformers(resolvedOptions, totalLines)

  if (fence.warning) warnings.push(fence.warning)

  return {
    ...(fence.warning ? { info: [fence.warning] } : {}),
    html: highlighter.codeToHtml(normalizedCode, {
      lang: fence.lang,
      theme,
      tokenizeTimeLimit: SHIKI_TOKENIZE_TIME_LIMIT_MS,
      transformers,
    }),
    warnings,
  }
}

export async function codeToHtml(code: string, options: CodeBlockOptions = {}): Promise<string> {
  return (await highlightCode(code, options)).html
}
