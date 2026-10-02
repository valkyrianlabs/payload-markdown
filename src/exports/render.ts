/**
 * `@valkyrianlabs/payload-markdown/render`: the headless, CSS-free and
 * React-free render API. Importable from plain Node (scripts, search
 * indexers, RSS/email, docs tooling) as well as from bundled apps.
 */
export type {
  DiagnosticPlace,
  RenderDiagnostic,
  RenderDiagnosticSeverity,
  RenderDiagnosticSource,
} from '../core/diagnostics.js'
export type { MarkdownLink, MarkdownLinkKind } from '../core/renderData.js'
export {
  compileMarkdown,
  type RenderedMarkdown,
  renderMarkdownDocument as renderMarkdown,
} from '../core/renderMarkdown.js'
export { extractHeadingAnchors } from '../directives/extractHeadings.js'
export {
  createHeadingSlugger,
  type HeadingAnchor,
  type HeadingSlugger,
  slugifyHeading,
} from '../directives/headingAnchors.js'
export type { MarkdownRenderConfig, RenderMarkdownResult } from '../types/core.js'
