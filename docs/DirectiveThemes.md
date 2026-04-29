# Directive Themes

Directive themes let authors select named visual treatments without putting raw Tailwind classes into CMS-authored Markdown.

The recommended model:

- define theme class strings in source/config
- let Tailwind scan those class strings
- select a named theme in Markdown with `theme="..."`
- use stable emitted `vl-md-*` classes for additional CSS overrides

## Register Themes

```ts
payloadMarkdown({
  themes: {
    card: {
      extendDefaults: true,
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.24)]',
        },
      ],
    },
  },
})
```

Theme objects use `classes`, not `className`.

## Defaults and Overrides

`extendDefaults` defaults to `true`.

```ts
payloadMarkdown({
  themes: {
    card: {
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5',
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
          classes: 'rounded-xl border border-white/[0.06] bg-[#18191c] p-4',
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
              classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5',
            },
          ],
        },
      },
    },
  },
})
```

Collection themes merge after plugin-level themes.

## Themeable Directives

- `:::callout`
- `:::details`
- `:::toc`
- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`
- `:::cards`
- `:::card`
- `:::steps`
- `:::tabs`
- `:::tab`

## Parent-Child Defaults

Cards:

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

Steps:

```md
:::steps {variant="cards" stepTheme="cyan"}

### Install

Content.

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

These default theme arrays are exported:

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
