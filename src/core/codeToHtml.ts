import { createHighlighter, type ShikiTransformer } from 'shiki'

import type { CodeBlockOptions } from './types.js'

export const DEFAULT_CODE_LANG = 'text'
export const DEFAULT_CODE_THEME = 'github-dark'

const highlighterCache = new Map<string, ReturnType<typeof createHighlighter>>()

function getHighlighter(theme: string) {
  const existing = highlighterCache.get(theme)
  if (existing) return existing

  const created = createHighlighter({
    langs: ['cpp', 'java', 'js', 'ts', 'json', 'python', 'rust', 'html', 'css', 'yaml', 'sql'],
    themes: [theme],
  })

  highlighterCache.set(theme, created)
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

  // Width reserved for the number column itself.
  // 1 digit: 1.25rem
  // 2 digits: 1.75rem
  // 3 digits: 2.25rem
  // etc.
  const numberWidthRem = 1.25 + (digits - 1) * 0.5

  // Small gap between line numbers and code text.
  const gapRem = 0.75

  // Total left inset for each rendered line.
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

/**
 * Builds the Shiki transformer pipeline used to normalize and enhance
 * rendered fenced code blocks.
 */
function buildTransformers(
  { highlightLines = false, lineNumbers = true, prettyCodeBlocks = true }: CodeBlockOptions,
  totalLines: number,
): ShikiTransformer[] {
  const transformers: ShikiTransformer[] = []
  const usePrettyCodeBlocks = prettyCodeBlocks || highlightLines || lineNumbers
  const metrics = getLineNumberMetrics(totalLines)

  transformers.push({
    pre(node) {
      if (!usePrettyCodeBlocks) return

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
      if (!usePrettyCodeBlocks) return

      node.properties.style = mergeStyle(node.properties.style, [
        'display: block',
        'padding: 0',
        'margin: 0',
      ])

      if (node.children)
        node.children = node.children.filter((child) => {
          if (child.type !== 'text') return true
          return child.value.trim().length > 0
        })
    },

    line(node, line) {
      const isEmptyLine = node.children.length === 0
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
              `width: ${metrics.numberWidthRem}rem`,
              'text-align: right',
              'color: #7c8596',
              'opacity: 0.8',
              'user-select: none',
              'pointer-events: none',
              'font-variant-numeric: tabular-nums',
              'font-feature-settings: "tnum"',
            ].join('; '),
          },
          tagName: 'span',
        })
      }

      if (isEmptyLine) {
        node.children.push({
          type: 'element',
          children: [{ type: 'text', value: '' }],
          properties: {
            class: 'md-empty-line',
            style: [
              'display: inline-block',
              'width: 0',
              'height: 1em',
              'overflow: hidden',
              'vertical-align: top',
              'user-select: none',
              'pointer-events: none',
            ].join('; '),
          },
          tagName: 'span',
        })
      }

      if (usePrettyCodeBlocks || lineNumbers)
        node.properties.style = mergeStyle(node.properties.style, styleBits)

      if (!highlightLines && typeof node.properties.style === 'string') {
        const cleaned = stripBackgroundStyles(node.properties.style)
        node.properties.style = cleaned || undefined
      }
    },

    span(node) {
      if (!highlightLines && typeof node.properties.style === 'string') {
        const cleaned = stripBackgroundStyles(node.properties.style)
        node.properties.style = cleaned || undefined
      }
    },
  })

  return transformers
}

export async function codeToHtml(code: string, options: CodeBlockOptions = {}) {
  const lang = options.lang?.trim() || DEFAULT_CODE_LANG
  const theme = options.theme?.trim() || DEFAULT_CODE_THEME

  const highlighter = await getHighlighter(theme)
  const normalizedCode = code.replace(/\n+$/, '')
  const totalLines = countLines(normalizedCode)
  const transformers = buildTransformers(options, totalLines)

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
