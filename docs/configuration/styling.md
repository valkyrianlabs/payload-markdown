---
title: Styling
navTitle: Styling
description: Style Markdown output with renderer config, Tailwind Typography, directive themes, and stable hooks.
order: 140
status: published
tags:
  - configuration
  - styling
---

# Styling

The renderer ships with practical defaults and supports customization through three separate surfaces:

- `config` for Markdown wrapper and typography presentation
- `themes` for named directive themes
- `code` for code fence rendering behavior

:::toc[On this page]{depth="3" theme="compact"}
:::

## Tailwind Typography

For best defaults, enable Tailwind Typography and scan the package output:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/payload-markdown/dist";
```

Installed the scoped package? Point `@source` at `../node_modules/@valkyrianlabs/payload-markdown/dist` instead.

If your site switches between light and dark with a class or attribute, tell Tailwind, so the Markdown output switches with it (see [Light And Dark](#light-and-dark)):

```css
@custom-variant dark (&:where(.dark, .dark *));
/* or, for an attribute: (&:where([data-theme=dark], [data-theme=dark] *)) */
```

If you define custom directive themes with Tailwind classes, keep those class strings in source/config so Tailwind can scan them.

## Renderer Config

```ts
payloadMarkdown({
  config: {
    className: '[&_li::marker]:text-cyan-200/90',
    enableGutter: true,
    mutedHeadings: true,
    size: 'lg',
    variant: 'blog',
    wrapperClassName: 'max-w-4xl',
  },
})
```

`config` controls the Markdown wrapper and typography preset. It is not the directive theme registry and it is not code block configuration.

## Variants And Sizes

Variants:

- `blog`: larger article-style headings and prose
- `docs`: denser documentation typography
- `compact`: smaller vertical rhythm for panels and previews
- `unstyled`: omits the plugin typography classes and uses your `className`

Sizes:

- `lg`
- `md`
- `sm`

## Directive Themes

Use `themes` for directive styling:

```ts
payloadMarkdown({
  themes: {
    card: {
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5',
        },
      ],
    },
  },
})
```

Then authors select the theme in Markdown:

```md
:::card[Custom Card]{theme="forge"}
Portable Markdown content.
:::
```

The renderer emits stable hooks such as:

- `data-directive="card"`
- `data-theme="forge"`
- `vl-md-card`
- `vl-md-card--theme-forge`

## Light And Dark

Directive defaults (cards, callouts, tabs, steps, details, the table of contents, buttons) come in a light and a dark palette, and the typography follows the same switch. `colorScheme` picks how:

- `auto` (default) follows Tailwind's `dark:` variant, which you compile, so it tracks whatever your app uses: a `.dark` class, a `data-theme` attribute, or the OS preference if you haven't declared a variant. Declare one with `@custom-variant dark` as shown above if your site has a theme switcher.
- `light` or `dark` pins the palette regardless of the page theme: use `dark` for a site that is always dark.

```ts
payloadMarkdown({
  config: {
    colorScheme: 'dark',
  },
})
```

It can also be set per collection, per block scope, or on `MarkdownRenderer` directly. Code blocks keep their Shiki theme's surface in both schemes.

### Design tokens

Every directive colour reads a public CSS custom property first. The plugin never sets these, so a value you set on any ancestor (`:root`, a layout wrapper, `config.className`) always wins:

| Token | Used for |
| --- | --- |
| `--pmd-surface` | Card, panel, and callout surfaces |
| `--pmd-surface-muted` | `muted` themes |
| `--pmd-border` | Panel borders and dividers |
| `--pmd-accent` | Links, hovered titles, focus rings |
| `--pmd-accent-hover` | Hovered links and titles |
| `--pmd-code-bg` | Code block background, including code inside directives |

When a token is unset, surfaces and borders use your Tailwind theme's `--color-card` and `--color-border` if it defines them (as shadcn-style themes do), so directives match your app's cards. Otherwise they use the plugin palette for the active scheme.

Tokens apply to both schemes, so set them per scheme:

```css
:root {
  --pmd-surface: #fdf2f8;
  --pmd-accent: #be185d;
}

.dark {
  --pmd-surface: #2a0f1d;
  --pmd-accent: #f9a8d4;
}
```

`renderMarkdown` output without `MarkdownRenderer` uses the dark palette unless a container sets the scheme. Apply `PMD_COLOR_SCHEME_CLASS_NAMES.auto` (or `.light`, `.dark`) from `payload-markdown/render` to that container.

Custom directive themes replace the default classes for their name, so they keep full control: add `dark:` variants to a custom theme's classes when it should differ between schemes.

## Directive Content

Markdown inside a card, callout, details block, tab panel, or step renders with the same Tailwind Typography styles as the rest of the document, so lists, links, inline code, tables, and quotes look the same everywhere. Typography overrides in `config.className` (for example `prose-a:text-pink-400`) apply inside directives too. Directive chrome such as card titles, eyebrows, tab triggers, and the table of contents is marked `not-prose`, and directive bodies carry `data-directive-body`.

Code blocks read their background from the `--pmd-code-bg` custom property (default `#18191c`). Code inside a directive body uses a slightly darker inset well unless you set the token. Set it on any element to change the code background everywhere inside it, nested code included:

```ts
payloadMarkdown({
  config: {
    className: '[--pmd-code-bg:#0d1117]',
  },
})
```

## Deprecated Class Aliases

These still work but should not be the preferred customization path:

- `sectionClassName`
- `columnClassName`

Prefer directive themes:

```ts
payloadMarkdown({
  themes: {
    columns: {
      items: [
        {
          name: 'panel',
          classes: 'grid grid-cols-1 gap-8 rounded-2xl border border-border/60 p-4',
        },
      ],
    },
    section: {
      items: [
        {
          name: 'panel',
          classes: 'my-12 rounded-2xl border border-border bg-card/70 p-6 shadow-sm',
        },
      ],
    },
  },
})
```

Legacy aliases remain available for older projects:

```ts
payloadMarkdown({
  config: {
    columnClassName: 'gap-8 md:gap-12',
    sectionClassName: 'rounded-2xl border border-white/10 bg-white/5 p-6',
  },
})
```

## Override Order

```text
plugin -> collection -> field/block scope -> direct renderer props
```

Later layers win for scalar config values. Class name values are joined.

`className` and `wrapperClassName` are merged over the renderer defaults: a class that sets the same utility as a default replaces it. For example, `prose-a:font-bold` replaces the default `prose-a:font-medium`, and `prose-a:text-pink-600` replaces the default link colour. Without this, two classes of equal specificity resolve by their order in the stylesheet, not in the class list, so the override could silently lose.
