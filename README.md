# @valkyrianlabs/payload-markdown

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

```bash
pnpm add @valkyrianlabs/payload-markdown
```

Markdown for Payload CMS — with clean rendering, Shiki-powered code blocks, and layout-aware directives for real content.

It keeps Markdown as the source of truth while covering the gap between plain text and the kind of structure people usually overcomplicate with MDX, custom components, or bloated editors.

Built for blogs, docs, content-heavy apps, and AI-assisted workflows.

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

### Register the plugin in `payload.config.ts`

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

Fields are automatically added to configured collections.

---

### Add the Markdown field manually

```ts
import { markdownField } from '@valkyrianlabs/payload-markdown'

export const Posts = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    markdownField({
      name: 'content',
      label: 'Content',
    }),
  ],
}
```

---

### Render Markdown in your frontend

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/client'

<MarkdownRenderer
  markdown={post.content}
  options={{ theme: 'github-dark' }}
/>
```

---

### Use with Payload Blocks

```ts
import { MarkdownBlock } from '@valkyrianlabs/payload-markdown'

export const Pages = {
  slug: 'pages',
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      admin: {
        initCollapsed: true,
      },
      blocks: [MarkdownBlock],
      required: true,
    },
  ],
}
```

### Register the block renderer

```ts
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  markdownBlock: MarkdownBlockComponent,
}
```

---

## Styling

This package ships with Tailwind-friendly defaults.

```bash
npm install @tailwindcss/typography
```

```css
@import "tailwindcss";

@plugin "@tailwindcss/typography";
@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

No Tailwind? No problem. The output still renders as clean HTML.

---

## Renderer Options

```tsx
<MarkdownRenderer
  markdown={content}
  variant="blog"        // blog | docs | compact | unstyled
  size="lg"             // sm | md | lg
  centered
  enableGutter
  fullBleedCode
/>
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
