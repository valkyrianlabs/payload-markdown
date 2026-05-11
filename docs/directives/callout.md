---
title: Callout
navTitle: Callout
description: Use callouts for emphasized notes, warnings, tips, and status messages.
order: 210
status: published
tags:
  - directives
  - callout
---

# Callout

Use `:::callout` for emphasized notes, warnings, tips, and status messages.

```md
:::callout {variant="warning" theme="soft" title="Read this first"}
Content stays Markdown.
:::
```

## Attributes

- `variant`: `note`, `info`, `tip`, `warning`, `danger`, or `success`
- `theme`: callout theme name
- `title`: optional title displayed above the body

Defaults:

- `variant="note"`
- `theme="soft"`

Unknown variants fall back to `note` and produce a non-fatal diagnostic where diagnostics are available.

## Markdown Content

Callouts support nested Markdown:

````md
:::callout {variant="tip" title="Use the server renderer"}
Render fields with:

```tsx
<MarkdownRenderer markdown={post.content} />
```
:::
````

## Variants

Use variants semantically:

- `note`: neutral supporting context
- `info`: explanatory context
- `tip`: recommended usage or helpful shortcut
- `warning`: important caveat
- `danger`: destructive or breaking behavior
- `success`: confirmation or completed state

## Themes

Built-in callout themes:

- `soft`
- `solid`
- `glass`

Register custom callout themes in config:

```ts
payloadMarkdown({
  themes: {
    callout: {
      items: [
        {
          name: 'blueprint',
          classes: 'rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-4 py-3',
        },
      ],
    },
  },
})
```

Then select it in Markdown:

```md
:::callout {variant="info" theme="blueprint" title="Blueprint"}
This callout uses a source-defined theme.
:::
```
