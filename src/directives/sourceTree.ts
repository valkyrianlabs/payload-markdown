import type { Root } from 'mdast'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const markdownParser = unified().use(remarkParse).use(remarkGfm).freeze()

let lastSource: string | undefined
let lastTree: Root | undefined

/**
 * Parses markdown with the renderer's remark/GFM front end for the editor-side
 * directive tools (linter, close labels). The last result is cached, so the
 * tools share one parse of an unchanged document. Callers must not mutate the
 * returned tree.
 */
export function parseDirectiveSourceTree(markdown: string): Root {
  if (lastTree && lastSource === markdown) return lastTree

  lastTree = markdownParser.parse(markdown)
  lastSource = markdown

  return lastTree
}
