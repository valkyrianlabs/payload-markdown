# @valkyrianlabs/payload-markdown

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

Layout-aware Markdown for Payload CMS with live preview, Shiki-powered code blocks, and deeply composable Tailwind-native styling.

Write structured, production-ready content directly in Markdown. Keep Markdown as the source of truth while the plugin handles rendering, layout directives, syntax highlighting, and scoped styling across globals, collections, fields, and blocks.

Built for blogs, docs, changelogs, and content-heavy apps that want control without fighting a bloated editor.

```bash
pnpm add @valkyrianlabs/payload-markdown
```

---

## Why this exists

Most content systems force you into one of two bad options:

- a heavy rich text editor with JSON-shaped content and inconsistent rendering
- a bare Markdown field with almost no structure and a pile of frontend cleanup work

`@valkyrianlabs/payload-markdown` takes the better path:

- plain Markdown storage
- structured layout directives
- production-ready rendering
- syntax-highlighted code blocks
- centralized styling control with local escape hatches

The goal is simple:

**write fast, render cleanly, keep control.**

---

## Highlights

- Drop-in Markdown support for Payload collections
- Markdown field and block support
- Layout-aware directives for sections and columns
- Relative heading-aware grid grouping
- Shiki-powered syntax highlighting
- Live preview-friendly renderer workflow
- Tailwind-native defaults with deep override support
- Config layering across:
    - global
    - collection
    - field vs block
    - direct component props
- Plain Markdown storage for portability and AI-assisted workflows

---

## Example

![payload-markdown example](https://project-media.cooperhlarson.com/payload-markdown_posts_example.png)

Write simple Markdown → get structured layouts instantly.

---

## Installation

```bash
pnpm add @valkyrianlabs/payload-markdown
```

---

## Register the plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'
import type { Config } from 'payload'

const config: Config = {
  plugins: [
    payloadMarkdown({
      collections: {
        posts: true,
      },
    }),
  ],
}

export default config
```

When enabled for a collection, the plugin can automatically install:

- a Markdown field when no blocks field is present
- the Markdown block into existing blocks-based layouts

---

## Render Markdown

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: string | null }) {
  if (!content) return null

  return <MarkdownRenderer markdown={content} />
}
```

### Local overrides

```tsx
<MarkdownRenderer
  markdown={post.content}
  collectionSlug="posts"
  scope="field"
  variant="blog"
  size="lg"
  className="[&_.prose a]:text-cyan-300"
  wrapperClassName="max-w-4xl"
  fullBleedCode
/>
```

Direct component props are the final override layer.

---

## Blocks

### Auto-install into blocks collections

```ts
payloadMarkdown({
  collections: {
    pages: true,
    posts: true,
  },
})
```

### Manual block registration

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

### Render the block

> `vlMdBlock` is the generated block type key used by Payload typings.  
> Always pass `collectionSlug` to ensure scoped config (collection + block) resolves correctly.

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

    return <Block key={i} block={block} collectionSlug={collectionSlug} />
  })
}
```

#### Example usage

```tsx
<RenderBlocks blocks={layout} collectionSlug="pages" />
```

---

### ⚠️ Collection scoping & overrides

When using collection-level or scoped config overrides:

- `collectionSlug` **must not be undefined**
- otherwise, collection-specific styles and behavior will not apply

This affects:

- `config.collections[slug]`
- scoped overrides (`fields` vs `blocks`)
- layout behavior tied to collection context

---

### Field usage (MarkdownRenderer)

When rendering Markdown directly (non-block usage), you must also pass `collectionSlug`:

```tsx
<MarkdownRenderer
  collectionSlug="posts"
  markdown={post.content}
/>
```

---

### ⚠️ Scope behavior

The `MarkdownBlockComponent` automatically uses:

```ts
scope = 'block'
```

So you do **not** need to set it manually when using blocks.

However, when using `MarkdownRenderer` directly with scoped config, you should explicitly set:

```tsx
<MarkdownRenderer
  collectionSlug="posts"
  scope="field"
  markdown={post.content}
/>
```

---

### Scope rules

- `block` → used internally by block renderer
- `field` → required for direct renderer usage when using scoped config
- unset → falls back to global / collection defaults

---

### TL;DR

If you're using scoped config:

- always pass `collectionSlug`
- use `scope="field"` for direct renderer usage
- let block components handle their own scope automatically

---

## Layout-aware Markdown

The plugin supports structural layout directives directly in Markdown.

### Opening directives

- `:::section`
- `:::2col`
- `:::3col`

### Closing directives

- `:::` closes the current layout scope
- `:::endcol` explicitly closes the active grid
- `:::end` closes the current section and any nested grids
- `:::endsection` closes the current section and any nested grids

### Example

```markdown
:::section

# Interfaces Without Friction

Short intro text here.

:::3col

## Native CLI

Scriptable. Fast. Lives where you work.

## WebSocket Core

Real-time by design. Not bolted on later.

## Web UI

Clean, responsive, API-first.

:::

# Synchronization That Makes Sense

More section-level content here.

:::3col

## Cache

Pull what you need. Drop what you don’t.

## Sync

Two-way. Conflict-aware.

## Mirror

One-way truth. Perfect for backups.

## Close the section with (option 1)
:::  <-- this will close the column grid -->

:::  <-- this will close the section -->

## Close the section with (option 2)
:::end  <-- this will close the section and any open grids -->
```

### Layout rules

Grids are heading-aware relative to where they open.

If a grid opens under a heading of depth `N`, then:

- headings at depth `N + 1` are treated as cell boundaries
- deeper headings stay nested inside the current cell
- grids can be explicitly closed with `:::endcol`
- a section can close all nested grids with `:::end` or `:::endsection`

### Current recommendation

Keep grid opens explicit.

Open a new `:::2col` or `:::3col` when you want a new grid region. This keeps layout intent obvious and avoids over-inference in long-form content.

---

## Code Blocks & Syntax Highlighting

![code blocks example](https://project-media.cooperhlarson.com/payload-markdown_code_blocks_example.png)

Code fences are rendered with Shiki, the same high-fidelity highlighting engine used by VS Code.

That gives you:

- accurate tokenization
- broad language support
- stable themed output
- no client-side syntax highlighter overhead

Shiki rendering happens during the markdown compile pipeline, so code blocks ship as finished HTML instead of requiring runtime highlighting in the browser.

---

## Styling Model

The renderer ships with strong default styling and can be customized at multiple layers.

### Override order

```text
global → collection → scope (field/block) → direct component props
```

Later layers win.

### Styling surfaces

- `className` → applied to the rendered markdown element itself
- `wrapperClassName` → applied to the outer wrapper
- `sectionClassName` → applied to rendered section containers
- `columnClassName` → applied to generated cell containers inside grids

### Example global config

```ts
payloadMarkdown({
  config: {
    variant: 'blog',
    size: 'lg',
    enableGutter: true,
    fullBleedCode: true,
    mutedHeadings: true,

    className: '[& li::marker]:text-foreground/55',
    wrapperClassName: 'max-w-4xl',
    sectionClassName: 'bg-white/10 backdrop-blur-xl rounded-2xl p-6 my-10',
    columnClassName: 'gap-8 md:gap-12',

    options: {
      theme: 'github-dark',
    },
  },
})
```

### Fully scoped config

```ts
payloadMarkdown({
  config: {
    fields: {
      variant: 'blog',
      size: 'lg',
    },
    blocks: {
      variant: 'compact',
      size: 'md',
    },
  },
  collections: {
    posts: {
      config: {
        fields: {
          wrapperClassName: 'max-w-3xl',
        },
        blocks: {
          sectionClassName: 'border border-white/10 bg-white/5 rounded-2xl p-6',
        },
      },
    },
  },
})
```

### Tailwind Typography

For best results, enable Tailwind Typography and scan the package output:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

---

## Renderer Options

```tsx
<MarkdownRenderer
  markdown={content}
  collectionSlug="posts"
  scope="field"
  variant="blog"
  size="lg"
  enableGutter
  fullBleedCode
  mutedHeadings
/>
```

### Common props

- `markdown`
- `collectionSlug`
- `scope`
- `variant`
- `size`
- `className`
- `wrapperClassName`
- `enableGutter`
- `fullBleedCode`
- `mutedHeadings`

---

## Compile Pipeline

Under the hood, the renderer uses a structured compile pipeline:

- normalize layout syntax
- parse Markdown
- apply layout sentinels
- transform layout directives
- convert remark → rehype
- render code blocks with Shiki
- sanitize output
- apply layout and style classes
- stringify HTML

That architecture keeps layout handling explicit, HTML safe, and styling predictable.

---

## AI-Friendly by Design

Content stays stored as plain Markdown.

That makes it naturally compatible with AI workflows:

- rewrite or expand drafts in ChatGPT or Claude
- summarize or restructure long content
- move content between tools without schema conversion
- keep diffs clean and portable

No proprietary editor format. No giant rich text JSON payloads. Just Markdown.

---

## Why teams like this model

- content stays readable in raw form
- styling can be managed centrally
- collection-specific presentation is easy to control
- one-off render tweaks do not require rewriting global defaults
- content authors do not have to fight a bloated WYSIWYG editor

---

## Roadmap

- continued ergonomics work around layout authoring
- further documentation and examples
- more polished editor workflow
- continued stabilization toward a major release

---

## Philosophy

This package is opinionated about a few things:

- Markdown should stay the source of truth
- layout should be structured, not improvised in the frontend
- defaults should look good without becoming hard to override
- the renderer should respect its container instead of secretly owning page layout

If that sounds like your kind of system, this plugin was built for you.
