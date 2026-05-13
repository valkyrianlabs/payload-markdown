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
:::callout[Read this first]{
  variant="warning"
  theme="soft"
}
Content stays Markdown.
:::
```

## Attributes

- `variant`: `note`, `info`, `tip`, `warning`, `danger`, or `success`
- `theme`: callout theme name
- `[Label]`: optional title displayed above the body, preferred for new Markdown
- `title`: optional title retained for existing Markdown
- `icon`: local icon reference such as `@fa-duotone/triangle-exclamation`

Defaults:

- `variant="note"`
- `theme="soft"`

Unknown variants fall back to `note` and produce a non-fatal diagnostic where diagnostics are available.

Existing `title=""` content remains valid. If `[Label]` and `title` are both present, `[Label]` is used. Differing values produce a non-fatal diagnostic.

## Markdown Content

Callouts support nested Markdown:

````md
:::callout[Use the server renderer]{variant="tip"}
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
:::callout[Blueprint]{
  variant="info"
  theme="blueprint"
}
This callout uses a source-defined theme.
:::
```
