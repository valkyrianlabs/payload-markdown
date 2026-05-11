---
title: Directive Themes
navTitle: Directive Themes
description: Register named directive themes, override built-ins, and use stable hook classes.
order: 150
status: published
tags:
  - configuration
  - themes
  - directives
---

# Directive Themes

Directive themes let authors select named visual treatments without putting raw Tailwind classes into CMS-authored Markdown.

The recommended model:

- define theme class strings in source/config
- let Tailwind scan those class strings
- select a named theme in Markdown with `theme="..."`
- use stable emitted `vl-md-*` classes for additional CSS overrides

:::toc {title="On this page" depth="3" theme="compact"}
:::

## Register Themes

```ts
payloadMarkdown({
  themes: {
    card: {
      extendDefaults: true,
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-white/10 bg-cyan-950/30 p-5 shadow-sm',
        },
      ],
    },
  },
})
```

Theme objects use `classes`, not `className`.

## Defaults And Overrides

`extendDefaults` defaults to `true`:

```ts
payloadMarkdown({
  themes: {
    card: {
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-white/10 bg-cyan-950/30 p-5',
        },
      ],
    },
  },
})
```

If a custom theme has the same `name` as a built-in theme, it overrides the built-in theme.

For total control:

```ts
payloadMarkdown({
  themes: {
    card: {
      extendDefaults: false,
      items: [
        {
          name: 'default',
          classes: 'rounded-xl border border-white/10 bg-[#18191c] p-4',
        },
      ],
    },
  },
})
```

## Collection-Scoped Themes

```ts
payloadMarkdown({
  collections: {
    posts: {
      themes: {
        card: {
          items: [
            {
              name: 'postHeroCard',
              classes: 'rounded-2xl border border-white/10 bg-cyan-950/30 p-5',
            },
          ],
        },
      },
    },
  },
})
```

Collection themes merge after plugin-level themes. If a collection theme has the same name as a plugin-level theme, the collection theme wins for that collection.

## Themeable Directive Groups

- `callout`
- `card`
- `cards`
- `cell`
- `columns`
- `details`
- `section`
- `steps`
- `tab`
- `tabs`
- `toc`

## Parent-Child Defaults

Cards can set a default child card theme:

```md
:::cards {columns="3" cardTheme="glass"}

:::card {title="Inherits Glass"}
Content.
:::

:::card {title="Overrides Parent" theme="cyan"}
Content.
:::

:::
```

Steps can set a default card theme for individual step cards:

```md
:::steps {variant="cards" stepTheme="cyan"}

### Install

Content.

:::
```

Tabs can set a default child panel theme:

```md
:::tabs {default="pnpm" tabTheme="glass"}

:::tab {label="pnpm" value="pnpm"}
Content.
:::

:::
```

## Stable Output Hooks

The renderer emits stable hooks:

```html
<article
  class="vl-md-card vl-md-card--theme-cyan ..."
  data-directive="card"
  data-theme="cyan"
>
  ...
</article>
```

Custom theme names are slugged for modifier classes:

```html
class="vl-md-card vl-md-card--theme-post-hero-card ..."
```

## Default Theme Exports

```ts
import {
  DEFAULT_CALLOUT_THEMES,
  DEFAULT_CARD_THEMES,
  DEFAULT_CARDS_THEMES,
  DEFAULT_CELL_THEMES,
  DEFAULT_COLUMNS_THEMES,
  DEFAULT_DETAILS_THEMES,
  DEFAULT_SECTION_THEMES,
  DEFAULT_STEPS_THEMES,
  DEFAULT_TAB_THEMES,
  DEFAULT_TABS_THEMES,
  DEFAULT_TOC_THEMES,
} from '@valkyrianlabs/payload-markdown'
```

You usually do not need to spread these manually. Built-ins are included automatically unless `extendDefaults: false`.
