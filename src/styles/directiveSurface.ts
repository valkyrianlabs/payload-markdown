/**
 * Directive surface and interaction styles.
 *
 * Every colour that differs between light and dark is mixed from one inherited
 * variable, `--pmd-scheme-dark` (1 = dark, 0 = light), so a single switch on the
 * renderer root drives the whole document (see PMD_COLOR_SCHEME_CLASS_NAMES).
 * When it is unset (headless output without the renderer) the dark palette is
 * used, matching earlier releases.
 *
 * Public tokens come first in every chain and are never set by the plugin, so a
 * consumer value always wins: `--pmd-surface`, `--pmd-surface-muted`,
 * `--pmd-border`, `--pmd-accent`, `--pmd-accent-hover`, `--pmd-code-bg`. Surface
 * and border then fall back to the host's Tailwind `--color-card` and
 * `--color-border` when it defines them, and finally to the plugin palette.
 *
 * Class strings are written out literally: Tailwind only generates classes it
 * finds verbatim in the package `dist`.
 */

/**
 * Root classes that set the colour scheme for everything rendered inside.
 * `auto` follows the host's Tailwind `dark:` variant, so it honours a class- or
 * attribute-based theme switcher when the host declares one with
 * `@custom-variant dark`.
 */
export const PMD_COLOR_SCHEME_CLASS_NAMES = {
  auto: '[--pmd-scheme-dark:0] dark:[--pmd-scheme-dark:1] scheme-light dark:scheme-dark',
  dark: '[--pmd-scheme-dark:1] scheme-dark',
  light: '[--pmd-scheme-dark:0] scheme-light',
} as const

export const DIRECTIVE_SURFACE_BORDER_CLASS =
  'border border-[color:var(--pmd-border,var(--color-border,color-mix(in_oklab,rgb(255_255_255/0.06)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.08))))]'
export const DIRECTIVE_SURFACE_DIVIDER_CLASS =
  'border-[color:var(--pmd-border,var(--color-border,color-mix(in_oklab,rgb(255_255_255/0.06)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.08))))]'
export const DIRECTIVE_SURFACE_SHADOW_CLASS =
  'shadow-[0_2px_12px_color-mix(in_oklab,rgb(0_0_0/0.35)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.06))]'
export const DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS =
  'shadow-[0_2px_12px_color-mix(in_oklab,rgb(0_0_0/0.24)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.04))]'

export const DIRECTIVE_SURFACE_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[color:var(--pmd-surface,var(--color-card,color-mix(in_oklab,#18191c_calc(var(--pmd-scheme-dark,1)*100%),#ffffff)))]',
  DIRECTIVE_SURFACE_SHADOW_CLASS,
].join(' ')

export const DIRECTIVE_SURFACE_MUTED_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[color:var(--pmd-surface-muted,color-mix(in_oklab,rgb(24_25_28/0.8)_calc(var(--pmd-scheme-dark,1)*100%),#fafafa))]',
  'shadow-[0_2px_12px_color-mix(in_oklab,rgb(0_0_0/0.28)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.05))]',
].join(' ')

export const DIRECTIVE_SURFACE_GLASS_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[color:color-mix(in_oklab,var(--pmd-surface,var(--color-card,color-mix(in_oklab,#18191c_calc(var(--pmd-scheme-dark,1)*100%),#ffffff)))_70%,transparent)]',
  'shadow-[0_2px_12px_color-mix(in_oklab,rgb(0_0_0/0.32)_calc(var(--pmd-scheme-dark,1)*100%),rgb(0_0_0/0.05))]',
  'backdrop-blur-xl',
].join(' ')

export const DIRECTIVE_SURFACE_SOFT_PANEL_CLASS = [
  DIRECTIVE_SURFACE_BORDER_CLASS,
  'bg-[color:color-mix(in_oklab,var(--pmd-surface,var(--color-card,color-mix(in_oklab,#18191c_calc(var(--pmd-scheme-dark,1)*100%),#ffffff)))_70%,transparent)]',
  DIRECTIVE_SURFACE_SOFT_SHADOW_CLASS,
].join(' ')

// Code blocks keep their Shiki theme's dark surface in both schemes.
export const DIRECTIVE_SURFACE_RENDERER_PRE_CLASS = [
  'prose-pre:border',
  'prose-pre:border-white/[0.06]',
  'prose-pre:bg-[var(--pmd-code-bg,var(--pmd-code-bg-nested,#18191c))]',
].join(' ')

export const DIRECTIVE_SURFACE_NESTED_CODE_CLASS = [
  '[&_pre]:my-4',
  '[&_pre]:rounded-lg',
  // Code inside a panel reads as a slightly darker inset well. A consumer
  // `--pmd-code-bg` still wins: it comes first in the code background chain.
  '[--pmd-code-bg-nested:#121316]',
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
