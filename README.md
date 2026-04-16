![@valkyrianlabs/payload-markdown](https://docs-media.valkyrianlabs.com/Payload%20Markdown%20-%20Cleaner%20defaults%2C%20zero%20fight%20release%20social-size.jpg)

<a href="https://github.com/valkyrianlabs/payload-markdown/actions"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/valkyrianlabs/payload-markdown/deploy.yml"></a>
&nbsp;
<a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown" /></a>
&nbsp;
<a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown" /></a>
&nbsp;
<a href="https://github.com/valkyrianlabs/payload-markdown?tab=MIT-1-ov-file"><img alt="license" src="https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown" /></a>

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

## Real examples (v1)

### Layout directives in practice

![blocks demo](https://docs-media.valkyrianlabs.com/payload-markdown%20v1.0.0%20blocks%20demo.png)

Real v1 output using `:::section`, `:::2col`, and `:::3col`.

- structure defined directly in Markdown  
- no builder UI, no hidden schema  
- predictable layout from plain text  

---

### Code blocks in practice

![code blocks demo](https://docs-media.valkyrianlabs.com/payload-markdown%20v1%20code%20blocks%20demo.png)

Production-ready code rendering with zero configuration.

- Shiki (VS Code engine)  
- consistent themes  
- clean, readable defaults  

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

## Tailwind setup (recommended)

For best rendering defaults, enable Tailwind Typography and scan the plugin output:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Ensure Tailwind scans plugin output */
@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

---

## Philosophy

- Markdown should stay the source of truth  
- layout belongs in content, not hacked in the frontend  
- defaults should look good without locking you in  
- the renderer should respect its container  

If that aligns with how you build, this will feel right.
