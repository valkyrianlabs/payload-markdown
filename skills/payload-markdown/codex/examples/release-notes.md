---
title: Version 1.4.0
navTitle: v1.4.0
description: New authoring primitives, icon packs, and directive improvements.
order: 10
status: published
tags:
  - releases
  - changelog
---

# Version 1.4.0

Version 1.4.0 improves directive authoring, local SVG icon usage, and rich docs composition.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Highlights

:::cards{
  columns="3"
  theme="spacious"
  cardTheme="glass"
}

:::card[Readable Labels]{eyebrow="Authoring"}
Use `[Title]` directive labels for visible titles instead of dense attribute lists.
:::

:::card[Local Icons]{eyebrow="Rendering"}
Reference local SVG packs with `@pack/name` on buttons, cards, and callouts.
:::

:::card[Safer Links]{eyebrow="Cards"}
Use `linkScope="title"` when card bodies contain nested links or buttons.
:::

:::

## Migration Notes

:::callout[No stored content migration required]{variant="success"}
Existing `title=""` directive attributes remain supported. New docs should prefer `[Label]`.
:::

:::details[Code config aliases]
Legacy `config.options` code settings still work, but new docs should use the top-level `code` namespace.
:::

## Upgrade Steps

:::steps

### Update The Package

```bash
pnpm up @valkyrianlabs/payload-markdown
```

### Review Custom Themes

Confirm theme objects use `classes`, not `className`.

### Refresh Examples

Prefer labels, multiline attributes, and card link scopes in new docs.

:::
