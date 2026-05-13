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
:::cards{
  columns="3"
  theme="spacious"
  cardTheme="glass"
}

:::card[Markdown Field]{
  eyebrow="Core"
  href="/getting-started/fields-and-blocks"
}
Portable Markdown content.
:::

:::card[Cyan Card]{
  eyebrow="Custom"
  theme="cyan"
}
Overrides parent `cardTheme`.
:::

:::
````

## `:::cards`

Attributes:

- `columns`: `1`, `2`, `3`, `4`, or `auto`
- `href`: optional link applied according to `linkScope`
- `linkScope`: `section`, `card`, or `title`
- `newTab`: open `href` in a new tab when `true`
- `theme`: cards container theme
- `cardTheme`: default child card theme

Defaults:

- `columns="3"`
- `linkScope="section"`
- `newTab="false"`
- `theme="default"`

Invalid columns fall back to `3` and produce a non-fatal diagnostic where diagnostics are available.

## `:::card`

Attributes:

- `[Label]`: optional card title, preferred for new Markdown
- `title`: optional card title retained for existing Markdown
- `eyebrow`: optional small label above the title
- `icon`: local icon reference such as `@fa-duotone/bolt`
- `href`: optional card link
- `linkScope`: `full` or `title`
- `newTab`: open `href` in a new tab when `true`
- `theme`: card theme

Cards support nested Markdown and render safely inside or outside a `:::cards` container.

Use expanded attributes and `[Label]` for new content:

```md
:::card[Fast Setup]{
  icon="@fa-duotone/bolt"
  theme="glass"
}
Install, configure, ship.
:::
```

Existing `title=""` content remains valid. If `[Label]` and `title` are both present, `[Label]` is used. Differing values produce a non-fatal diagnostic.

## Parent And Child Themes

`cardTheme` on `:::cards` applies to child cards that do not set their own theme:

```md
:::cards{
  columns="2"
  cardTheme="glass"
}

:::card[Inherits Glass]
Content.
:::

:::card[Overrides Parent]{theme="cyan"}
Content.
:::

:::
```

## Link Behavior

When `href` is present on `:::cards`, the whole card section is clickable by default:

```md
:::cards{href="/getting-started/fields-and-blocks"}

:::card[Markdown Field]
Portable Markdown content.
:::

:::card[Rendering]
Server-rendered output.
:::

:::
```

Section-scoped links do not support child card link overrides. Set `linkScope="card"` when each child card should inherit the parent link as a full-card link:

```md
:::cards{
  href="/getting-started/fields-and-blocks"
  linkScope="card"
}

:::card[Markdown Field]
Portable Markdown content.
:::

:::card[Custom Target]{href="/directives/cards"}
This card overrides the parent `href`.
:::

:::
```

Set `linkScope="title"` on `:::cards` when child card titles should inherit the parent link:

```md
:::cards{
  href="/getting-started/fields-and-blocks"
  linkScope="title"
}

:::card[Markdown Field]
Portable Markdown content.
:::

:::
```

When `href` is present on an individual `:::card`, the whole card is clickable by default:

```md
:::card[Markdown Field]{href="/getting-started/fields-and-blocks"}
Portable Markdown content.
:::
```

Set `linkScope="title"` on `:::card` to keep the link on the title only:

```md
:::card[Markdown Field]{
  href="/getting-started/fields-and-blocks"
  linkScope="title"
}
Portable Markdown content.
:::
```

Set `newTab` or `newTab="true"` on `:::cards` or `:::card` to open links in a new tab. Child cards can override a parent value with `newTab="false"`:

```md
:::card[External Guide]{
  href="https://example.com"
  newTab
}
Portable Markdown content.
:::
```

## Dense Grids

Use `columns="auto"` when cards have uneven lengths or the viewport width is unpredictable:

```md
:::cards{
  columns="auto"
  cardTheme="muted"
}

:::card[Short]
Small note.
:::

:::card[Longer]
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
