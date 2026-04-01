# @valkyrianlabs/payload-markdown

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

Beautiful, production-ready Markdown for Payload CMS.

Render Markdown with clean, modern styling out of the box, plus a lightweight editor experience built around Markdown itself.

---

## ✨ Features

* 🎯 Drop-in Markdown renderer with polished defaults
* 🧼 Clean, readable output using Tailwind-friendly prose styling
* ⚡ Lightweight editor integration (no heavy WYSIWYG overhead)
* 🔌 Extensible pipeline (remark / rehype support)
* 🧠 Built for real-world use in blogs, docs, and content-heavy apps

---

## 📦 Installation

```bash
npm install @valkyrianlabs/payload-markdown
```

---

## 🚀 Usage

### 1. Register the plugin in `payload.config.ts`

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

This enables Markdown support globally and injects fields into configured collections.

---

### 2. Add the Markdown field to your collection (optional override)

If you want manual control instead of automatic injection:

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

### 3. Render Markdown in your frontend

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/client'

<MarkdownRenderer
markdown={post.content}
options={{ theme: 'github-dark' }}
/>
```

---

### 4. Use with Payload Blocks (Layout Builder)

If you're using block-based layouts (recommended for pages, landing content, etc), you can use the built-in `MarkdownBlock`.

#### Add the block to your collection

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

---

#### Register the block renderer

In your `RenderBlocks.tsx` (or equivalent):

```ts
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  markdownBlock: MarkdownBlockComponent,
}
```

Now any Markdown block added in the admin panel will render automatically in your layout pipeline.

---

## 🎨 Styling

This package ships with Tailwind-friendly defaults.

If you're using Tailwind (recommended), install typography:

```bash
npm install @tailwindcss/typography
```

Then add (or adjust) the following to your `app/globals.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

No Tailwind? No problem — output will still render as plain HTML.

---

## ⚙️ Renderer Options

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

## 💡 Layout Extensions

![@valkyrianlabs/payload-markdown column qualifier example](https://project-media.cooperhlarson.com/payload-markdown_column_example-1400x1263.png)

Write structured layouts directly in Markdown using lightweight directives:

**Section**:
```markdown
:::section   # optional section qualifier for grouping content
:::          # closing qualifier (or `:::endsection` or `:::end`)
```

**Columns**:
```markdown
:::2col   # or :::3col

# Column 1 content
a description of the first column

# Column 2 content
a description of the second column

:::
```

**Full Example**:
```markdown
:::section

# My Blog Post
This is a blog post with a two-column layout.

:::2col

## Column 1
Some content for the first column.

## Column 2
Some content for the second column.

:::      # closes both the columns and the section
```

---

## 🧠 Philosophy

Markdown is the editor.

Instead of heavy UI layers, this package embraces Markdown as the source of truth while providing a clean editing and rendering experience.

---

## 🔮 Roadmap

Planned improvements:

* MDX support
* Custom remark / rehype plugin pipeline
* Advanced formatting extensions
* Optional editor enhancements (shortcuts, structure helpers)

---

## 🧪 Development

```
npm install
npm run dev
```
