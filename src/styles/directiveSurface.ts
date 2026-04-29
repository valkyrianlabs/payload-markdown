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
  'prose-pre:bg-[#18191c]',
].join(' ')

export const DIRECTIVE_SURFACE_NESTED_CODE_CLASS = [
  '[&_pre]:my-4',
  '[&_pre]:rounded-lg',
  '[&_pre_code]:rounded-lg',
].join(' ')
