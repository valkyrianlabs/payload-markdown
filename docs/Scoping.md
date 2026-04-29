# Scoping

Config resolves from broad defaults to local overrides:

```text
plugin → collection → field/block scope → direct renderer props
```

Set `collectionSlug` when rendering directly. Without it, collection-scoped `code`, `themes`, and `config` cannot be resolved.

## Plugin-Level Defaults

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
  config: {
    size: 'lg',
    variant: 'blog',
  },
  themes: {
    card: {
      items: [
        {
          name: 'forge',
          classes: 'rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5',
        },
      ],
    },
  },
})
```

## Collection Overrides

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
  },
  collections: {
    pages: true,
    posts: {
      code: {
        lineNumbers: false,
      },
      config: {
        className: '[&_li::marker]:text-cyan-200/90',
      },
      themes: {
        card: {
          items: [
            {
              name: 'postHeroCard',
              classes: 'rounded-2xl border border-cyan-300/40 bg-cyan-950/30 p-5',
            },
          ],
        },
      },
    },
  },
})
```

Collection values override plugin-level values for that collection.

## Field and Block Scope

Use `field` and `blocks` when the same collection needs different presentation for direct fields and layout blocks:

```ts
payloadMarkdown({
  collections: {
    posts: {
      config: {
        blocks: {
          size: 'md',
          variant: 'docs',
        },
        field: {
          size: 'lg',
          variant: 'blog',
        },
      },
    },
  },
})
```

## Direct Rendering

```tsx
<MarkdownRenderer
  collectionSlug="posts"
  markdown={post.content}
  scope="field"
/>
```

## Block Rendering

`MarkdownBlockComponent` sets block scope internally:

```tsx
<MarkdownBlockComponent block={block} collectionSlug="pages" />
```
