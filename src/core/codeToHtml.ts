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

/**
 * Builds the Shiki transformer pipeline used to normalize and enhance
 * rendered fenced code blocks.
 *
 * This is responsible for optional features such as:
 * - line numbers
 * - per-line highlight stripping
 * - empty-line layout preservation
 * - pretty code block structural cleanup
 */
function buildTransformers({
  highlightLines = false,
  lineNumbers = true,
  prettyCodeBlocks = true,
}: CodeBlockOptions): ShikiTransformer[] {
  const transformers: ShikiTransformer[] = []
  const usePrettyCodeBlocks = prettyCodeBlocks || highlightLines || lineNumbers

  transformers.push({
    pre(node) {
      if (!usePrettyCodeBlocks) return

      const existing =
        typeof node.properties.style === 'string'
          ? stripBackgroundStyles(node.properties.style)
          : ''

      node.properties.style = mergeStyle(existing, [
        'background: transparent',
        'padding: 0',
        'overflow-x: auto',
        'position: relative',
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
        styleBits.push('padding-left: 3rem')

        node.children.unshift({
          type: 'element',
          children: [{ type: 'text', value: String(line) }],
          properties: {
            class: 'md-line-number',
            style: [
              'position: absolute',
              'left: 0',
              'width: 2rem',
              'text-align: right',
              'color: #6b7280',
              'opacity: 0.65',
              'user-select: none',
              'pointer-events: none',
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
  const transformers = buildTransformers(options)

  try {
    return highlighter.codeToHtml(code, {
      lang,
      theme,
      transformers,
    })
  } catch {
    return highlighter.codeToHtml(code, {
      lang: DEFAULT_CODE_LANG,
      theme,
      transformers,
    })
  }
}
