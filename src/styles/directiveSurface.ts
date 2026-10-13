export const DIRECTIVE_SURFACE_BORDER_CLASS = 'border border-white/[0.06]'
export const DIRECTIVE_SURFACE_DIVIDER_CLASS = 'border-white/[0.06]'
export const DIRECTIVE_SURFACE_BACKGROUND_CLASS = 'bg-[#18191c]'
export const DIRECTIVE_SURFACE_SHADOW_CLASS = 'shadow-[0_2px_12px_rgba(0,0,0,0.35)]'
export const DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS = 'shadow-[0_2px_12px_rgba(0,0,0,0.24)]'

export const DIRECTIVE_SURFACE_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  DIRECTIVE_SURFACE_BACKGROUND_CLASS,
  DIRECTIVE_SURFACE_SHADOW_CLASS,
].join(' ')

export const DIRECTIVE_SURFACE_MUTED_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[#18191c]/80',
  'shadow-[0_2px_12px_rgba(0,0,0,0.28)]',
].join(' ')

export const DIRECTIVE_SURFACE_GLASS_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[#18191c]/70',
  'shadow-[0_2px_12px_rgba(0,0,0,0.32)]',
  'backdrop-blur-xl',
].join(' ')

export const DIRECTIVE_SURFACE_SOFT_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[#18191c]/70',
  DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS,
].join(' ')

export const DIRECTIVE_SURFACE_RENDERER_PRE_CLASS = [
  'prose-pre:border',
  'prose-pre:border-white/[0.06]',
  'prose-pre:bg-[var(--pmd-code-bg,#18191c)]',
].join(' ')

export const DIRECTIVE_SURFACE_NESTED_CODE_CLASS = [
  '[&_pre]:my-4',
  '[&_pre]:rounded-lg',
  // Code inside a panel reads as a slightly darker inset well.
  '[--pmd-code-bg:#121316]',
].join(' ')

/**
 * Body of a directive (card, callout, details, tab panel, step). Bodies are
 * ordinary prose, so lists, links, code, tables and quotes match the page; this
 * only trims the outer margins and scales headings down to the container.
 */
export const DIRECTIVE_BODY_CLASS = [
  '[&>:first-child]:mt-0',
  '[&>:last-child]:mb-0',
  '[&>h2]:text-xl',
  '[&>h3]:text-lg',
  '[&>h4]:text-base',
  '[&>:is(h2,h3,h4)]:mt-6',
  '[&>:is(h2,h3,h4)]:mb-2',
  DIRECTIVE_SURFACE_NESTED_CODE_CLASS,
].join(' ')
