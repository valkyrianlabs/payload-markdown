---
title: Code Blocks
navTitle: Code Blocks
description: Configure Shiki-powered fenced code rendering, languages, themes, line numbers, and full-bleed code.
order: 130
status: published
tags:
  - configuration
  - code
  - shiki
---

# Code Blocks

Fenced code blocks are rendered with Shiki during the Markdown compile pipeline. The browser receives finished HTML and does not need a client-side syntax highlighter.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Preferred Code Config

Use the top-level `code` namespace:

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from '@valkyrianlabs/payload-markdown'

payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: false,
    langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
})
```

Use collection-level `code` when one collection needs different behavior:

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
  },
  collections: {
    posts: {
      code: {
        langs: [...DEFAULT_CODE_LANGS, 'latex'],
        lineNumbers: false,
      },
    },
  },
})
```

## Options

- `enhanced`: applies the plugin's normalized code block renderer, defaulting to `true`
- `fullBleed`: lets fenced code blocks extend beyond the normal content width on larger screens
- `langs`: replaces or extends the Shiki language list
- `lineNumbers`: controls visible line numbers when enhanced rendering is enabled
- `shikiTheme`: selects the Shiki theme, defaulting to `github-dark`

`shikiTheme` is intentionally separate from directive `themes`.

## Default Languages

`DEFAULT_CODE_LANGS` includes:

```text
cpp, java, js, ts, jsx, tsx, json, python, rust, html, css, yaml, sql
```

Extend it when authors need additional Shiki languages:

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from '@valkyrianlabs/payload-markdown'

payloadMarkdown({
  code: {
    langs: [...DEFAULT_CODE_LANGS, 'go', 'php', 'vue'],
  },
})
```

If a fence uses an unknown language, the renderer falls back to plain text highlighting instead of failing the page.

## Language Fences

Use standard fenced code blocks with a language identifier:

````md
```ts
export function sum(a: number, b: number) {
  return a + b
}
```
````

The language hint is passed to Shiki during Markdown compilation.

## Enhanced Rendering

Enhanced rendering provides:

- Shiki tokenization
- normalized spacing and layout
- optional line numbers
- empty-line normalization
- copy button behavior from the renderer client helper
- server-rendered HTML output

Disable it when you want output closer to raw Shiki:

```ts
payloadMarkdown({
  code: {
    enhanced: false,
  },
})
```

When `enhanced` is `false`, line numbers are disabled even if `lineNumbers` is `true`.

## Full-Bleed Code

Use `fullBleed` when long code examples should visually break out from normal prose width:

```ts
payloadMarkdown({
  code: {
    fullBleed: true,
  },
})
```

Renderer-level overrides use the same namespace:

```tsx
<MarkdownRenderer
  code={{ fullBleed: true }}
  markdown={content}
/>
```

## Legacy Aliases

The old `config.options` shape still works:

```ts
payloadMarkdown({
  config: {
    fullBleedCode: true,
    options: {
      enhancedCodeBlocks: true,
      langs: [...DEFAULT_CODE_LANGS],
      lineNumbers: true,
      theme: 'github-dark',
    },
  },
})
```

Prefer:

```ts
payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: true,
    langs: [...DEFAULT_CODE_LANGS],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
})
```
