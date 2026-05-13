---
title: Rich Examples
navTitle: Rich Examples
description: Copy rich Markdown examples for blog posts, docs pages, landing sections, and comparison content.
order: 320
status: published
tags:
  - authoring
  - examples
---

# Rich Examples

These examples are intended to be copied into a Markdown field, Markdown block, or Git-backed docs file.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Blog Post

````md
# Building With Portable Markdown

:::toc[Contents]{depth="3" theme="compact"}
:::

## Why Markdown

Markdown keeps posts portable while the renderer handles presentation.

:::callout[Keep content portable]{variant="tip"}
Use directives for structure, not arbitrary HTML.
:::

## Code

```ts
payloadMarkdown({
  collections: {
    posts: true,
  },
})
```

:::details[Advanced notes]{theme="glass"}
Collection-level `code`, `themes`, and `config` can override plugin defaults.
:::
````

## Documentation Page

````md
# Payload Markdown Setup

:::toc[On this page]{depth="3"}
:::

:::steps{
  variant="cards"
  layout="stack"
  numbered
  stepTheme="cyan"
}

### Install

```bash
pnpm add @valkyrianlabs/payload-markdown
```

### Register The Plugin

Add `payloadMarkdown()` to your Payload config.

### Render Content

Use `MarkdownRenderer` from the server export.

:::

:::callout[Remember collectionSlug]{variant="warning"}
Pass `collectionSlug` when collection-scoped config should apply.
:::
````

## Package Manager Tabs

````md
:::tabs{
  default="pnpm"
  theme="glass"
  tabTheme="muted"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::
````

## Landing Section

```md
:::section{theme="panel"}

## Build Docs Without Losing Markdown

:::cards{
  columns="3"
  theme="spacious"
  cardTheme="glass"
}

:::card[Markdown Field]{
  eyebrow="Core"
  href="/getting-started/fields-and-blocks"
}
Portable Markdown content with live preview.
:::

:::card[Directive Autocomplete]{
  eyebrow="Authoring"
  theme="cyan"
}
Snippets, placeholders, and lightweight diagnostics.
:::

:::card[Server Rendered]{eyebrow="Rendering"}
Shiki code blocks, heading anchors, TOCs, and themed directives.
:::

:::

:::
```

## Comparison Layout

````md
:::2col{cellTheme="panel"}

### Field Content

Use direct Markdown fields for articles, posts, docs, release notes, and single long-form bodies.

```tsx
<MarkdownRenderer collectionSlug="posts" markdown={post.body} />
```

### Block Content

Use `vlMdBlock` inside layout builders when Markdown is one section among other blocks.

```tsx
<MarkdownBlockComponent {...block} collectionSlug="pages" />
```

:::
````

## Warning And Recovery Pattern

````md
:::callout[Production migration]{variant="danger"}
Back up production data before reconciling Payload schema fields.
:::

:::details[Recovery checklist]
1. Restore from backup if a schema reconciliation removed expected fields.
2. Re-run locally with the same collection config.
3. Migrate deprecated `config.options` values into `code`.
:::
````
