---
title: Cards
navTitle: Cards
description: Use card grids and individual cards for overview pages, feature lists, and related links.
order: 250
status: published
tags:
  - directives
  - cards
---

# Cards

Use `:::cards` for card grids and `:::card` for individual cards.

````md
:::cards {columns="3" theme="spacious" cardTheme="glass"}

:::card {eyebrow="Core" title="Markdown Field" href="/getting-started/fields-and-blocks"}
Portable Markdown content.
:::

:::card {eyebrow="Custom" title="Cyan Card" theme="cyan"}
Overrides parent `cardTheme`.
:::

:::
````

## `:::cards`

Attributes:

- `columns`: `1`, `2`, `3`, `4`, or `auto`
- `theme`: cards container theme
- `cardTheme`: default child card theme

Defaults:

- `columns="3"`
- `theme="default"`

Invalid columns fall back to `3` and produce a non-fatal diagnostic where diagnostics are available.

## `:::card`

Attributes:

- `title`: optional card title
- `eyebrow`: optional small label above the title
- `href`: optional card link
- `linkScope`: `full` or `title`
- `newTab`: open `href` in a new tab when `true`
- `theme`: card theme

Cards support nested Markdown and render safely inside or outside a `:::cards` container.

## Parent And Child Themes

`cardTheme` on `:::cards` applies to child cards that do not set their own theme:

```md
:::cards {columns="2" cardTheme="glass"}

:::card {title="Inherits Glass"}
Content.
:::

:::card {title="Overrides Parent" theme="cyan"}
Content.
:::

:::
```

## Link Behavior

When `href` is present, the whole card is clickable by default:

```md
:::card {title="Markdown Field" href="/getting-started/fields-and-blocks"}
Portable Markdown content.
:::
```

Set `linkScope="title"` to keep the link on the title only:

```md
:::card {title="Markdown Field" href="/getting-started/fields-and-blocks" linkScope="title"}
Portable Markdown content.
:::
```

Set `newTab` or `newTab="true"` to open the card link in a new tab:

```md
:::card {title="External Guide" href="https://example.com" newTab}
Portable Markdown content.
:::
```

## Dense Grids

Use `columns="auto"` when cards have uneven lengths or the viewport width is unpredictable:

```md
:::cards {columns="auto" cardTheme="muted"}

:::card {title="Short"}
Small note.
:::

:::card {title="Longer"}
Longer content can wrap without forcing every card into a rigid column.
:::

:::
```

## Themes

Built-in card themes:

- `default`
- `muted`
- `glass`
- `cyan`
- `violet`
- `emerald`
- `amber`
- `danger`

Built-in cards container themes:

- `default`
- `compact`
- `spacious`
- `feature-grid`
