# @valkyrianlabs/payload-markdown

Beautiful, production-ready Markdown for Payload CMS.

Render Markdown with clean, modern styling out of the box, plus a lightweight editor experience built around Markdown itself.

---

## ✨ Features

- 🎯 Drop-in Markdown renderer with polished defaults
- 🧼 Clean, readable output using Tailwind-friendly prose styling
- ⚡ Lightweight editor integration (no heavy WYSIWYG overhead)
- 🔌 Extensible pipeline (remark / rehype support)
- 🧠 Built for real-world use in blogs, docs, and content-heavy apps

---

## 📦 Installation

```bash
npm install @valkyrianlabs/payload-markdown
```

---

## 🚀 Usage

### 1. Add the Markdown field to your collection

```typescript jsx
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

### 2. Render Markdown in your frontend

```typescript jsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/client'

<MarkdownRenderer
markdown={post.content}
options={{ theme: 'github-dark' }}
/>
```

---

## 🎨 Styling

This package ships with Tailwind-friendly defaults.

If you're using Tailwind (recommended), install typography:

```bash
npm install @tailwindcss/typography
```

Then add:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

No Tailwind? No problem — output will still render as plain HTML.

---

## ⚙️ Renderer Options

```typescript jsx
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

## 🧠 Philosophy

Markdown is the editor.

Instead of heavy UI layers, this package embraces Markdown as the source of truth while providing a clean editing and rendering experience.

---

## 🔮 Roadmap

Planned improvements:

- MDX support
- Custom remark / rehype plugin pipeline
- Advanced formatting extensions
- Optional editor enhancements (shortcuts, structure helpers)

---

## 🧪 Development

npm install
npm run dev
