---
title: Troubleshooting
navTitle: Troubleshooting
description: Diagnose common Payload Markdown setup, rendering, directive, styling, and migration issues.
order: 410
status: published
tags:
  - advanced
  - troubleshooting
---

# Troubleshooting

:::toc[On this page]{depth="3" theme="compact"}
:::

## The Field Does Not Appear

Check the collection entry:

```ts
payloadMarkdown({
  collections: {
    posts: true,
  },
})
```

If the collection already has a `blocks` field, `true` installs the Markdown block into that field instead of adding a standalone `content` field. Set `installField: true` when you want both.

```ts
payloadMarkdown({
  collections: {
    pages: {
      installField: true,
      installIntoBlocks: true,
    },
  },
})
```

## Collection Config Is Not Applied

Pass `collectionSlug` when rendering directly:

```tsx
<MarkdownRenderer collectionSlug="posts" markdown={post.content} />
```

Without `collectionSlug`, the renderer can only use global defaults and direct props.

## Markdown Blocks Render Empty

`MarkdownBlockComponent` expects block data as props:

```tsx
<MarkdownBlockComponent {...block} collectionSlug="pages" />
```

Do not pass the data as `block={block}` unless your wrapper component unwraps it before calling `MarkdownBlockComponent`.

## Styles Are Missing

Confirm Tailwind scans the package output and your source-defined theme classes:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

If custom directive theme classes are generated dynamically, Tailwind may not see them. Keep complete class strings in source config.

## Code Blocks Are Plain Text

Confirm the language is loaded in `code.langs`:

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from '@valkyrianlabs/payload-markdown'

payloadMarkdown({
  code: {
    langs: [...DEFAULT_CODE_LANGS, 'go'],
  },
})
```

Unknown language fences fall back safely, but they will not receive language-specific token colors.

## Line Numbers Do Not Show

Line numbers require enhanced code rendering:

```ts
payloadMarkdown({
  code: {
    enhanced: true,
    lineNumbers: true,
  },
})
```

When `enhanced` is `false`, line numbers are disabled even if `lineNumbers` is `true`.

## A Directive Warns But Still Renders

Directive diagnostics are non-fatal. Invalid values fall back safely. Examples:

- invalid `:::cards{columns="wide"}` falls back to `3`
- invalid `:::toc{depth="20"}` falls back to `3`
- unknown callout variants fall back to `note`
- invalid tabs defaults fall back to the first tab
- unknown themes fall back to the directive group's default theme

## Tabs Do Not Preserve URL State

Tabs are progressively enhanced in the rendered page, but they do not currently sync state to the URL hash or across pages.

## Raw HTML Does Not Render Exactly As Authored

The renderer parses raw HTML but sanitizes final output. Unsupported or unsafe HTML is removed, and authored inline `style` attributes are stripped.

Use Markdown and directives for content structure. Use source-defined directive themes for styling.

## Runtime Settings Are Not Initialized

Runtime helpers that read plugin settings require `payloadMarkdown(...)` to run first. Include the plugin in the Payload config before using helpers that rely on global plugin settings.

:::details[Error shape]
If settings are missing, `getPayloadMarkdownSettings()` throws an error that says settings have not been initialized and points back to adding `payloadMarkdown(...)` to the Payload plugins array.
:::
