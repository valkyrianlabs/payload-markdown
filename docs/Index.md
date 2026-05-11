---
title: Payload Markdown
navTitle: Overview
description: Structured Markdown editing and rendering for Payload CMS with CodeMirror, Shiki, directives, themes, and server-first output.
order: 0
status: published
tags:
  - overview
---

# Payload Markdown

`@valkyrianlabs/payload-markdown` adds portable Markdown authoring to Payload CMS. It provides a CodeMirror-backed admin field, an optional reusable Payload block, server-rendered Markdown output, Shiki code highlighting, heading anchors, GFM support, and registry-backed content directives.

The stored value remains Markdown. Configuration, presentation, directive themes, and code rendering stay in source-controlled Payload config instead of being baked into CMS-authored content.

:::callout {variant="tip" title="Start here"}
Install the plugin, enable it for a collection, then render the stored field or block content with the server export.
:::

:::cards {columns="3" cardTheme="glass"}

:::card {eyebrow="Start" title="Install and Configure" href="/getting-started/installation"}
Register `payloadMarkdown()` in Payload and choose whether collections receive a field, a block, or both.
:::

:::card {eyebrow="Render" title="Fields and Blocks" href="/getting-started/fields-and-blocks"}
Use the server renderer for Markdown fields and the block component for `vlMdBlock` layout entries.
:::

:::card {eyebrow="Shape" title="Directives" href="/directives"}
Use plain `:::` directives for callouts, details, TOCs, steps, cards, tabs, sections, columns, and cells.
:::

:::

## Quick Install

```bash
pnpm add @valkyrianlabs/payload-markdown
```

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

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: string | null }) {
  return <MarkdownRenderer collectionSlug="posts" markdown={content} />
}
```

## What It Covers

- Plain Markdown storage for portable content.
- Automatic Markdown field installation for field-first collections.
- Automatic `vlMdBlock` installation for collections with `blocks` fields.
- Manual `markdownField()` and `MarkdownBlock` exports for explicit schemas.
- Server-rendered Markdown with Shiki, GFM, heading anchors, and sanitized HTML.
- Directive rendering for content patterns that should stay readable in Git.
- CodeMirror autocomplete, snippets, placeholders, and non-fatal diagnostics.
- Top-level and collection-scoped `code`, `themes`, and `config` namespaces.
- Stable hook classes and `data-*` attributes for styling and tests.

## Documentation Map

:::cards {columns="2" cardTheme="muted"}

:::card {title="Getting Started" href="/getting-started"}
Installation, collection setup, field and block behavior, and basic rendering.
:::

:::card {title="Configuration" href="/configuration"}
Plugin options, scoping rules, Shiki code behavior, styling, and directive theme registries.
:::

:::card {title="Directives" href="/directives"}
Supported directive syntax, attributes, defaults, diagnostics, and rendering behavior.
:::

:::card {title="Authoring" href="/authoring"}
Editor behavior, Markdown-in-Markdown examples, and copyable content patterns.
:::

:::card {title="Advanced" href="/advanced"}
Troubleshooting, migration notes, and edge cases.
:::

:::card {title="API Reference" href="/reference/api"}
Exports, option shapes, renderer props, directive names, and default theme exports.
:::

:::
