import type { Root } from 'mdast'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import type { HeadingAnchor } from './headingAnchors.js'

import { collectHeadingAnchors } from './headingAnchors.js'

const markdownParser = unified().use(remarkParse).use(remarkGfm).freeze()

/**
 * Returns the heading anchors the renderer assigns to `markdown`, in document
 * order: `id` is the exact `id`/`#fragment` of the rendered heading, `text` is
 * the TOC text. Pure and synchronous, so link checkers and docs tooling can
 * validate `page.md#anchor` links without rendering HTML.
 *
 * Like the renderer, headings nested in lists or blockquotes get no anchor.
 */
export function extractHeadingAnchors(markdown: string): HeadingAnchor[] {
  const tree = markdownParser.parse(markdown)

  return collectHeadingAnchors(tree).map(({ anchor }) => anchor)
}
