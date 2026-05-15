---
title: Renderer API
navTitle: Renderer
description: Render Markdown fields and blocks with server-first components.
order: 80
status: published
tags:
  - reference
  - rendering
---

# Renderer API

Use the server renderer for Markdown fields and the block component for `vlMdBlock` layout entries.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Exports

:::cards{
  columns="2"
  cardTheme="glass"
}

:::card[MarkdownRenderer]
Server component for Markdown strings stored in fields or loaded from another source.
:::

:::card[MarkdownBlockComponent]
Server component for Payload block data with `blockType: "vlMdBlock"`.
:::

:::

## Field Rendering

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: null | string }) {
  return (
    <MarkdownRenderer
      collectionSlug="posts"
      markdown={content}
      scope="field"
      variant="docs"
    />
  )
}
```

:::callout[Collection scope]{variant="tip"}
Pass `collectionSlug` when collection-level `code`, `themes`, or `config` should apply.
:::

## Block Rendering

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

export function RenderMarkdownBlock({ block }: { block: { blockType: 'vlMdBlock'; content: string } }) {
  return <MarkdownBlockComponent {...block} collectionSlug="pages" />
}
```

:::callout[Direct props]{variant="warning"}
Pass block fields directly with `{...block}`. Do not wrap the data in a `block` prop.
:::

## Fallbacks

:::details[Empty and warning fallback behavior]
`emptyFallback` renders when Markdown is empty or whitespace-only. `errorFallback` renders when compilation produces warnings and you prefer not to show the compiled HTML.
:::
