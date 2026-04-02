import { randomUUID } from 'node:crypto'

import type { MarkdownRendererProps, MarkdownSize, MarkdownVariant } from './types.d.ts'

import { compileMarkdown } from '../../core/renderMarkdown.ts'
import { MarkdownRendererClient } from './Component.client.tsx'

const cx = (...values: Array<false | null | string | undefined>) => values.filter(Boolean).join(' ')

const MARKDOWN_BASE_CLASS_NAME = cx(
  'prose max-w-none text-foreground dark:prose-invert',
  'prose-headings:font-semibold prose-headings:tracking-tight',
  'prose-p:leading-8 prose-p:text-foreground/88',
  'prose-strong:text-foreground',
  'prose-a:font-medium prose-a:text-cyan-400 no-underline transition-colors hover:prose-a:text-cyan-300',
  'prose-hr:my-10 prose-hr:border-border',
  'prose-blockquote:my-8 prose-blockquote:border-l-[3px] prose-blockquote:border-l-neutral-300 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-foreground/70 dark:prose-blockquote:border-l-neutral-700',
  'prose-ul:my-6 prose-ol:my-6',
  'prose-li:my-1 prose-li:marker:text-foreground/35',
  'prose-table:my-8 prose-table:w-full',
  'prose-th:border-b prose-th:border-border prose-th:pb-3 prose-th:text-left prose-th:font-semibold',
  'prose-td:border-b prose-td:border-border/60 prose-td:py-3',
  'prose-img:rounded-2xl prose-img:border prose-img:border-border prose-img:shadow-sm',
  'prose-code:rounded prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-medium prose-code:text-foreground dark:prose-code:bg-white/10',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-neutral-950 prose-pre:shadow-sm',
  'prose-pre:px-0 prose-pre:py-0',
  '[&_pre]:p-0',
  '[&_pre]:m-0',
  '[&_pre_code]:m-0',
  '[&_pre_code]:bg-transparent',
  '[&_pre_shiki]:m-0 [&_pre_shiki]:rounded-2xl',
  '[&_pre_shiki]:border [&_pre_shiki]:border-border',
  '[&_pre_shiki]:px-5 [&_pre_shiki]:py-4',
)

const MARKDOWN_VARIANT_CLASS_NAMES: Record<MarkdownVariant, string> = {
  blog: cx(
    'prose-h1:mb-6 prose-h1:text-4xl md:prose-h1:text-5xl',
    'prose-h2:mt-14 prose-h2:mb-4 prose-h2:text-3xl md:prose-h2:text-[2rem]',
    'prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-2xl',
    'prose-p:text-[1.05rem]',
  ),
  compact: cx(
    'prose-h1:mb-4 prose-h1:text-3xl',
    'prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-2xl',
    'prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-xl',
    'prose-p:leading-7 prose-p:text-[0.95rem]',
  ),
  docs: cx(
    'prose-h1:mb-5 prose-h1:text-4xl',
    'prose-h2:mt-12 prose-h2:mb-3 prose-h2:text-2xl',
    'prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-xl',
    'prose-p:text-[0.98rem]',
    'prose-ul:text-[0.98rem] prose-ol:text-[0.98rem]',
  ),
  unstyled: '',
}

const MARKDOWN_SIZE_CLASS_NAMES: Record<MarkdownSize, string> = {
  lg: 'prose-lg',
  md: 'prose-base',
  sm: 'prose-sm',
}

function buildWrapperClassName({
  centered,
  enableGutter,
  wrapperClassName,
}: Pick<MarkdownRendererProps, 'centered' | 'enableGutter' | 'wrapperClassName'>): string {
  return cx(
    centered && 'mx-auto w-full max-w-3xl',
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

export async function MarkdownRenderer({
  as = 'article',
  centered = true,
  className,
  emptyFallback = null,
  enableGutter = false,
  errorFallback,
  fullBleedCode = false,
  lead,
  markdown = '',
  mutedHeadings = false,
  options,
  size = 'lg',
  variant = 'blog',
  wrapperClassName,
}: MarkdownRendererProps) {
  if (!markdown || !markdown.trim()) return emptyFallback

  const result = await compileMarkdown(markdown, options)
  const Tag = as
  const containerId = `payload-markdown-${randomUUID()}`

  if (result.warnings.length > 0 && errorFallback) return errorFallback

  const resolvedWrapperClassName = buildWrapperClassName({
    centered,
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
