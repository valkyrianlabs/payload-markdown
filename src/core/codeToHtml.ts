import type { Element, ElementContent, Text } from 'hast'

import { createHighlighter, type ShikiTransformer } from 'shiki'

import type { CodeBlockOptions } from '../types/core.js'

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

const highlighterCache = new Map<string, ReturnType<typeof createHighlighter>>()

function getHighlighterCacheKey(theme: string, langs: readonly string[]) {
  return `${theme}::${[...langs].sort().join(',')}`
}

function getHighlighter(theme: string, langs: readonly string[]) {
  const cacheKey = getHighlighterCacheKey(theme, langs)
  const existing = highlighterCache.get(cacheKey)
  if (existing) return existing

  const created = createHighlighter({
    langs: [...langs],
    themes: [theme],
  })

  highlighterCache.set(cacheKey, created)
  return created
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

export async function codeToHtml(code: string, options: CodeBlockOptions = {}) {
  const resolvedOptions = resolveCodeBlockOptions(options)

  const lang = resolvedOptions.lang?.trim() || DEFAULT_CODE_LANG
  const langs = resolvedOptions.langs ?? DEFAULT_CODE_LANGS
  const theme = resolvedOptions.theme?.trim() || DEFAULT_CODE_THEME

  const highlighter = await getHighlighter(theme, langs)
  const normalizedCode = code.replace(/\n+$/, '')
  const totalLines = countLines(normalizedCode)
  const transformers = buildTransformers(resolvedOptions, totalLines)

  try {
    return highlighter.codeToHtml(normalizedCode, {
      lang,
      theme,
      transformers,
    })
  } catch {
    return highlighter.codeToHtml(normalizedCode, {
      lang: DEFAULT_CODE_LANG,
      theme,
      transformers,
    })
  }
}
