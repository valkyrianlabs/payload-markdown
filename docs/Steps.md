# Steps

Use `:::steps` for tutorials, install flows, and procedural docs.

## Default Steps

```md
:::steps

### Install

Content.

### Configure

Content.

:::
```

`:::steps` without a variant renders the default ordered docs flow.

This is equivalent:

```md
:::steps {variant="default"}

### Install

Content.

:::
```

## Card Steps

Card steps are for richer procedural sections. They render as a vertical numbered stack by default:

```md
:::steps {variant="cards" layout="stack" numbered stepTheme="cyan"}

### Install

Content.

### Configure

Content.

:::
```

Grid mode is explicit:

```md
:::steps {variant="cards" layout="grid" columns="2" numbered}

### Install

Content.

### Configure

Content.

:::
```

## Attributes

- `variant`: `default` or `cards`
- `layout`: `stack` or `grid` for card steps
- `columns`: `1`, `2`, `3`, `4`, or `auto` for card-step grid layout
- `numbered`: visible generated numbers for card steps
- `theme`: steps wrapper theme
- `stepTheme`: card theme applied to individual step cards

Defaults:

- `variant="default"`
- `layout="stack"` when `variant="cards"`
- `columns="2"` when `variant="cards"` and `layout="grid"`
- `numbered="true"` when `variant="cards"`

Invalid values fall back safely and produce non-fatal diagnostics where diagnostics are available.

## Nested Markdown

Code fences, callouts, details, and normal Markdown render inside steps:

````md
:::steps {variant="cards" stepTheme="glass"}

### Install

```bash
pnpm add @valkyrianlabs/payload-markdown
```

### Configure

:::callout {variant="tip"}
Use collection-scoped config for posts.
:::

:::
````

## Themes

Built-in steps wrapper themes:

- `default`
- `muted`
- `glass`
- `cyan`

`stepTheme` uses card themes, so values such as `default`, `glass`, `cyan`, `violet`, `emerald`, `amber`, and `danger` are available by default.
