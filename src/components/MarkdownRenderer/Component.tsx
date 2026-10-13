import { randomUUID } from 'node:crypto'
import { extendTailwindMerge } from 'tailwind-merge'

import type {
  MarkdownColorScheme,
  MarkdownRendererProps,
  MarkdownSize,
  MarkdownVariant,
} from '../../types/core.js'

import { loadAppearancePalettes } from '../../appearance/runtime.js'
import { resolveFullBleedCode } from '../../core/codeConfig.js'
import { renderMarkdownDocument } from '../../core/renderMarkdown.js'
import { resolveMarkdownRenderConfig } from '../../runtime/index.js'
import {
  DIRECTIVE_SURFACE_RENDERER_PRE_CLASS,
  PMD_COLOR_SCHEME_CLASS_NAMES,
} from '../../styles/directiveSurface.js'
import { MarkdownRendererClient } from './Component.client.js'
import './index.css'

const cx = (...values: Array<false | null | string | undefined>) => values.filter(Boolean).join(' ')

// In Tailwind v4 a font-size utility leaves `leading-*` in place (line height
// goes through --tw-leading), so a later `prose-p:text-[…]` must not drop an
// earlier `prose-p:leading-7` the way tailwind-merge's v3 rule would.
const twMerge = extendTailwindMerge({ override: { conflictingClassGroups: { 'font-size': [] } } })

// Colors come from Tailwind Typography's --tw-prose-* variables (they follow
// prose-invert), never from app tokens such as `text-foreground`, which only
// exist in hosts that define them. Rules that target lists use
// `:not(:where(.not-prose_*))` so they stay out of directive chrome (TOC lists)
// without raising specificity above `[&_ul]`.
const MARKDOWN_BASE_CLASS_NAME = cx(
  'prose prose-neutral w-full max-w-none mx-0 p-0',

  // headings
  'prose-headings:font-semibold prose-headings:tracking-tight',
  'prose-h1:scroll-mt-24 prose-h2:scroll-mt-24 prose-h3:scroll-mt-24',
  '[&_:is(h5,h6)]:font-semibold [&_:is(h5,h6)]:text-(--tw-prose-headings)',

  // text
  'prose-p:leading-7 prose-li:leading-7',

  // links
  'prose-a:font-medium prose-a:transition-colors',
  'prose-a:text-[color:var(--pmd-accent,color-mix(in_oklab,#22d3ee_calc(var(--pmd-scheme-dark,1)*100%),#0e7490))]',
  'hover:prose-a:text-[color:var(--pmd-accent-hover,color-mix(in_oklab,#67e8f9_calc(var(--pmd-scheme-dark,1)*100%),#155e75))]',

  // hr
  'prose-hr:my-8',

  // lists
  '[&_:is(ul,ol):not(:where(.not-prose_*))]:my-3',

  // only elements immediately before lists
  '[&_p:has(+ul)]:mb-3 [&_p:has(+ol)]:mb-3',
  '[&_h2:has(+ul)]:mb-3 [&_h2:has(+ol)]:mb-3',
  '[&_h3:has(+ul)]:mb-3 [&_h3:has(+ol)]:mb-3',

  // tune list top spacing by predecessor type
  '[&_p+ul]:mt-0 [&_p+ol]:mt-0',
  '[&_h2+ul]:mt-2 [&_h2+ol]:mt-2',
  '[&_h3+ul]:mt-2 [&_h3+ol]:mt-2',

  '[&_ul:not(:where(.not-prose_*))]:pl-5 [&_ol:not(:where(.not-prose_*))]:pl-7',
  '[&_li:not(:where(.not-prose_*))]:my-0',
  '[&_li:not(:where(.not-prose_*))+li]:mt-1.5',
  '[&_li>p]:my-0',
  '[&_li>ul]:mt-1.5 [&_li>ol]:mt-1.5',
  '[&_ul_ul]:my-1 [&_ul_ol]:my-1 [&_ol_ul]:my-1 [&_ol_ol]:my-1',

  // task lists
  '[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0',
  '[&_.task-list-item]:pl-0 [&_.task-list-item_.contains-task-list]:pl-6',
  '[&_.task-list-item>input]:mr-2 [&_.task-list-item>input]:accent-cyan-500',

  // blockquote
  'prose-blockquote:my-6 prose-blockquote:border-l-2 prose-blockquote:pl-4',
  'prose-blockquote:font-normal prose-blockquote:text-(--tw-prose-body)',
  '[&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_blockquote_pre]:not-italic',

  // tables: Typography draws the row rules; honour GFM column alignment
  'prose-table:my-0',
  '[&_.pmd-table]:my-6',
  '[&_:is(th,td)[align=center]]:text-center [&_:is(th,td)[align=right]]:text-right',

  // media: images inside a paragraph (badges, inline icons) stay inline
  'prose-img:rounded-xl',
  '[&_.pmd-inline-media_img]:my-0 [&_.pmd-inline-media_img]:inline-block [&_.pmd-inline-media_img]:rounded-none [&_.pmd-inline-media_img]:align-middle',

  // footnotes: the generated "Footnotes" heading is a screen-reader label
  '[&_#footnote-label]:sr-only',
  '[&_.footnotes]:mt-12 [&_.footnotes]:border-t [&_.footnotes]:border-(--tw-prose-hr) [&_.footnotes]:pt-6 [&_.footnotes]:text-[0.9rem]',

  // inline code
  'prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-medium',
  'prose-code:bg-[color:color-mix(in_oklab,rgb(255_255_255/0.1)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.05))]',
  'prose-code:before:content-none prose-code:after:content-none',
  '[&_:not(pre)>code]:[overflow-wrap:anywhere]',

  // fenced code
  'prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-xl',
  DIRECTIVE_SURFACE_RENDERER_PRE_CLASS,
  'prose-pre:px-0 prose-pre:py-0',
  '[&_pre]:p-0',
  '[&_pre_code]:block [&_pre_code]:m-0 [&_pre_code]:rounded-none [&_pre_code]:px-0 [&_pre_code]:py-2.5 [&_pre_code]:bg-transparent',
)

const MARKDOWN_VARIANT_CLASS_NAMES: Record<MarkdownVariant, string> = {
  blog: cx(
    'prose-h1:mb-5 prose-h1:text-4xl md:prose-h1:text-5xl',
    'prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-3xl',
    'prose-h3:mt-7 prose-h3:mb-2 prose-h3:text-2xl',
    'prose-p:text-[1.02rem]',
    'prose-li:text-[1.02rem]',
    'prose-blockquote:text-[1.02rem]',
  ),

  docs: cx(
    'prose-h1:mb-4 prose-h1:text-3xl md:prose-h1:text-4xl',
    'prose-h2:mt-8 prose-h2:mb-2 prose-h2:text-2xl',
    'prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-xl',
    'prose-p:text-[0.98rem]',
    'prose-li:text-[0.98rem]',
    'prose-code:text-[0.875em]',
  ),

  compact: cx(
    'prose-h1:mb-3 prose-h1:text-3xl',
    'prose-h2:mt-6 prose-h2:mb-2 prose-h2:text-2xl',
    'prose-h3:mt-5 prose-h3:mb-1 prose-h3:text-xl',
    'prose-p:leading-6 prose-p:text-[0.95rem]',
    'prose-li:leading-6 prose-li:text-[0.95rem]',
    'prose-ul:my-3 prose-ol:my-3',
    'prose-pre:my-5',
  ),

  unstyled: '',
}

// Typography's own palette has to be inverted explicitly; everything else
// follows --pmd-scheme-dark from PMD_COLOR_SCHEME_CLASS_NAMES.
const MARKDOWN_COLOR_SCHEME_CLASS_NAMES: Record<MarkdownColorScheme, string> = {
  auto: cx(PMD_COLOR_SCHEME_CLASS_NAMES.auto, 'dark:prose-invert'),
  dark: cx(PMD_COLOR_SCHEME_CLASS_NAMES.dark, 'prose-invert'),
  light: PMD_COLOR_SCHEME_CLASS_NAMES.light,
}

const MARKDOWN_SIZE_CLASS_NAMES: Record<MarkdownSize, string> = {
  lg: 'prose-lg',
  md: 'prose-base',
  sm: 'prose-sm',
}

function buildWrapperClassName({
  enableGutter,
  wrapperClassName,
}: Pick<MarkdownRendererProps, 'enableGutter' | 'wrapperClassName'>): string {
  return twMerge(
    'w-full mx-0',
    enableGutter && 'px-5 sm:px-6 lg:px-8',
    wrapperClassName,
  )
}

function resolveColorScheme(value: unknown): MarkdownColorScheme {
  return value === 'dark' || value === 'light' ? value : 'auto'
}

function buildMarkdownClassName({
  className,
  colorScheme,
  fullBleedCode,
  mutedHeadings,
  size,
  variant,
}: Pick<
  MarkdownRendererProps,
  'className' | 'colorScheme' | 'fullBleedCode' | 'mutedHeadings' | 'size' | 'variant'
>): string {
  const scheme = resolveColorScheme(colorScheme)

  // Unstyled output skips the typography classes, but directives still need
  // the colour scheme to pick their palette.
  if (variant === 'unstyled') return twMerge(PMD_COLOR_SCHEME_CLASS_NAMES[scheme], className)

  // twMerge drops a default when the consumer's className sets the same
  // utility (`prose-a:font-bold` replaces `prose-a:font-medium`): equal
  // specificity would otherwise leave the winner to stylesheet order.
  return twMerge(
    MARKDOWN_BASE_CLASS_NAME,
    MARKDOWN_COLOR_SCHEME_CLASS_NAMES[scheme],
    MARKDOWN_VARIANT_CLASS_NAMES[variant ?? 'blog'],
    MARKDOWN_SIZE_CLASS_NAMES[size ?? 'lg'],
    mutedHeadings && 'prose-headings:text-(--tw-prose-headings)/90',
    fullBleedCode &&
      'lg:[&_pre]:mx-[-2rem] lg:[&_pre]:rounded-[1.25rem]',
    className,
  )
}

export async function MarkdownRenderer(rawProps: MarkdownRendererProps) {
  const {
    as = 'article',
    collectionSlug,
    emptyFallback = null,
    errorFallback,
    lead,
    markdown = '',
    scope = 'field',
  } = rawProps

  if (!markdown || !markdown.trim()) return emptyFallback

  // Plugin defaults come from the explicit `settings` source when given,
  // otherwise from the process-wide settings registry.
  // Palettes managed in the admin ("Markdown Appearance"), cached per process.
  const runtimePalettes = await loadAppearancePalettes(rawProps.settings)
  const resolvedProps = resolveMarkdownRenderConfig({ ...rawProps, collectionSlug, runtimePalettes, scope })

  const {
    className,
    colorScheme,
    enableGutter = false,
    mutedHeadings = false,
    size = 'lg',
    variant = 'blog',
    wrapperClassName,
  } = resolvedProps
  const fullBleedCode = resolveFullBleedCode(resolvedProps) ?? false

  const result = await renderMarkdownDocument(markdown, resolvedProps)
  const Tag = as
  const containerId = `payload-markdown-${randomUUID()}`

  if (result.errors.length > 0 && errorFallback) return errorFallback

  const resolvedWrapperClassName = buildWrapperClassName({
    enableGutter,
    wrapperClassName,
  })

  const resolvedMarkdownClassName = buildMarkdownClassName({
    className,
    colorScheme,
    fullBleedCode,
    mutedHeadings,
    size,
    variant,
  })

  return (
    <div className={resolvedWrapperClassName}>
      <MarkdownRendererClient containerId={containerId} />
      {lead ? <div className="mb-8">{lead}</div> : null}

      <Tag
        className={resolvedMarkdownClassName}
        dangerouslySetInnerHTML={{ __html: result.html }}
        id={containerId}
      />
    </div>
  )
}
