import type { Element, Parent, Root, RootContent } from 'hast'
import type { Schema } from 'hast-util-sanitize'

import { fromHtml } from 'hast-util-from-html'
import { toString } from 'hast-util-to-string'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import type { MarkdownConfig, RenderMarkdownOptions, RenderMarkdownResult } from '../types/core.js'

import { codeToHtml } from './codeToHtml.js'
import { rehypeApplyLayoutClasses } from './plugins/rehypeApplyLayoutClasses.js'
import { rehypeStripAuthoredInlineStyles } from './plugins/rehypeStripAuthoredInlineStyles.js'
import { remarkCompileLayouts } from './plugins/remarkCompileLayouts.js'
import { remarkLayoutDirectives } from './plugins/remarkLayoutDirectives.js'
import { remarkLiftLayoutDirectives } from './plugins/remarkLiftLayoutDirectives.js'

function extractCodeLanguage(
  className?: Array<number | string> | boolean | null | number | string  ,
): string | undefined {
  const classes =
    typeof className === 'string'
      ? className.split(/\s+/)
      : Array.isArray(className)
        ? className
        : []

  return classes
    .find((c): c is string => typeof c === 'string' && c.startsWith('language-'))
    ?.slice(9)
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
            ...options,
            lang
          })

          const replacementNodes = parseHtmlFragment(highlighted)
          parent.children.splice(index, 1, ...replacementNodes)
        })(),
      )
    })

    await Promise.all(work)
  }
}

type SanitizeAttributeValue = boolean | null | number | RegExp | string | undefined
type SanitizeAttributeDefinition = [string, ...SanitizeAttributeValue[]] | string

function getAttributeDefinitions(
  value: Schema['attributes'] extends infer A
    ? A extends Record<string, infer V>
      ? V
      : never
    : never,
): SanitizeAttributeDefinition[] {
  return (value as SanitizeAttributeDefinition[] | undefined) ?? []
}

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    a: [
      ...getAttributeDefinitions(defaultSchema.attributes?.a ?? []),
      'href',
      'target',
      'rel',
      'title',
    ],
    code: [...getAttributeDefinitions(defaultSchema.attributes?.code ?? []), 'className'],
    details: [
      ...getAttributeDefinitions(defaultSchema.attributes?.details ?? []),
      'dataDirective',
      'dataTitle',
      'dataVlLayout',
      'open',
    ],
    div: [
      ...getAttributeDefinitions(defaultSchema.attributes?.div ?? []),
      'dataDirective',
      'dataDirectiveBody',
      'dataDirectiveTitle',
      'dataTitle',
      'dataVariant',
      'dataVlLayout',
      'dataVlCellHeadingDepth',
    ],
    img: [
      ...getAttributeDefinitions(defaultSchema.attributes?.img ?? []),
      'src',
      'alt',
      'title',
      'width',
      'height',
    ],
    pre: [
      ...getAttributeDefinitions(defaultSchema.attributes?.pre ?? []),
      'className',
      'tabindex',
    ],
    section: [
      ...getAttributeDefinitions(defaultSchema.attributes?.section ?? []),
      'dataVlLayout',
      'dataVlCellHeadingDepth',
    ],
    span: [...getAttributeDefinitions(defaultSchema.attributes?.span ?? []), 'className', 'style'],
    summary: [...getAttributeDefinitions(defaultSchema.attributes?.summary ?? []), 'className'],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'a',
    'br',
    'details',
    'img',
    'section',
    'span',
    'summary',
  ],
}

export async function compileMarkdown(
  markdown: string,
  config: MarkdownConfig = {},
): Promise<RenderMarkdownResult> {
  const warnings: string[] = []

  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkLiftLayoutDirectives)
      .use(remarkCompileLayouts)
      .use(remarkLayoutDirectives)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStripAuthoredInlineStyles)
      .use(rehypeShikiCodeBlocks, config.options)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeApplyLayoutClasses, config)
      .use(rehypeStringify)
      .process(markdown)

    return {
      html: String(file),
      warnings: file.messages.map((message) => message.reason),
    }
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : 'Failed to render markdown.')

    return {
      html: '<p>Failed to render markdown.</p>',
      warnings,
    }
  }
}
