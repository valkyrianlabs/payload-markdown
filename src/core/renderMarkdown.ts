import type { Element, Parent, Root, RootContent } from 'hast'
import type { Schema } from 'hast-util-sanitize'

import { fromHtml } from 'hast-util-from-html'
import { toString } from 'hast-util-to-string'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import type { MarkdownConfig, RenderMarkdownOptions, RenderMarkdownResult } from './types.d.ts'

import { codeToHtml } from './codeToHtml.ts'
import { rehypeApplyLayoutClasses } from './plugins/rehypeApplyLayoutClasses.ts'
import { remarkLayoutDirectives } from './plugins/remarkLayoutDirectives.ts'

function normalizeLayoutSyntax(input: string): string {
  return input
    .replace(/^[ \t]*:::endcol[ \t]*$/gim, ':::')
    .replace(/^[ \t]*:::end[ \t]*$/gim, ':::')
    .replace(/^[ \t]*:::endsection[ \t]*$/gim, ':::')
}

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
    code: [...getAttributeDefinitions(defaultSchema.attributes?.code ?? []), 'className'],
    div: [...getAttributeDefinitions(defaultSchema.attributes?.div ?? []), 'dataVlLayout'],
    pre: [
      ...getAttributeDefinitions(defaultSchema.attributes?.pre ?? []),
      'className',
      'style',
      'tabindex',
    ],
    section: [...getAttributeDefinitions(defaultSchema.attributes?.section ?? []), 'dataVlLayout'],
    span: [...getAttributeDefinitions(defaultSchema.attributes?.span ?? []), 'className', 'style'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'span', 'section'],
}

export async function compileMarkdown(
  markdown: string,
  config: MarkdownConfig = {},
): Promise<RenderMarkdownResult> {
  const warnings: string[] = []

  try {
    const normalizedMarkdown = normalizeLayoutSyntax(markdown)

    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkLayoutDirectives)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeShikiCodeBlocks, config.options)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeApplyLayoutClasses, config)
      .use(rehypeStringify)
      .process(normalizedMarkdown)

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
