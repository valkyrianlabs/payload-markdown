import type { Nodes, Root } from 'mdast'
import type { Plugin } from 'unified'

import type { MarkdownLink } from '../renderData.js'

import { setRenderData } from '../renderData.js'

/** Directive attributes that hold URLs (see the directive spec's `url` type). */
const DIRECTIVE_URL_ATTRIBUTES = ['href', 'src'] as const

const BLOCK_CONTAINERS = new Set([
  'blockquote',
  'containerDirective',
  'footnoteDefinition',
  'list',
  'listItem',
  'root',
  'table',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function inlineText(node: Nodes): string {
  switch (node.type) {
    case 'break':
      return '\n'
    case 'html':
      return ''
    case 'image':
      return node.alt ?? ''
    case 'inlineCode':
    case 'text':
      return node.value
    default:
      return 'children' in node ? (node.children as Nodes[]).map(inlineText).join('') : ''
  }
}

function directiveHeading(node: Nodes): string | undefined {
  if (node.type !== 'containerDirective') return undefined

  const label = node.data?.vlDirectiveLabel?.trim()
  if (label) return label

  for (const name of ['title', 'label']) {
    const value = node.attributes?.[name]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return undefined
}

/**
 * Plain text of the compiled tree, one block per paragraph, heading, code
 * block, table row or leaf directive, separated by blank lines. Directive
 * markers and attributes never appear (they are not in the tree); a container
 * directive contributes its label or `title` as a block. Raw HTML is dropped.
 */
function collectText(node: Nodes, blocks: string[]) {
  if (node.type === 'code') {
    if (node.value) blocks.push(node.value)
    return
  }

  if (node.type === 'tableRow') {
    const row = (node.children as Nodes[]).map((cell) => inlineText(cell).trim()).join('\t')
    if (row.trim()) blocks.push(row)
    return
  }

  if (BLOCK_CONTAINERS.has(node.type)) {
    const heading = directiveHeading(node)
    if (heading) blocks.push(heading)

    for (const child of (node as { children: Nodes[] }).children) collectText(child, blocks)
    return
  }

  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'leafDirective') {
    const text = inlineText(node).trim()
    if (text) blocks.push(text)
  }
}

function collectLinks(node: Nodes, links: MarkdownLink[]) {
  switch (node.type) {
    case 'containerDirective':
    case 'leafDirective':
      if (isRecord(node.attributes))
        for (const name of DIRECTIVE_URL_ATTRIBUTES) {
          const value = node.attributes[name]
          if (typeof value === 'string' && value.trim())
            links.push({ kind: 'directive', url: value.trim() })
        }
      break
    case 'definition':
      links.push({ kind: 'definition', url: node.url })
      break
    case 'image':
      links.push({ kind: 'image', url: node.url })
      break
    case 'link':
      links.push({ kind: 'link', url: node.url })
      break
    default:
      break
  }

  if ('children' in node) for (const child of node.children as Nodes[]) collectLinks(child, links)
}

/**
 * Read-only stage between directive compilation and heading/TOC generation:
 * records the document's plain text and authored URLs on the VFile. It never
 * changes the tree.
 */
export const remarkCollectRenderData: Plugin<[], Root> = () => {
  return (tree, file) => {
    const blocks: string[] = []
    const links: MarkdownLink[] = []

    collectText(tree, blocks)
    collectLinks(tree, links)

    setRenderData(file, { links, text: blocks.join('\n\n') })
  }
}
