import type { Payload } from 'payload'

import type { RenderDiagnostic } from '../core/diagnostics.js'
import type { MarkdownRenderConfig } from '../types/core.js'

import { renderMarkdown } from '../render/renderMarkdown.js'

export type MarkdownValidationOptions = {
  /** Collection whose payload-markdown settings (themes, icons, code) apply. */
  collection?: string
  /** Per-block `md-params` overrides (markdown blocks only). */
  overrides?: MarkdownRenderConfig
  /** Payload instance whose config carries the plugin settings. */
  payload?: Pick<Payload, 'config'>
  /** `blocks` for markdown blocks, `field` for markdown fields (default). */
  scope?: 'blocks' | 'field'
}

export type MarkdownValidationResult = {
  counts: Record<RenderDiagnostic['severity'], number>
  diagnostics: RenderDiagnostic[]
  /** Fatal compilation errors; the page would show a failure placeholder. */
  errors: string[]
  headings: Array<{ depth: number; id: string; text: string }>
  /** No errors and no warnings: the markdown renders exactly as written. */
  ok: boolean
}

/**
 * Renders markdown the way the site does (same settings, scope and overrides)
 * and reports what the renderer would flag. `ok` requires zero errors and zero
 * warnings; `info` diagnostics (for example an unloaded code language that
 * falls back to plain text) never fail validation.
 */
export async function validateMarkdown(
  markdown: string,
  options: MarkdownValidationOptions = {},
): Promise<MarkdownValidationResult> {
  const result = await renderMarkdown(markdown, {
    collectionSlug: options.collection,
    ...(options.overrides ? { overrides: options.overrides } : {}),
    scope: options.scope ?? 'field',
    ...(options.payload ? { settings: options.payload } : {}),
  })

  const counts = { error: 0, info: 0, warning: 0 }
  for (const diagnostic of result.diagnostics) counts[diagnostic.severity] += 1

  return {
    counts,
    diagnostics: result.diagnostics,
    errors: result.errors,
    headings: result.headings.map((heading) => ({ id: heading.id, depth: heading.depth, text: heading.text })),
    ok: result.errors.length === 0 && counts.error === 0 && counts.warning === 0,
  }
}
