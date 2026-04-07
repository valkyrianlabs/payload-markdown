import { randomUUID } from 'node:crypto'

import type {
  MarkdownRendererProps,
  MarkdownRendererScope,
  MarkdownSize,
  MarkdownVariant,
} from '../../core/types.js'

import { compileMarkdown } from '../../core/renderMarkdown.js'
import {
  mergeMarkdownConfigs,
  resolveMarkdownBlockDefaults,
  resolveMarkdownFieldDefaults,
} from '../../runtime/index.js'
import { MarkdownRendererClient } from './Component.client.js'

const cx = (...values: Array<false | null | string | undefined>) => values.filter(Boolean).join(' ')

const MARKDOWN_BASE_CLASS_NAME = cx(
  'prose w-full max-w-none mx-0 p-0 text-foreground dark:prose-invert',

  // headings
  'prose-headings:font-semibold prose-headings:tracking-tight',
  'prose-h1:scroll-mt-24 prose-h2:scroll-mt-24 prose-h3:scroll-mt-24',

  // text
  'prose-p:leading-7 prose-p:text-foreground/90',
  'prose-strong:text-foreground',

  // links
  'prose-a:font-medium prose-a:text-cyan-400 no-underline transition-colors hover:prose-a:text-cyan-300',

  // hr
  'prose-hr:my-8 prose-hr:border-border',

  // lists
  '[&_ul]:my-3 [&_ol]:my-3',

  // only elements immediately before lists
  '[&_p:has(+ul)]:mb-3 [&_p:has(+ol)]:mb-3',
  '[&_h2:has(+ul)]:mb-3 [&_h2:has(+ol)]:mb-3',
  '[&_h3:has(+ul)]:mb-3 [&_h3:has(+ol)]:mb-3',

  // tune list top spacing by predecessor type
  '[&_p+ul]:mt-0 [&_p+ol]:mt-0',
  '[&_h2+ul]:mt-2 [&_h2+ol]:mt-2',
  '[&_h3+ul]:mt-2 [&_h3+ol]:mt-2',

  '[&_ul]:pl-5 [&_ol]:pl-5',
  '[&_li]:my-0',
  '[&_li+li]:mt-1.5',
  '[&_li>p]:my-0',
  '[&_li>ul]:mt-1.5 [&_li>ol]:mt-1.5',
  '[&_ul_ul]:my-1 [&_ul_ol]:my-1 [&_ol_ul]:my-1 [&_ol_ol]:my-1',
  '[&_li::marker]:text-foreground/55',

  // task lists
  '[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0',

  // blockquote
  'prose-blockquote:my-6 prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:text-foreground/75',

  // tables
  'prose-table:my-6 prose-table:w-full',
  'prose-th:border-b prose-th:border-border prose-th:pb-2 prose-th:text-left prose-th:font-semibold',
  'prose-td:border-b prose-td:border-border/60 prose-td:py-2',

  // media
  'prose-img:rounded-xl',

  // inline code
  'prose-code:rounded prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-medium dark:prose-code:bg-white/10',
  'prose-code:before:content-none prose-code:after:content-none',

  // fenced code
  'prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-neutral-950',
  'prose-pre:px-0 prose-pre:py-0',
  '[&_pre]:m-0 [&_pre]:p-0',
  '[&_pre_code]:m-0 [&_pre_code]:bg-[#18191c]',
  '[&_pre_.shiki]:m-0 [&_pre_.shiki]:rounded-xl',
  '[&_pre_.shiki]:px-4 [&_pre_.shiki]:py-3.5',
)

const MARKDOWN_VARIANT_CLASS_NAMES: Record<MarkdownVariant, string> = {
  blog: cx(
    'prose-h1:mb-5 prose-h1:text-4xl md:prose-h1:text-5xl',
    'prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-3xl',
    'prose-h3:mt-7 prose-h3:mb-2 prose-h3:text-2xl',
    'prose-p:text-[1.02rem]',
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
    'prose-ul:my-3 prose-ol:my-3',
    'prose-pre:my-5',
  ),

  unstyled: '',
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
  return cx(
    'w-full mx-0',
    enableGutter && 'px-5 sm:px-6 lg:px-8',
    wrapperClassName,
  )
}

function buildMarkdownClassName({
  className,
  fullBleedCode,
  mutedHeadings,
  size,
  variant,
}: Pick<
  MarkdownRendererProps,
  'className' | 'fullBleedCode' | 'mutedHeadings' | 'size' | 'variant'
>): string {
  if (variant === 'unstyled') return className ?? ''

  return cx(
    MARKDOWN_BASE_CLASS_NAME,
    MARKDOWN_VARIANT_CLASS_NAMES[variant ?? 'blog'],
    MARKDOWN_SIZE_CLASS_NAMES[size ?? 'lg'],
    mutedHeadings && 'prose-headings:text-foreground/90',
    fullBleedCode &&
      'lg:[&_pre]:mx-[-2rem] lg:[&_pre_shiki]:rounded-[1.25rem] lg:[&_pre]:rounded-[1.25rem]',
    className,
  )
}

function resolveScopedDefaults(scope: MarkdownRendererScope, collectionSlug?: string) {
  return scope === 'blocks'
    ? resolveMarkdownBlockDefaults(collectionSlug)
    : resolveMarkdownFieldDefaults(collectionSlug)
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

  const resolvedProps =
    mergeMarkdownConfigs(resolveScopedDefaults(scope, collectionSlug), rawProps) ?? rawProps

  const {
    className,
    enableGutter = false,
    fullBleedCode = false,
    mutedHeadings = false,
    size = 'lg',
    variant = 'blog',
    wrapperClassName,
  } = resolvedProps

  const result = await compileMarkdown(markdown, resolvedProps)
  const Tag = as
  const containerId = `payload-markdown-${randomUUID()}`

  if (result.warnings.length > 0 && errorFallback) return errorFallback

  const resolvedWrapperClassName = buildWrapperClassName({
    enableGutter,
    wrapperClassName,
  })

  const resolvedMarkdownClassName = buildMarkdownClassName({
    className,
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
