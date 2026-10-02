---
title: Fields And Blocks
navTitle: Fields & Blocks
description: Understand automatic field and block installation, manual schema control, and block rendering requirements.
order: 30
status: published
tags:
  - getting-started
  - payload
  - blocks
---

# Fields And Blocks

Payload Markdown supports both direct Markdown fields and reusable Payload blocks. Both store Markdown source; the difference is how the content is placed in your schema.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Automatic Install Behavior

```ts
payloadMarkdown({
  collections: {
    pages: true,
    posts: true,
  },
})
```

For each enabled collection:

- if the collection has no `blocks` field, the plugin adds a Markdown text field
- if the collection has a `blocks` field, the plugin installs `MarkdownBlock` into that field
- if both are disabled explicitly, the collection is recorded in plugin settings but no schema field is added

## Explicit Install Options

Use `installField` and `installIntoBlocks` when inference is not what you want.

```ts
payloadMarkdown({
  collections: {
    pages: {
      fieldName: 'body',
      installField: true,
      installIntoBlocks: true,
    },
  },
})
```

This is useful for page collections that have a layout builder but also need a primary Markdown body.

## Manual Markdown Field

Use `markdownField()` when you want direct schema ownership.

```ts
import { markdownField } from '@valkyrianlabs/payload-markdown'

export const Posts = {
  slug: 'posts',
  fields: [
    markdownField({
      name: 'body',
      label: 'Body Markdown',
      localized: true,
      required: true,
    }),
  ],
}
```

`markdownField()` returns a Payload `text` field with the admin field component already wired to `PayloadMarkdownField`.

## Manual Block Registration

Use `MarkdownBlock` when you want to place the block yourself.

```ts
import { MarkdownBlock } from '@valkyrianlabs/payload-markdown'

export const Pages = {
  slug: 'pages',
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: [MarkdownBlock],
    },
  ],
}
```

The block slug is `vlMdBlock`. Generated Payload types use that value as the block type discriminator.

## Render Block Entries

`MarkdownBlockComponent` accepts the block data fields directly. In a block renderer, pass the block object through as props and include `collectionSlug` when collection-scoped config should apply.

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  vlMdBlock: MarkdownBlockComponent,
}

export function RenderBlocks({
  blocks,
  collectionSlug,
}: {
  blocks?: Array<{ blockType?: string }>
  collectionSlug?: string
}) {
  if (!blocks?.length) return null

  return blocks.map((block, index) => {
    const Block = block.blockType ? blockComponents[block.blockType] : undefined
    if (!Block) return null

    return <Block {...block} collectionSlug={collectionSlug} key={index} />
  })
}
```

:::callout[Do not wrap the block in a block prop]{variant="warning"}
`MarkdownBlockComponent` accepts block data as direct props and renders the `content` field. Pass `{...block}`, not `block={block}`.
:::

## Field And Block Presentation

Use a split `config` object when fields and blocks need different typography or wrappers:

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

`MarkdownBlockComponent` resolves block scope internally. Direct field rendering should use `scope="field"` or omit `scope`, since `field` is the default.

## Per-Block Params

Each markdown block has a **Markdown Blocks Params** group. While **Enable Blocks Params** is unchecked, the block renders with the global and collection block settings above.

Checking it fills the block's fields with exactly those effective values: the global `config`, then the collection's `config.blocks` and `code`, then the renderer's defaults. Enabling therefore changes nothing until you edit a field, and you only change the values you need. Unchecking clears the fields again.

For a block with params enabled, the block's values are the highest-precedence layer for that block:

| Layer | Precedence |
|---|---|
| Block params (enabled) | highest |
| Collection `config.blocks` and collection `code` | |
| Global `config` (blocks) and global `code` | |
| Renderer defaults | lowest |

A set block value replaces the inherited one (class names included). An empty or unset value inherits, so clearing a field never removes global or collection settings. The fields map to renderer options: `showLineNumbers` → `code.lineNumbers`, `theme` → `code.shikiTheme`, `enhancedCodeBlocks` → `code.enhanced` and `fullBleedCode` → `code.fullBleed`.

Pass every block field to `MarkdownBlockComponent` (`<Block {...block} />`, as shown above) so `md-params` reaches it. The "Enable Blocks Params" checkbox is an admin component: run `payload generate:importmap` after upgrading so it appears in your import map.
