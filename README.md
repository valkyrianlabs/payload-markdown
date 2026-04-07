![@valkyrianlabs/payload-markdown](https://docs-media.valkyrianlabs.com/Payload%20Markdown%20-%20Cleaner%20defaults%2C%20zero%20fight%20release%20social-size.jpg)

![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)
![downloads](https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown)
![license](https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown)

Layout-aware Markdown for Payload CMS.

Write structured, production-ready content in plain Markdown — with layout directives, Shiki-powered code blocks, and Tailwind-native styling baked in.

No bloated editors. No JSON-shaped content. Just Markdown that renders like a real system.

---

## Install from NPM

```bash
pnpm add @valkyrianlabs/payload-markdown
```

---

## [📖 Explore the Docs](https://docs.valkyrianlabs.com/plugins/payload-markdown)

---

## Why this exists

Most CMS setups force you into one of two bad paths:

- heavy rich text editors with fragile JSON output  
- bare Markdown fields with zero structure  

This plugin takes the better route:

- Markdown stays the source of truth  
- layout is handled at the content layer  
- rendering is production-ready out of the box  
- styling is centralized, but fully overridable  

**Write fast. Render clean. Stay in control.**

---

## What you get

- Drop-in Markdown support for Payload  
- Layout directives (`:::section`, `:::2col`, `:::3col`)  
- Shiki-powered syntax highlighting  
- Live preview-friendly rendering  
- Tailwind-native styling with deep override control  
- Config layering (global → collection → component)  
- Clean, portable Markdown storage (AI-friendly by default)  

---

## Example

![payload-markdown example](https://docs-media.valkyrianlabs.com/%40valkyrianlabspayload-markdown%20Editor%20Columns%20Example.png)

Write simple Markdown → get structured layouts instantly.

---

## Code blocks

![code blocks example](https://docs-media.valkyrianlabs.com/%40valkyrianlabspayload-markdown%20Code%20Blocks%20Example.png)

Powered by Shiki — the same high-fidelity engine used by VS Code.

---

## Quick setup

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

### Render content

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

<MarkdownRenderer
  markdown={content}
  collectionSlug="posts"
/>
```

---

## Philosophy

- Markdown should stay the source of truth  
- layout belongs in content, not hacked in the frontend  
- defaults should look good without locking you in  
- the renderer should respect its container  

If that aligns with how you build, this will feel right.
