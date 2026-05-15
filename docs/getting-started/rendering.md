---
title: Rendering
navTitle: Rendering
description: Render Markdown fields and blocks with server-first components and scoped configuration.
order: 40
status: published
tags:
  - getting-started
  - rendering
---

# Rendering

Markdown rendering is server-friendly and centralized in the plugin renderer. The same pipeline handles Markdown, GFM, Shiki code blocks, heading anchors, sanitized HTML, and registry-backed directives.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Render A Markdown Field

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: string | null }) {
  return (
    <MarkdownRenderer
      collectionSlug="posts"
      markdown={content}
      scope="field"
    />
  )
}
```

Set `collectionSlug` when you want collection-scoped `code`, `themes`, or `config` to apply.

## Renderer Props

Common props:

- `markdown`: Markdown source string
- `collectionSlug`: collection key used for config resolution
- `scope`: `field` or `blocks`
- `variant`: `blog`, `docs`, `compact`, or `unstyled`
- `size`: `lg`, `md`, or `sm`
- `as`: HTML tag for the rendered Markdown container, defaulting to `article`
- `className`: class names for the Markdown element
- `wrapperClassName`: class names for the outer wrapper
- `enableGutter`: adds horizontal wrapper padding
- `mutedHeadings`: slightly reduces heading contrast
- `emptyFallback`: returned for empty or whitespace-only Markdown
- `errorFallback`: returned when compilation produces warnings and you prefer a fallback
- `code`: local Shiki and code fence overrides
- `icons`: local SVG icon pack overrides
- `themes`: local directive theme overrides

## Local Overrides

Direct component props are the final override layer:

```tsx
<MarkdownRenderer
  as="section"
  code={{
    fullBleed: true,
    lineNumbers: true,
  }}
  collectionSlug="posts"
  emptyFallback={<p>No content yet.</p>}
  markdown={post.content}
  scope="field"
  size="lg"
  themes={{
    card: {
      items: [
        {
          name: 'localFeature',
          classes: 'rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5',
        },
      ],
    },
  }}
  variant="blog"
  wrapperClassName="max-w-4xl"
/>
```

Most applications should prefer plugin-level or collection-level config. Renderer-level overrides are useful for previews, one-off marketing pages, and admin-only rendering surfaces.

## Render Blocks

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

export function MarkdownLayoutBlock({
  block,
  collectionSlug,
}: {
  block: {
    blockType: 'vlMdBlock'
    content: string
  }
  collectionSlug?: string
}) {
  return <MarkdownBlockComponent {...block} collectionSlug={collectionSlug} />
}
```

`MarkdownBlockComponent` resolves block scoped defaults with `resolveMarkdownBlockDefaults(collectionSlug)` and passes `scope="blocks"` to `MarkdownRenderer`.

## Sanitized HTML And GFM

The render pipeline uses `remark-gfm`, `rehype-raw`, and `rehype-sanitize`. Markdown tables, task lists, strikethrough, and raw HTML are parsed, but unsupported or unsafe HTML is sanitized. Authored inline `style` attributes are stripped before final output.

:::details[When warnings matter]
`compileMarkdown()` returns warnings for malformed directives, invalid directive attributes, unknown themes, and renderer failures. `MarkdownRenderer` returns `errorFallback` when warnings exist and `errorFallback` is provided.
:::
