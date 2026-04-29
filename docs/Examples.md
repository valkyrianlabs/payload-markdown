# Examples

These examples are intended to be copied into a Markdown field or Markdown block.

## Blog Post

````md
# Building with Portable Markdown

:::toc {title="Contents" depth="3" theme="compact"}
:::

## Why Markdown

Markdown keeps posts portable while the renderer handles presentation.

:::callout {variant="tip" title="Keep content portable"}
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

:::details {title="Advanced notes" theme="glass"}
Collection-level `code`, `themes`, and `config` can override plugin defaults.
:::
````

## Docs Page

````md
# Payload Markdown Setup

:::toc {title="On this page" depth="3"}
:::

:::steps {variant="cards" layout="stack" numbered stepTheme="cyan"}

### Install

```bash
pnpm add @valkyrianlabs/payload-markdown
```

### Register the plugin

Add `payloadMarkdown()` to your Payload config.

### Render content

Use `MarkdownRenderer` from the server export.

:::

:::callout {variant="warning" title="Remember collectionSlug"}
Pass `collectionSlug` when collection-scoped config should apply.
:::
````

## Landing Page

```md
:::section {theme="panel"}

## Build docs without losing Markdown

:::cards {columns="3" theme="spacious" cardTheme="glass"}

:::card {eyebrow="Core" title="Markdown Field" href="/docs/markdown-field"}
Portable Markdown content with live preview.
:::

:::card {eyebrow="Authoring" title="Directive Autocomplete" theme="cyan"}
Snippets, placeholders, and lightweight diagnostics.
:::

:::card {eyebrow="Rendering" title="Server Rendered"}
Shiki code blocks, heading anchors, TOCs, and themed directives.
:::

:::

:::
```
