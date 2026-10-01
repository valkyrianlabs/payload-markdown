import type { Nodes } from 'mdast'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const markdownParser = unified().use(remarkParse).use(remarkGfm).freeze()

/**
 * Prefix used to keep label text inline: a no-break space is not indentation,
 * so `1. Install` or `# Title` cannot turn into a block construct, and it is
 * Unicode whitespace, so emphasis flanking matches the original context.
 */
const INLINE_GUARD = ' '

const LABEL_MARKDOWN_PATTERN = /[\\`*_~&<[\]!]/

function toPlainText(node: Nodes): string {
  switch (node.type) {
    case 'html':
      // Tags never leak into label text; their text content does.
      return ''
    case 'image':
    case 'imageReference':
      return node.alt ?? ''
    case 'inlineCode':
    case 'text':
      return node.value
    default:
      return 'children' in node
        ? (node.children as Nodes[]).map((child) => toPlainText(child)).join('')
        : ''
  }
}

/**
 * Plain text of a directive `[label]` written as inline markdown. Emphasis,
 * code spans, escapes and character references are interpreted the same way
 * they are in a paragraph; HTML tags are dropped.
 */
export function directiveLabelToText(source: string): string {
  if (!LABEL_MARKDOWN_PATTERN.test(source)) return source

  const tree = markdownParser.parse(`${INLINE_GUARD}${source}`)
  const text = toPlainText(tree)

  return text.startsWith(INLINE_GUARD) ? text.slice(INLINE_GUARD.length) : text
}

/**
 * Decodes backslash escapes and character references in a directive
 * attribute value using CommonMark link-title rules (no emphasis, no HTML), so
 * `title="*star*"` stays literal while `\"` and `&amp;` are decoded.
 */
export function decodeDirectiveAttributeValue(value: string, quote: "'" | '"' | null): string {
  if (!value.includes('\\') && !value.includes('&')) return value

  const delimiter = quote ?? '"'
  if (!quote && value.includes('"')) return value
  if (/\r?\n[\t ]*\r?\n/.test(value)) return value

  const tree = markdownParser.parse(`[x](<> ${delimiter}${value}${delimiter})`)
  const paragraph = tree.children[0]
  const link = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined

  if (link?.type !== 'link' || paragraph?.type !== 'paragraph' || paragraph.children.length !== 1)
    return value

  return typeof link.title === 'string' ? link.title : value
}
