/**
 * @import {} from 'mdast-util-directive'
 */

import type { JSX, ReactNode } from 'react'

import 'mdast-util-directive'

declare module 'mdast-util-directive' {
  interface ContainerDirectiveData {
    vlCellHeadingDepth?: number
    vlParentHeadingDepth?: number
  }
}

export type MarkdownRendererScope = 'blocks' | 'field'

/**
 * Options that control how fenced code blocks are rendered inside markdown content.
 *
 * By default, code blocks use the plugin's enhanced rendering mode:
 * - `enhancedCodeBlocks` defaults to `true`
 * - `lineNumbers` defaults to `true`
 * - `theme` defaults to `'github-dark'`
 *
 * When enhanced rendering is enabled, the plugin applies its normalized code block
 * pipeline on top of Shiki output. This includes layout cleanup, background
 * normalization, and support for features like line numbers.
 *
 * When enhanced rendering is disabled, code blocks are rendered closer to raw
 * Shiki output and plugin-specific enhancements are bypassed.
 *
 * These options are passed through the markdown rendering pipeline and primarily
 * affect Shiki-rendered code fences.
 */
export type RenderMarkdownOptions = {
  /**
   * Whether to apply the plugin's enhanced code block rendering pipeline.
   *
   * Defaults to `true`.
   *
   * When enabled, the renderer performs structural and visual normalization on
   * Shiki output to produce a consistent, content-focused appearance.
   *
   * When disabled, code blocks are rendered closer to raw Shiki output.
   */
  enhancedCodeBlocks?: boolean

  /**
   * An optional list of language identifiers to load for Shiki syntax highlighting.
   *
   * By default, the plugin loads a core set of popular languages. You can replace
   * that set entirely or extend it using spread syntax:
   *
   * ```ts
   * options: {
   *   langs: [...DEFAULT_CODE_LANGS, 'latex']
   * }
   * ```
   */
  langs?: string[]

  /**
   * Whether to show line numbers for fenced code blocks.
   *
   * Defaults to `true` when `enhancedCodeBlocks` is enabled.
   *
   * Line numbers require the enhanced rendering pipeline and are automatically
   * disabled when `enhancedCodeBlocks` is set to `false`.
   */
  lineNumbers?: boolean

  /**
   * The Shiki theme to use for syntax highlighting.
   *
   * Defaults to `'github-dark'`.
   *
   * The plugin's enhanced renderer is tuned around its default theme. When using a
   * non-default theme:
   *
   * - `enhancedCodeBlocks: true` opts into the plugin's normalized rendering pipeline
   * - `enhancedCodeBlocks: false` preserves the theme's native appearance more closely
   *
   * This allows you to choose between a more controlled presentation and a more
   * theme-faithful rendering mode.
   */
  theme?: string
}

/**
 * The result of compiling markdown into sanitized HTML.
 */
export type RenderMarkdownResult = {
  /**
   * The rendered HTML output.
   */
  html: string

  /**
   * Non-fatal warnings produced during rendering.
   */
  warnings: string[]
}

/**
 * Preset visual styles for rendered markdown content.
 */
export type MarkdownVariant = 'blog' | 'compact' | 'docs' | 'unstyled'

/**
 * Preset typography sizes for rendered markdown content.
 */
export type MarkdownSize = 'lg' | 'md' | 'sm'

/**
 * Core markdown presentation configuration.
 *
 * This type represents the configurable styling and behavior layer that can be
 * sourced from plugin defaults, globals, collection defaults, or block-level
 * overrides. It intentionally excludes runtime-only renderer props such as
 * `markdown`, `as`, and fallback nodes.
 */
export type MarkdownConfig = {
  /**
   * Additional classes applied to the rendered markdown element itself.
   */
  className?: string

  /**
   * Additional classes applied to column elements within the rendered markdown, if applicable.
   */
  columnClassName?: string

  /**
   * Whether to apply horizontal gutter padding to the outer wrapper.
   *
   * Defaults to `false`.
   */
  enableGutter?: boolean

  /**
   * Whether fenced code blocks should extend beyond the normal content width
   * on larger screens.
   *
   * Defaults to `false`.
   */
  fullBleedCode?: boolean

  /**
   * Optional content rendered above the markdown body.
   */
  lead?: ReactNode

  /**
   * Whether heading colors should be slightly muted.
   *
   * Defaults to `false`.
   */
  mutedHeadings?: boolean

  /**
   * Options that control fenced code block rendering.
   */
  options?: RenderMarkdownOptions

  /**
   * Additional classes applied to section elements within the rendered markdown, if applicable.
   */
  sectionClassName?: string

  /**
   * Typography size preset for the rendered markdown.
   *
   * Defaults to `'lg'`.
   */
  size?: MarkdownSize

  /**
   * Visual style preset for the rendered markdown.
   *
   * Defaults to `'blog'`.
   */
  variant?: MarkdownVariant

  /**
   * Additional classes applied to the outer wrapper element.
   */
  wrapperClassName?: string
}

/**
 * Runtime-only props shared by markdown renderer components.
 */
export type BaseMarkdownRendererProps = {
  /**
   * The HTML tag used for the rendered markdown container.
   *
   * Defaults to `'article'`.
   */
  as?: keyof JSX.IntrinsicElements

  /**
   * Content rendered when the markdown input is empty or missing.
   */
  emptyFallback?: ReactNode

  /**
   * Content rendered when markdown compilation fails and a fallback is desired.
   */
  errorFallback?: ReactNode

  /**
   * The markdown source string to render.
   */
  markdown?: null | string
}

/**
 * Props for the main markdown renderer component.
 *
 * This merges persisted/configurable markdown presentation settings with the
 * runtime-only rendering props required by the component itself.
 */
export type MarkdownRendererProps = {
    collectionSlug?: string
    scope?: MarkdownRendererScope
  } & BaseMarkdownRendererProps & MarkdownConfig

/**
 * Options available while rendering an individual fenced code block.
 */
export interface CodeBlockOptions extends RenderMarkdownOptions {
  /**
   * The parsed language identifier for the fenced code block, if present.
   */
  lang?: string
}

/**
 * Stored Payload block data for a markdown block instance.
 */
export interface MarkdownBlockData {
  /**
   * Optional block display name assigned by Payload.
   */
  blockName?: null | string

  /**
   * The Payload block slug.
   */
  blockType: 'vlMdBlock'

  /**
   * Markdown source content for this block.
   */
  content: string

  /**
   * Optional Payload-generated block identifier.
   */
  id?: null | string
}

/**
 * Props for the markdown block component wrapper.
 */
export interface MarkdownBlockProps extends MarkdownBlockData {
  /**
   * The slug of the collection this block is rendered within, if applicable.
   */
  collectionSlug?: string
}
