# @valkyrianlabs/payload-markdown

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

```bash
pnpm add @valkyrianlabs/payload-markdown
```

Markdown for Payload CMS — with clean rendering, Shiki-powered code blocks, and layout-aware directives.

Write structured, production-ready content directly in Markdown — no MDX, no custom components, no bloated editors.

Markdown stays the source of truth. Layout, styling, and structure are handled for you.

Built for blogs, docs, and content-heavy apps.

You should be able to write a complete blog post without touching the mouse.

---

## Example

![payload-markdown example](https://project-media.cooperhlarson.com/payload-markdown_posts_example.png)

Write simple Markdown → get structured layouts instantly.

---

## Features

- Drop-in Markdown support for Payload CMS
- Layout-aware Markdown with sections and columns
- Shiki-powered syntax highlighting
- Clean, Tailwind-friendly rendered output
- Lightweight editor workflow without heavy WYSIWYG overhead
- Plain Markdown storage for portability and AI collaboration
- Extensible remark / rehype pipeline

---

## Layout-Aware Markdown

Write structured content directly in Markdown with simple block directives.

Supported opening directives:

- `:::section`
- `:::2col`
- `:::3col`

Close blocks with:

- `:::`
- `:::end`
- `:::endsection`
- `:::endcol`

### Section example

```markdown
:::

# My content here

:::
```

### Column example

```markdown
:::

## Column 1

Some content for the first column.

## Column 2

Some content for the second column.

:::
```

### Full example

```markdown
:::

# My Blog Post

This is a blog post with a two-column layout.

:::

## Column 1

Some content for the first column.

## Column 2

Some content for the second column.

:::
```

Structured layouts without switching formats, wiring up custom MDX components, or forcing authors into a visual editor.

---

## Code Blocks & Syntax Highlighting

![code blocks example](https://project-media.cooperhlarson.com/payload-markdown_code_blocks_example.png)

Markdown code blocks are rendered with high-fidelity syntax highlighting powered by Shiki — the same engine used by VS Code.

That gives you:

- accurate tokenization
- broad language support
- consistent theming
- zero client-side highlighting overhead

Unlike browser highlighters that parse code at runtime, Shiki generates styled HTML during rendering. You get IDE-grade output without shipping extra JavaScript.

Whether you're publishing blog posts, tutorials, API documentation, or internal guides, code blocks stay sharp, readable, and production-ready.

---

## AI-Friendly by Design

Content is stored as plain Markdown.

That makes it naturally compatible with AI workflows:

- copy content into ChatGPT, Claude, or other tools
- rewrite, expand, summarize, or refactor it
- paste it back without schema conversion or formatting loss

No proprietary document format. No JSON lock-in. Just Markdown.

---

## Installation

```bash
npm install @valkyrianlabs/payload-markdown
```

---

## Usage

### Register the plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

export default {
  plugins: [
    payloadMarkdown({
      collections: {
        posts: true,
      },
    }),
  ],
}
```

That’s it.

- Adds a Markdown field or block automatically
- Handles rendering defaults internally
- No extra wiring required

---

## Rendering Markdown

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

<MarkdownRenderer markdown={post.content} />
```

You can optionally pass renderer options:

```tsx
<MarkdownRenderer
  markdown={post.content}
  variant="blog"
  size="lg"
/>
```

---

## Using Blocks

### Auto-install (recommended)

```ts
payloadMarkdown({
  collections: {
    pages: true,
    posts: true,
  },
})
```

---

### Manual install

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

---

### Render blocks

```tsx
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  vlMdBlock: MarkdownBlockComponent,
}

export function RenderBlocks({ blocks, collectionSlug }) {
  if (!blocks?.length) return null

  return blocks.map((block, i) => {
    const Block = blockComponents[block.blockType]
    if (!Block) return null

    return (
      <div key={i} className="my-16">
        <Block block={block} collectionSlug={collectionSlug} />
      </div>
    )
  })
}
```

---

## Styling

Out of the box, the renderer produces clean HTML with sensible defaults.

For best results, use Tailwind Typography:

```bash
npm install @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

---

## Configuration

### Global config

```ts
payloadMarkdown({
  config: {
    variant: 'blog',
    size: 'lg',

    centered: true,
    enableGutter: true,

    className: 'prose prose-lg max-w-none dark:prose-invert',
    wrapperClassName: 'mx-auto max-w-4xl px-4',

    sectionClassName: 'bg-white/20 backdrop-blur-xl rounded-2xl p-6 my-10',
    columnClassName: 'gap-8 md:gap-12',

    options: {
      theme: 'github-dark',
    },
  },
})
```

This applies to everything:

- fields
- blocks
- all collections

---

## Scoped Configuration

You can override config at different levels:

### 1. Global

```ts
config: { ... }
```

---

### 2. Split global (fields vs blocks)

```ts
config: {
  fields: { ... },
  blocks: { ... },
}
```

---

### 3. Per collection

```ts
collections: {
  posts: {
    config: { ... }
  }
}
```

---

### 4. Fully scoped

```ts
collections: {
  posts: {
    config: {
      fields: { ... },
      blocks: { ... },
    },
  },
}
```

---

### Mental model

```
global → collection → scope (field/block)
```

Later overrides win.

---

## Layout Styling

Layout directives (`:::section`, `:::2col`, etc.) are:

1. parsed in remark
2. converted to structured nodes
3. sanitized
4. styled after sanitize (rehype pass)

This means:

- classes are not stripped
- overrides are applied last
- layout stays predictable

---

## Example: Custom layout styling

```ts
payloadMarkdown({
  config: {
    sectionClassName:
      'bg-white/20 backdrop-blur-xl rounded-2xl p-6 my-10 border border-white/10',

    columnClassName:
      'gap-8 md:gap-12 [&>h2]:text-blue-500',
  },
})
```

---

## Renderer Options

```tsx
<MarkdownRenderer
  markdown={content}
  variant="blog"
  size="lg"
  centered
  enableGutter
  fullBleedCode
/>
```

---

## Under the hood

This plugin treats Markdown as a compile pipeline:

- remark → structure
- rehype → HTML transform
- sanitize → safety
- post-pass → styling + layout injection

This enables:

- layout-aware Markdown
- safe HTML output
- predictable styling overrides
- zero client-side hacks

---

## Custom Styling Templates

Markdown Block ships with a complete set of overrides for all the major Markdown elements, so you can customize the look and feel of your content with Tailwind.

Aside from the default styles, you can define a global base template that applies to all Markdown content, and/or collection-specific templates for more granular control.

### In your `payload.config.ts`:

```ts
plugins: [
  payloadMarkdown({
    config: {
      size: 'lg',
      variant: 'blog',

      centered: true,
      enableGutter: true,
      fullBleedCode: true,
      mutedHeadings: true,

      className: 'prose prose-lg max-w-none dark:prose-invert',
      wrapperClassName: 'mx-auto max-w-4xl px-4',

      sectionClassName: 'bg-white/20 backdrop-blur-xl rounded-2xl p-6 my-10 border border-white/10',
      columnClassName: 'gap-8 md:gap-12 text-red-500 [&>h2]:text-2xl [&>h2]:my-4 [&>h2]:text-blue-500',

      // shiki / renderer options
      options: {
        theme: 'github-dark',
        lineNumbers: true,
        highlightLines: false,
      },
    },
  }),
]
```

### This can be overridden on a per-collection and per use case basis:

Note: collection specific overrides depend on collectionSlug and scope injection to determine which template to apply. Please see the 'register the block renderer' section above for more details.

```ts
plugins: [
  payloadMarkdown({
    config: { /* global solo override (applys to both use cases) */ },
    // OR
    config: {
      fields: { /* global field override (applies to markdown fields) */ },
      blocks: { /* global block override (applies to markdown blocks) */ },
    },
    collections: {
        posts: {
            config: { /* collection solo override (applies to both use cases) */ },
            // OR
            config: {
              fields: { /* collection field override (applies to markdown fields) */ },
              blocks: { /* collection block override (applies to markdown blocks) */ },
            },
        },
    },
  }),
]
```

---

## Why not MDX?

MDX is powerful, but it also introduces more complexity, tighter React coupling, and more authoring surface area than many content-driven sites actually need.

This package is intentionally Markdown-first.

The goal is not to recreate MDX prematurely, but to push Markdown further through carefully designed extensions that preserve portability, readability, and simplicity.

If future use cases emerge that genuinely require capabilities beyond what can be expressed cleanly through extended Markdown, they can be evaluated then. Until that point, this package is opinionated about keeping Markdown as the source of truth.

---

## Roadmap

- Expanded layout and formatting directives
- Custom remark / rehype plugin pipeline
- Optional editor enhancements
- Continued refinement of Markdown-first authoring ergonomics
