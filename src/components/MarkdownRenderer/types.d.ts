import type React, { JSX, ReactNode } from 'react'

/**
 * Options that control how fenced code blocks are rendered inside markdown content.
 *
 * By default, code blocks use the plugin's enhanced rendering mode:
 * - `highlightLines` defaults to `false`
 * - `lineNumbers` defaults to `true`
 * - `prettyCodeBlocks` defaults to `true`
 * - `theme` defaults to `'github-dark'`
 *
 * These options are passed through the markdown rendering pipeline and primarily
 * affect Shiki-rendered code fences.
 */
export type RenderMarkdownOptions = {
  /**
   * Whether to preserve Shiki-provided per-line background highlighting.
   *
   * Defaults to `false`.
   *
   * When disabled, background styles are stripped from highlighted lines and token
   * spans so code blocks integrate more cleanly with the surrounding site design.
   */
  highlightLines?: boolean

  /**
   * Whether to show line numbers for fenced code blocks.
   *
   * Defaults to `true`.
   */
  lineNumbers?: boolean

  /**
   * Whether to apply the plugin's enhanced code block formatting.
   *
   * Defaults to `true`.
   *
   * When enabled, the renderer normalizes Shiki output for better integration with
   * markdown prose styling. This includes adjustments such as background removal,
   * spacing cleanup, line layout normalization, and other structural fixes needed
   * for features like line numbers and consistent empty-line rendering.
   *
   * Set this to `false` if you want to preserve raw Shiki block styling as much as
   * possible.
   */
  prettyCodeBlocks?: boolean

  /**
   * The Shiki theme to use for syntax highlighting.
   *
   * Defaults to `'github-dark'`.
   *
   * Note that this plugin is optimized around themes that still look good when block
   * backgrounds are removed or reduced. Some light themes may require additional
   * customization to maintain good contrast and readability.
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
 * Shared base props for markdown renderer components.
 */
export type BaseMarkdownRendererProps = {
  /**
   * The HTML tag used for the rendered markdown container.
   *
   * Defaults to `'article'`.
   */
  as?: keyof JSX.IntrinsicElements

  /**
   * Additional classes applied to the rendered markdown element itself.
   */
  className?: string

  /**
   * Content rendered when the markdown input is empty or missing.
   */
  emptyFallback?: React.ReactNode

  /**
   * Content rendered when markdown compilation fails and a fallback is desired.
   */
  errorFallback?: React.ReactNode

  /**
   * The markdown source string to render.
   */
  markdown?: null | string

  /**
   * Options that control fenced code block rendering.
   */
  options?: RenderMarkdownOptions

  /**
   * Additional classes applied to the outer wrapper element.
   */
  wrapperClassName?: string
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
 * Props for the main markdown renderer component.
 */
export type MarkdownRendererProps = {
  /**
   * Whether to center the rendered markdown container within its wrapper.
   *
   * Defaults to `true`.
   */
  centered?: boolean

  /**
   * Additional classes applied to the rendered markdown element itself.
   */
  className?: string

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
} & Omit<BaseMarkdownRendererProps, 'className' | 'wrapperClassName'>
