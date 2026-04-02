# @valkyrianlabs/payload-markdown

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

```bash
pnpm add @valkyrianlabs/payload-markdown
```

Beautiful, production-ready Markdown for Payload CMS.

**Built for modern workflows — including seamless human ↔ AI collaboration.**

Render Markdown with clean, modern styling out of the box — plus **layout-aware extensions** for building real content (columns, sections, structured blocks) without leaving Markdown.

---

## 📸 Example

![payload-markdown example](https://project-media.cooperhlarson.com/payload-markdown_posts_example.png)

Write simple Markdown → get structured layouts instantly.

**Install. Write. Preview. — in minutes, not hours.**

---

## 🧱 Layout-Aware Markdown

Write layout-aware content directly in Markdown — **no MDX, no custom components, no editor friction.**

**Qualifiers**:
- Opening Qualifier: `:::section`, `:::2col`, `:::3col`
- Closing Qualifier: `:::` (closes the most recent open block)
  - If columns are nested inside a section, a single `:::` may close both
  - Optional explicit closures: `:::end` | `:::endsection` | `:::endcol`

**Section**:

```markdown
:::section

# My content here

:::      
```

**Columns** *(use :::2col or :::3col depending on layout)*:

```markdown
:::2col

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

## 💻 Code Blocks & Syntax Highlighting

![code blocks example](https://project-media.cooperhlarson.com/payload-markdown_code_blocks_example.png)

Markdown code blocks are rendered with **high-fidelity syntax highlighting** powered by Shiki — the same engine used by VS Code.

This means your code looks exactly how developers expect it to look:
- accurate tokenization (keywords, strings, types, operators)
- consistent theming across languages
- zero guesswork or regex-based highlighting

Shiki is built on **TextMate grammars**, giving it extremely precise language support across a wide range of ecosystems.

---

### ⚡ Why this matters

Most Markdown renderers treat code blocks as an afterthought.

This doesn’t.

- **Readable at a glance** — colors reinforce structure and intent
- **Language-aware** — not just “colored text,” but real parsing
- **Consistent with dev tools** — matches what engineers see in their editor
- **Zero runtime overhead** — highlighting is generated ahead of time

Unlike browser-based highlighters that rely on client-side parsing, Shiki generates fully styled HTML during rendering, so you ship **no extra JavaScript** while still getting IDE-quality results.

---

### 🧠 Built for real-world content

- Supports a wide range of languages out of the box
- Line numbers and formatting handled automatically
- Clean copy-paste output (no artifacts, no formatting noise)
- Fully customizable via transformer pipeline

Whether you're writing:
- blog posts
- documentation
- tutorials
- API guides

…your code blocks look sharp, readable, and production-ready.

---

## 🧾 TL;DR

You’re not getting “pretty code.”

You’re getting **editor-grade syntax rendering in Markdown**, without the overhead of a full editor.

---

## ✨ Features

* 🎯 Drop-in Markdown renderer with polished defaults
* 🧱 Layout-aware Markdown (columns, sections, grid directives)
* 🧼 Clean, readable output using Tailwind-friendly prose styling
* ⚡ Lightweight editor integration (no heavy WYSIWYG overhead)
* 🔌 Extensible pipeline (remark / rehype support)
* 🧠 Built for real-world use in blogs, docs, and content-heavy apps

---

## 🤖 AI-Friendly by Design

Content is stored as plain Markdown — making it seamless to collaborate with AI.

- Copy/paste directly into ChatGPT, Claude, or any AI tool
- Refactor, expand, or rewrite content
- Paste back with zero formatting loss

No proprietary JSON formats.  
No schema translation.  
Just clean, portable content.

---

## 🎯 Use Cases

- Developer blogs
- Technical documentation
- Content-heavy apps
- AI-assisted writing workflows

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

No boilerplate required — fields are automatically added to configured collections.

---

### 2. Add the Markdown field manually (optional)

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

### Register block renderer

```ts
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

const blockComponents = {
  markdownBlock: MarkdownBlockComponent,
}
```

---

## 🎨 Styling

This package ships with Tailwind-friendly defaults.

```bash
npm install @tailwindcss/typography
```

```css
@import "tailwindcss";

@plugin "@tailwindcss/typography";
@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

No Tailwind? No problem — output still renders as clean HTML.

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

## 🤔 Why not MDX?

MDX is powerful, but often introduces complexity, build overhead, and tighter coupling to React.

This plugin keeps Markdown as the source of truth while still enabling structured layouts — striking a balance between
simplicity and power.

---

## 🧠 Philosophy

Markdown is the editor.

Instead of layering heavy UI abstractions, this package embraces Markdown as the source of truth while providing a clean
editing and rendering experience.

---

## 🔮 Roadmap

* MDX support
* Custom remark / rehype plugin pipeline
* Advanced formatting extensions
* Optional editor enhancements (shortcuts, structure helpers)

---

## 🧪 Development

```bash
npm install
npm run dev
```
