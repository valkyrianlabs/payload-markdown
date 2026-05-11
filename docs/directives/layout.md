---
title: Layout Directives
navTitle: Layout
description: Use sections, columns, and cells to structure Markdown without turning content into page-builder data.
order: 270
status: published
tags:
  - directives
  - layout
---

# Layout Directives

Layout directives are registry-backed Markdown containers for structured content. They preserve Markdown as the source of truth while giving the renderer enough structure to produce sections, columns, and cells.

:::toc {title="On this page" depth="3" theme="compact"}
:::

## Section

```md
:::section {theme="panel"}

## Interfaces Without Friction

Short intro text here.

:::
```

`:::section` supports:

- `theme`

Close a section with `:::` or `:::endsection`.

## Columns

```md
:::2col {theme="default" cellTheme="panel"}

### First column

Content.

### Second column

Content.

:::
```

```md
:::3col

### First column

Content.

### Second column

Content.

### Third column

Content.

:::
```

Column directives support:

- `theme`
- `cellTheme`

`:::2col` and `:::3col` create heading-aware cells. Explicit `:::cell` blocks are supported, but normal heading-based grouping does not require them.

## Heading-Based Cell Grouping

Grids are heading-aware relative to where they open.

If a grid opens under a heading of depth `N`, then:

- headings at depth `N + 1` start new cells
- deeper headings stay nested inside the current cell
- normal Markdown remains normal Markdown inside each cell

## Explicit Cells

```md
:::2col

:::cell {theme="panel"}
First cell content.
:::

:::cell
Second cell content.
:::

:::
```

`:::cell` supports:

- `theme`

## Closing Directives

- `:::` closes the current directive scope
- `:::endcol` explicitly closes the active grid
- `:::end` closes the current section and nested grids
- `:::endsection` closes the current section and nested grids

## Mixed Layout Example

````md
:::section {theme="panel"}

## Product Documentation

:::2col {cellTheme="panel"}

### Authoring

:::callout {variant="tip" title="Plain Markdown"}
Authors keep readable source.
:::

### Rendering

```tsx
<MarkdownRenderer markdown={content} />
```

:::

:::
````

## Related Directives

For content components built on the same registry, see:

- [Callout](/directives/callout)
- [Details](/directives/details)
- [Table Of Contents](/directives/table-of-contents)
- [Steps](/directives/steps)
- [Cards](/directives/cards)
- [Tabs](/directives/tabs)
