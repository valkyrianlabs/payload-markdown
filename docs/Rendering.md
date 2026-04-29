# Rendering

Markdown rendering is server-friendly and centralized in the plugin renderer. The same renderer pipeline handles normal Markdown, Shiki code blocks, heading anchors, and registry-backed directives.

## Render a Markdown Field

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: string | null }) {
  if (!content) return null

  return <MarkdownRenderer collectionSlug="posts" markdown={content} scope="field" />
}
```

Set `collectionSlug` when you want collection-scoped `code`, `themes`, or `config` to apply. Use `scope="field"` for direct field rendering.

## Local Renderer Overrides

Direct component props are the final override layer:

```tsx
<MarkdownRenderer
  code={{
    fullBleed: true,
    lineNumbers: true,
  }}
  collectionSlug="posts"
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

Most applications should prefer plugin-level or collection-level config. Renderer-level overrides are useful for one-off pages and previews.

## Common Props

- `markdown`
- `collectionSlug`
- `scope`
- `variant`
- `size`
- `className`
- `wrapperClassName`
- `enableGutter`
- `mutedHeadings`
- `code`
- `themes`

## Legacy Props

`fullBleedCode` still works as a deprecated alias for `code.fullBleed`. Prefer:

```tsx
<MarkdownRenderer
  code={{ fullBleed: true }}
  markdown={content}
/>
```

instead of:

```tsx
<MarkdownRenderer fullBleedCode markdown={content} />
```

## Blocks

The block renderer resolves block scope automatically:

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

<MarkdownBlockComponent block={block} collectionSlug="pages" />
```
