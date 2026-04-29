# Blocks

The plugin supports both standalone Markdown fields and reusable Payload blocks. Stored content remains Markdown either way.

## Auto-Install Into Collections

```ts
payloadMarkdown({
  collections: {
    pages: true,
    posts: true,
  },
})
```

For each enabled collection, the plugin infers whether to install a field or block:

- collections without a blocks field receive a Markdown field
- collections with a blocks field receive the Markdown block in that blocks field

## Manual Block Registration

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

## Render Markdown Blocks

`vlMdBlock` is the generated block type key used by Payload typings.

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  vlMdBlock: MarkdownBlockComponent,
}

export function RenderBlocks({
  blocks,
  collectionSlug,
}: {
  blocks?: any[]
  collectionSlug?: string
}) {
  if (!blocks?.length) return null

  return blocks.map((block, i) => {
    const Block = blockComponents[block.blockType]
    if (!Block) return null

    return <Block block={block} collectionSlug={collectionSlug} key={i} />
  })
}
```

## Scoped Block Config

Use `config.blocks` when field and block rendering should differ:

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

`MarkdownBlockComponent` automatically uses block scope, so you do not need to pass `scope="blocks"` manually.
