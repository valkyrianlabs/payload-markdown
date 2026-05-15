---
title: Installation
navTitle: Install
description: Install the package, register the plugin, and render Markdown content.
order: 20
status: published
tags:
  - getting-started
  - installation
---

# Installation

Install the package, enable it for your Payload collections, and render Markdown with the server component.

:::toc[On this page]{depth="3" theme="compact"}
:::

:::callout[Before you start]{variant="info"}
This guide assumes a Payload 3 project with a working Next.js app.
:::

:::steps{
  variant="cards"
  layout="stack"
  numbered
  stepTheme="cyan"
}

### Install The Package

```bash
pnpm add @valkyrianlabs/payload-markdown
```

### Register The Plugin

Add `payloadMarkdown()` to the Payload config and enable the collections that should receive Markdown fields or blocks.

### Render Content

Use `MarkdownRenderer` for standalone fields and `MarkdownBlockComponent` for `vlMdBlock` entries.

:::

## Configuration Map

:::cards{
  columns="3"
  cardTheme="muted"
}

:::card[Fields And Blocks]{href="/getting-started/fields-and-blocks"}
Automatic install behavior and manual schema control.
:::

:::card[Rendering]{href="/getting-started/rendering"}
Server-first Markdown output, scoped config, and fallback behavior.
:::

:::card[Code Blocks]{href="/configuration/code-blocks"}
Shiki languages, themes, line numbers, and full-bleed code.
:::

:::

## Package Manager Alternatives

:::tabs{
  default="pnpm"
  theme="glass"
  tabTheme="muted"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::

:::details[When to configure icons]
Configure local SVG icon packs only when authored content uses `icon="@pack/name"` on buttons, cards, or callouts.
:::
