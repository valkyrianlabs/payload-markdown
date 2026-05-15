# Payload Markdown Directives

Payload Markdown directives are Markdown-native structure. Use labels for visible titles and attributes for behavior.

## Syntax Rules

- Prefer `[Label]` for visible names.
- Use multiline attributes when a directive has more than one or two attributes.
- Boolean attributes may be bare only where the directive supports them.
- Close container directives with `:::` unless a specific structural closer is clearer.

Example:

```md
:::card[Fast Setup]{
  href="/getting-started/installation"
  linkScope="title"
  icon="@fa-duotone/bolt"
}
Install, configure, ship.
:::
```

## Directive Inventory

- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- `::button`
- `:::buttons`
- `:::tabs`
- `:::tab`
- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`

## Callouts

Use callouts for information that changes how the reader should interpret or execute a task.

Attributes:

- `variant`: `note`, `info`, `tip`, `warning`, `danger`, or `success`
- `theme`: `soft`, `solid`, `glass`, or a configured theme
- `icon`: local icon reference
- `[Label]` or legacy `title`

```md
:::callout[Production migration]{variant="danger"}
Back up production data before reconciling schema changes.
:::
```

## Details

Use details for optional information, caveats, error shapes, compatibility notes, or advanced paths.

Attributes:

- `[Label]` or legacy `title`
- `open`: `open="true"` for initially open
- `theme`: `default`, `muted`, `glass`, or a configured theme

```md
:::details[Advanced notes]{theme="glass"}
These notes are useful after the basic setup is working.
:::
```

## Table Of Contents

Use a TOC on long pages with several H2 or H3 sections.

Attributes:

- `[Label]` or legacy `title`
- `depth`: `1` through `6`
- `theme`: `default`, `compact`, `sidebar`, or a configured theme

```md
:::toc[On this page]{depth="3" theme="compact"}
:::
```

## Steps

Use steps for ordered procedures. Start each step with a heading.

Attributes:

- `variant`: `default` or `cards`
- `layout`: `stack` or `grid` for card steps
- `columns`: `1`, `2`, `3`, `4`, or `auto` for card-step grid layout
- `numbered`: generated visible numbers for card steps
- `theme`: steps wrapper theme
- `stepTheme`: card theme for individual step cards

```md
:::steps{
  variant="cards"
  layout="stack"
  numbered
  stepTheme="cyan"
}

### Install

Install the package.

### Configure

Register the plugin.

:::
```

## Cards

Use cards for page maps, capability groups, related links, and compact summaries.

`:::cards` attributes:

- `columns`: `1`, `2`, `3`, `4`, or `auto`
- `href`: inherited or section-level link
- `linkScope`: `section`, `card`, or `title`
- `newTab`: open links in a new tab
- `theme`: cards container theme
- `cardTheme`: default child card theme

`:::card` attributes:

- `[Label]` or legacy `title`
- `eyebrow`
- `icon`
- `href`
- `linkScope`: `full` or `title`
- `newTab`
- `theme`

Use `linkScope="title"` when the card body contains buttons or links.

```md
:::cards{
  columns="3"
  cardTheme="muted"
}

:::card[Configuration]{
  href="/configuration"
  linkScope="title"
}
Code, themes, icons, and renderer defaults.
:::

:::
```

## Buttons

Use button links for clear actions. Do not use snippet-only names such as `::button_icon` in source.

`::button` attributes:

- `href`: required
- `variant`: `primary`, `secondary`, `outline`, `ghost`, or `link`
- `size`: `sm`, `md`, or `lg`
- `icon`: local icon reference
- `iconPosition`: `left` or `right`
- `newTab`
- `ariaLabel` for icon-only buttons

`:::buttons` attributes:

- `align`: `left`, `center`, or `right`
- `stack`: `mobile`, `always`, or `never`
- `gap`: `sm`, `md`, or `lg`

```md
:::buttons{align="center" stack="mobile" gap="md"}
::button[Read Docs]{href="/getting-started" variant="primary"}
::button[GitHub]{href="https://github.com/valkyrianlabs" variant="secondary" newTab=true}
:::
```

## Tabs

Use tabs for equivalent alternatives. Avoid tabs when the content is sequential.

`:::tabs` attributes:

- `default`: selected tab value on first render
- `theme`: tabs container theme
- `tabTheme`: default panel theme

`:::tab` attributes:

- `[Label]` or legacy `label`
- `value`
- `theme`
- `disabled`

````md
:::tabs{default="pnpm" theme="glass" tabTheme="muted"}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add package-name
```
:::

:::tab[npm]{value="npm"}
```bash
npm install package-name
```
:::

:::
````

## Layout

Use layout directives sparingly for dense overview pages.

- `:::section` supports `theme`.
- `:::2col` and `:::3col` support `theme` and `cellTheme`.
- `:::cell` supports `theme`.
- `:::endcol` explicitly closes an active grid.
- `:::endsection` explicitly closes an active section.

```md
:::2col{cellTheme="panel"}

### Field Mode

Use for long-form docs, posts, and articles.

### Block Mode

Use when Markdown is one block in a layout builder.

:::
```
