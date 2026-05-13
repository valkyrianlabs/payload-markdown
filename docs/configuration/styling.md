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

@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
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
