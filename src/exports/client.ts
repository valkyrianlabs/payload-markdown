export { MarkdownBlockParamsEnableField } from '../blocks/MarkdownBlock/ParamsEnableField.client.js'
/**
 * `payload-markdown/client` (or the scoped `@valkyrianlabs/...` name): the package's `'use client'`
 * components, for bundled (Next.js / Payload admin) apps.
 *
 * - `PayloadMarkdownField` is the admin field component. The specifier
 *   `<package>/server#PayloadMarkdownField` (used by
 *   `markdownField()` and existing import maps) re-exports the same component
 *   and keeps working.
 * - `MarkdownBlockParamsEnableField` is the markdown block's "Enable Blocks
 *   Params" checkbox: it pre-fills the block's params with their effective
 *   values when checked.
 * - `MarkdownRendererClient` is the interactive island `MarkdownRenderer`
 *   mounts next to its HTML (tabs, code copy). Render it with the id of the
 *   element that contains HTML from `renderMarkdown()` to get the same
 *   behavior without `MarkdownRenderer`.
 */
export {
  MarkdownRendererClient,
  type MarkdownRendererClientProps,
} from '../components/MarkdownRenderer/Component.client.js'
export { PayloadMarkdownField } from '../field/MarkdownField/Component.js'
