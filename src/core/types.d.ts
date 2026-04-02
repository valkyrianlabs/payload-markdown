/**
 * @import {} from 'mdast-util-directive'
 */

import type { RenderMarkdownOptions } from '../components/MarkdownRenderer/types.d.ts'

export interface CodeBlockOptions extends RenderMarkdownOptions {
  lang?: string
}
