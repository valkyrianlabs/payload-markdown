# Cards

Use `:::cards` for card grids and `:::card` for individual cards.

```md
:::cards {columns="3" theme="spacious" cardTheme="glass"}

:::card {eyebrow="Core" title="Markdown Field" href="/docs/markdown-field"}
Portable Markdown content.
:::

:::card {eyebrow="Custom" title="Cyan Card" theme="cyan"}
Overrides parent cardTheme.
:::

:::
```

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
- `href`: optional title link
- `theme`: card theme

Cards support nested Markdown and render safely inside or outside a `:::cards` container.

## Parent and Child Themes

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

When `href` is present, the card title is linked:

```md
:::card {title="Markdown Field" href="/docs/markdown-field"}
Portable Markdown content.
:::
```

The renderer avoids turning the entire card into a link so nested Markdown cannot create invalid nested anchors.

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
