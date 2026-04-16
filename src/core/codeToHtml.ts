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

function mergeStyle(existing: unknown, additions: string[]): string {
  const existingStyle = typeof existing === 'string' ? existing.trim() : ''
  return [existingStyle, ...additions.filter(Boolean)].filter(Boolean).join('; ')
}

function stripBackgroundStyles(style: string): string {
  return style
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const lower = part.toLowerCase()
      return !lower.startsWith('background:') && !lower.startsWith('background-color:')
    })
    .join('; ')
}

function getLineNumberMetrics(totalLines: number) {
  const digits = Math.max(1, String(totalLines).length)
  const numberWidthRem = 1.25 + (digits - 1) * 0.5
  const gapRem = 0.75
  const paddingLeftRem = numberWidthRem + gapRem

  return {
    digits,
    gapRem,
    numberWidthRem,
    paddingLeftRem,
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
  const metrics = getLineNumberMetrics(totalLines)

  transformers.push({
    pre(node) {
      if (!useEnhanced) return

      const existing =
        typeof node.properties.style === 'string'
          ? stripBackgroundStyles(node.properties.style)
          : ''

      node.properties.style = mergeStyle(existing, [
        'background: #18191c',
        'padding: 0',
        'overflow-x: auto',
        'position: relative',
        'border: 1px solid rgba(255,255,255,0.06)',
        'box-shadow: 0 2px 12px rgba(0,0,0,0.35)',
      ])
    },

    code(node) {
      if (!useEnhanced) return

      node.properties.style = mergeStyle(node.properties.style, [
        'display: block',
        'padding: 0',
        'margin: 0',
      ])

      if (node.children) {
        node.children = node.children.filter((child) => {
          if (child.type !== 'text') return true

          // Shiki inserts raw newline separator text nodes between rendered line spans.
          // Those create fake blank rows once each line is display:block.
          // Remove only those separators, not actual line content.
          return !/^\r?\n$/.test(child.value)
        })
      }
    },

    line(node, line) {
      if (!useEnhanced && !lineNumbers) return

      const isEmptyLine = isVisuallyEmptyLine(node)
      const styleBits = ['display: block', 'position: relative', 'white-space: pre']

      if (lineNumbers) {
        styleBits.push(`padding-left: ${metrics.paddingLeftRem}rem`)

        node.children.unshift({
          type: 'element',
          children: [{ type: 'text', value: String(line) }],
          properties: {
            class: 'md-line-number',
            style: [
              'position: absolute',
              'left: 0',
              'top: 0',
              `width: ${metrics.numberWidthRem}rem`,
              'text-align: right',
              'color: #7c8596',
              'opacity: 0.8',
              'user-select: none',
              'pointer-events: none',
              'font-variant-numeric: tabular-nums',
              'font-feature-settings: "tnum"',
              'line-height: inherit',
            ].join('; '),
          },
          tagName: 'span',
        })
      } else if (useEnhanced) {
        styleBits.push('padding-left: .75rem')
      }

      if (isEmptyLine) {
        const lineNumberNode = lineNumbers ? node.children[0] : null

        node.children = [
          ...(lineNumberNode ? [lineNumberNode] : []),
          {
            type: 'element',
            children: [{ type: 'text', value: '\u00A0' }],
            properties: {
              class: 'md-empty-line',
              style: [
                'display: inline-block',
                'min-height: 1em',
                'line-height: inherit',
                'visibility: hidden',
                'user-select: none',
                'pointer-events: none',
              ].join('; '),
            },
            tagName: 'span',
          },
        ]
      }

      if (useEnhanced || lineNumbers)
        node.properties.style = mergeStyle(node.properties.style, styleBits)

      if (useEnhanced && typeof node.properties.style === 'string') {
        const cleaned = stripBackgroundStyles(node.properties.style)
        node.properties.style = cleaned || undefined
      }
    },

    span(node) {
      if (useEnhanced && typeof node.properties.style === 'string') {
        const cleaned = stripBackgroundStyles(node.properties.style)
        node.properties.style = cleaned || undefined
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
