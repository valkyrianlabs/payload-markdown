import type { RenderedMarkdown } from '../core/renderMarkdown.js'
import type { ResolveMarkdownRenderConfigOptions } from '../runtime/index.js'

import { renderMarkdownDocument } from '../core/renderMarkdown.js'
import { resolveMarkdownRenderConfig } from '../runtime/index.js'

/**
 * Options for `renderMarkdown`: any render config (`code`, `themes`, `icons`,
 * …) plus where plugin defaults come from.
 *
 * - `settings`: a settings object, a Payload config or a Payload instance.
 *   Wins over the process-wide registry that `payloadMarkdown()` fills.
 *   `false` renders with `config` only.
 * - `scope` / `collectionSlug`: which plugin defaults apply (`field` by default).
 */
export type RenderMarkdownConfig = ResolveMarkdownRenderConfigOptions

/**
 * Headless renderer: sanitized HTML plus diagnostics, headings, plain text
 * and links. Produces the same HTML as `MarkdownRenderer` for the same
 * markdown, settings, scope and collection.
 */
export async function renderMarkdown(
  markdown: string,
  config: RenderMarkdownConfig = {},
): Promise<RenderedMarkdown> {
  return renderMarkdownDocument(markdown, resolveMarkdownRenderConfig(config))
}
