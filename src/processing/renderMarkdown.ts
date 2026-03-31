import type { Element, Parent, Root, RootContent } from 'hast'
import type { Schema } from 'hast-util-sanitize'
import type { JSX } from 'react'
import type React from 'react'

import { fromHtml } from 'hast-util-from-html'
import { toString } from 'hast-util-to-string'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { codeToHtml, DEFAULT_CODE_THEME } from './codeToHtml.ts'

export type RenderMarkdownOptions = {
  theme?: string
}

export type RenderMarkdownResult = {
  html: string
  warnings: string[]
}

export type MarkdownRendererProps = {
  as?: keyof JSX.IntrinsicElements
  className?: string
  emptyFallback?: React.ReactNode
  errorFallback?: React.ReactNode
  markdown?: null | string
  options?: RenderMarkdownOptions
  wrapperClassName?: string
}

export const DEFAULT_MARKDOWN_CLASS_NAME =
  [
    'prose prose-neutral max-w-none',
    'prose-headings:scroll-mt-24',
    'prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border',
    'prose-code:before:content-none prose-code:after:content-none',
    'prose-img:rounded-xl',
    'dark:prose-invert',
  ].join(' ')

function extractCodeLanguage(
  className?: Array<number | string> | boolean | null | number | string,
): string | undefined {
  const classList = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? className.split(/\s+/)
      : []

  const languageClass = classList.find(
    (value): value is string => typeof value === 'string' && value.startsWith('language-'),
  )

  return languageClass?.replace(/^language-/, '') || undefined
}

function isElement(node: RootContent): node is Element {
  return node.type === 'element'
}

function isPreElement(node: RootContent): node is Element {
  return isElement(node) && node.tagName === 'pre'
}

function hasChildren(node: unknown): node is Parent {
  return Boolean(node && typeof node === 'object' && 'children' in node)
}

function findCodeChild(node: Element): Element | undefined {
  return node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code',
  )
}

function parseHtmlFragment(html: string): RootContent[] {
  const fragment = fromHtml(html, { fragment: true })
  return fragment.children
}

function rehypeShikiCodeBlocks(options: RenderMarkdownOptions = {}) {
  return async function transformer(tree: Root): Promise<void> {
    const work: Array<Promise<void>> = []

    visit(tree, 'element', (node, index, parent) => {
      if (typeof index !== 'number' || !hasChildren(parent) || !isPreElement(node)) return

      const codeNode = findCodeChild(node)
      if (!codeNode) return

      const code = toString(codeNode)
      const lang = extractCodeLanguage(codeNode.properties?.className)

      work.push(
        (async () => {
          const highlighted = await codeToHtml(code, {
            lang,
            theme: options.theme,
          })

          const replacementNodes = parseHtmlFragment(highlighted)
          parent.children.splice(index, 1, ...replacementNodes)
        })(),
      )
    })

    await Promise.all(work)
  }
}

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    div: [...(defaultSchema.attributes?.div ?? []), ['className'], ['style']],
    pre: [...(defaultSchema.attributes?.pre ?? []), ['className'], ['style'], ['tabindex']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className'], ['style']],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'span'],
}

export async function compileMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<RenderMarkdownResult> {
  const warnings: string[] = []

  try {
    const file = await unified()
    .use(remarkParse)
     .use(remarkGfm)
     .use(remarkRehype, {
      allowDangerousHtml: false,
    })
     .use(rehypeShikiCodeBlocks, {
      theme: options.theme || DEFAULT_CODE_THEME,
    })
     .use(rehypeSanitize, sanitizeSchema)
     .use(rehypeStringify)
     .process(markdown)

    return {
      html: String(file),
      warnings,
    }
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : 'Failed to render markdown.')

    return {
      html: '<p>Failed to render markdown.</p>',
      warnings,
    }
  }
}

export async function renderMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<RenderMarkdownResult> {
  return compileMarkdown(markdown, options)
}
