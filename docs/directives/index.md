---
title: Directives
navTitle: Directives
description: Use registry-backed Markdown directives for structured content while keeping source portable.
order: 200
status: published
tags:
  - directives
---

# Directives

Directives are Markdown primitives powered by the plugin directive registry. They keep content portable while giving the renderer enough structure for components such as callouts, details, tables of contents, steps, cards, buttons, tabs, sections, columns, and cells.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Public Directives

- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- `::button`
- `:::buttons`
- `:::tabs`
- `:::tab`
- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`

## Basic Syntax

````md
:::callout[Read this first]{variant="warning"}
Content stays Markdown.
:::
````

Use `[Label]` for visible directive titles, and put attributes in braces. Expanded multiline attributes are preferred when a directive has more than one or two attributes:

````md
:::card[Markdown Field]{
  href="/getting-started/fields-and-blocks"
  theme="cyan"
}
Portable Markdown content.
:::
````

The older `title=""` form remains valid for existing Markdown, but snippets and docs prefer `[Label]`.

Quoted values are supported. Boolean-style attributes are supported where a directive defines them, such as `open="true"` on details, `numbered` on card steps, or `disabled` on a tab.

## Rendering Guarantees

- Directives render server-side.
- Directives do not require client hydration except for progressive tab and copy-button behavior.
- Nested Markdown remains Markdown.
- Unknown or malformed attributes warn where possible and fall back safely.
- Stable selectors are emitted for testing and styling, such as `data-directive`, `data-theme`, and `vl-md-*` classes.

## Markdown-In-Markdown Examples

Use four backticks when documenting Markdown that itself contains fenced code blocks:

`````md
````md
:::steps{
  variant="cards"
  stepTheme="glass"
}

### Install

```bash
pnpm add @valkyrianlabs/payload-markdown
```

### Configure

:::callout[Keep config in source]{variant="tip"}
Authors select themes by name. They do not need to write Tailwind classes.
:::

:::
````
`````

The outer fence shows the literal Markdown. The inner fence remains part of the example content.

## Heading Anchors

Headings render with deterministic IDs:

````md
## Install

## Install
````

Conceptual output:

```html
<h2 id="install">Install</h2>
<h2 id="install-1">Install</h2>
```

The table of contents directive uses those same heading IDs.

## Directive Pages

:::cards{columns="3" cardTheme="muted"}

:::card[Callout]{href="/directives/callout"}
Notes, tips, warnings, danger messages, and success states.
:::

:::card[Details]{href="/directives/details"}
Native disclosure blocks for optional or advanced content.
:::

:::card[Table Of Contents]{href="/directives/table-of-contents"}
Generated page-local navigation from headings.
:::

:::card[Steps]{href="/directives/steps"}
Ordered flows, install procedures, and card-based tutorials.
:::

:::card[Cards]{href="/directives/cards"}
Card grids and standalone card content.
:::

:::card[Buttons]{href="/directives/buttons"}
Link buttons and grouped primary links with local SVG icons.
:::

:::card[Tabs]{href="/directives/tabs"}
Accessible tabbed content with server-rendered panels.
:::

:::card[Layout]{href="/directives/layout"}
Sections, two-column grids, three-column grids, and explicit cells.
:::

:::
