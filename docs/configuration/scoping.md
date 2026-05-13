---
title: Scoping
navTitle: Scoping
description: Understand how global, collection, scope-specific, and renderer-level Markdown config merge.
order: 120
status: published
tags:
  - configuration
  - scoping
---

# Scoping

Config resolves from broad defaults to local overrides:

```text
plugin -> collection -> field/block scope -> direct renderer props
```

Later layers win for scalar values. Class names are joined so global and collection class additions can both apply.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Plugin Defaults

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
          name: 'brand',
          classes: 'rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5',
        },
      ],
    },
  },
})
```

These defaults apply everywhere unless a collection or renderer overrides them.

## Collection Overrides

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
  },
  collections: {
    posts: {
      code: {
        lineNumbers: false,
      },
      config: {
        className: 'posts-markdown',
        variant: 'docs',
      },
      themes: {
        card: {
          items: [
            {
              name: 'brand',
              classes: 'rounded-2xl border border-emerald-400/40 bg-emerald-950/30 p-5',
            },
          ],
        },
      },
    },
  },
  config: {
    className: 'global-markdown',
    variant: 'blog',
  },
})
```

For `posts`, the resolved `className` becomes `global-markdown posts-markdown`, while `variant` becomes `docs`.

## Field And Block Scope

Use `field` and `blocks` when the same collection needs different presentation:

```ts
payloadMarkdown({
  collections: {
    pages: {
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

`MarkdownRenderer` defaults to field scope. `MarkdownBlockComponent` uses block scope.

## Direct Rendering

```tsx
<MarkdownRenderer
  collectionSlug="posts"
  markdown={post.content}
  scope="field"
/>
```

Without `collectionSlug`, collection-scoped config cannot be resolved.

## Renderer Overrides

```tsx
<MarkdownRenderer
  collectionSlug="posts"
  code={{ lineNumbers: true }}
  markdown={post.content}
  themes={{
    callout: {
      items: [
        {
          name: 'preview',
          classes: 'rounded-xl border border-amber-400/40 bg-amber-950/20 px-4 py-3',
        },
      ],
    },
  }}
  variant="compact"
/>
```

Use local overrides for preview states, one-off pages, tests, or migration paths. Prefer plugin and collection config for repeatable production behavior.

## Theme Merge Behavior

Theme groups merge by theme name. A collection theme with the same `name` as a global theme overrides that global theme for the collection.

:::callout[Use deliberate names]{variant="tip"}
Use stable, semantic theme names such as `postHero`, `docsWarning`, or `featureCard`. These names become `data-theme` values and slugged `vl-md-*--theme-*` class modifiers.
:::
