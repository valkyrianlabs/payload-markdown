# Layout

Sections (`:::section`), grids (`:::2col`, `:::3col`), and cells (`:::cell`) in every built-in theme. Grids group cells by heading: a grid opened under a heading of depth N starts a new cell at every heading of depth N + 1. On this page each example is labelled with an h2, so `###` headings start cells.

## Section: theme="default"

:::section

## Default Section

The default section theme is a soft panel. Its direct `h1` and `h2` children are styled large (text-4xl), so this heading should look like a hero title.

A second paragraph inside the default section.

:::

## Section: theme="muted"

:::section{theme="muted"}

## Muted Section

The muted section theme has a quieter panel and no special heading sizing.

:::

## Section: theme="panel"

:::section{theme="panel"}

## Panel Section

The panel section theme uses the solid panel surface.

:::

## Section: h1 inside a default section

:::section

# A Level 1 Heading In A Section

The default theme styles a direct `h1` the same way as a direct `h2`.

:::

## Section: h3 and h4 inside a section

:::section{theme="panel"}

### A Level 3 Heading In A Section

Deeper headings keep their normal prose sizes inside sections.

#### A Level 4 Heading In A Section

Body text under a level 4 heading.

:::

## Section: closed with :::endsection

:::section{theme="muted"}

## Closed With endsection

`:::endsection` closes the section and any grid still open inside it.

:::endsection

## Section: closed with :::end

:::section{theme="muted"}

## Closed With end

`:::end` is an alias of `:::endsection`.

:::end

## 2col: theme="default"

:::2col

### First Column

The default columns theme is a bare grid with no surface.

### Second Column

Each `###` heading starts a new cell.

:::

## 2col: theme="panel"

:::2col{theme="panel"}

### First Column

The panel columns theme wraps the whole grid in a muted panel.

### Second Column

Cells inside stay unthemed.

:::

## 2col: cellTheme="panel"

:::2col{cellTheme="panel"}

### First Column

`cellTheme="panel"` gives every generated cell a muted panel.

### Second Column

The grid itself has no surface.

:::

## 2col: theme="panel" and cellTheme="panel"

:::2col{
  theme="panel"
  cellTheme="panel"
}

### First Column

Panel cells inside a panel grid: check that the nested surfaces are still distinguishable.

### Second Column

Second panel cell.

:::

## 3col: theme="default"

:::3col

### First

One.

### Second

Two.

### Third

Three.

:::

## 3col: theme="panel"

:::3col{theme="panel"}

### First

One.

### Second

Two.

### Third

Three.

:::

## 3col: cellTheme="panel"

:::3col{cellTheme="panel"}

### First

One.

### Second

Two.

### Third

Three.

:::

## 3col: theme="panel" and cellTheme="panel"

:::3col{
  theme="panel"
  cellTheme="panel"
}

### First

One.

### Second

Two.

### Third

Three.

:::

## 2col: unequal content lengths

:::2col{cellTheme="panel"}

### Short Cell

One line.

### Long Cell

A much longer cell that runs on for several sentences so the two cells differ in height. Check whether the shorter panel stretches to match its neighbour or shrinks to its content, and whether either looks intentional.

A second paragraph in the long cell.

:::

## 2col: deeper headings stay inside a cell

:::2col{cellTheme="panel"}

### Authoring

Authors write plain Markdown.

#### A Level 4 Subheading

Level 4 headings stay inside the current cell instead of starting a new one.

### Rendering

The renderer adds structure.

#### Another Subheading

Still inside the second cell.

:::

## 2col: code, lists, and callouts in cells

:::2col{cellTheme="panel"}

### Field Content

Use direct Markdown fields for articles, posts, and docs.

- Posts
- Docs pages
- Release notes

```tsx
<MarkdownRenderer collectionSlug="posts" markdown={post.content} />
```

### Block Content

Use the Markdown block inside layout builders.

:::callout[Plain Markdown]{variant="tip"}
Authors keep readable source.
:::

```ts
const block = { blockType: 'vlMdBlock' }
```

:::

## 2col: closed with :::endcol

:::2col

### Left

`:::endcol` explicitly closes the active grid.

### Right

The paragraph after the grid is back at the top level.

:::endcol

This paragraph follows a grid closed with `:::endcol`.

## Cells: explicit cells with mixed themes

:::2col

:::cell{theme="panel"}
### Panel Cell

An explicit `:::cell` with `theme="panel"`.
:::

:::cell
### Default Cell

An explicit `:::cell` with the default theme.
:::

:::

## Cells: explicit cells in a 3col panel grid

:::3col{theme="panel"}

:::cell{theme="panel"}
First explicit panel cell, without a heading.
:::

:::cell
Second explicit cell, default theme.
:::

:::cell{theme="panel"}
Third explicit panel cell.
:::

:::

## Cells: explicit cells override cellTheme

:::3col{cellTheme="panel"}

:::cell
Inherits `cellTheme="panel"` from the grid.
:::

:::cell{theme="default"}
Overrides the grid with `theme="default"`.
:::

:::cell
Inherits again.
:::

:::

## Cell: standalone cell outside a grid

:::cell{theme="panel"}
### Standalone Cell

A `:::cell` outside a grid still renders with its theme.
:::

## Grid: opened under an h3, so h4 headings start cells

### Grid Under A Level 3 Heading

:::2col{cellTheme="panel"}

#### Cell From An h4

Because the grid opened under an `###` heading, `####` headings start the cells.

#### Second Cell From An h4

The cell theme styles a direct `h4` at text-lg.

:::

## Section: with a grid inside

:::section{theme="panel"}

## Product Documentation

An intro paragraph inside the section, above the grid.

:::2col{cellTheme="panel"}

### Authoring

:::callout[Plain Markdown]{variant="tip"}
Authors keep readable source.
:::

### Rendering

```tsx
<MarkdownRenderer markdown={content} />
```

:::endcol

A tail paragraph inside the section, after the grid.

:::endsection

## Section: with a 3col grid and h2 + paragraph

:::section

## Three Reasons To Use It

Short supporting copy under the section title.

:::3col

### Portable

Content stays Markdown.

### Structured

Directives add layout without JSON.

### Fast

Rendered on the server.

:::

:::

## Section: with nested cards (landing page)

:::section{theme="panel"}

## Build Docs Without Losing Markdown

Directives give the renderer enough structure for landing-page sections while authors keep writing plain Markdown.

:::cards{
  columns="3"
  theme="spacious"
  cardTheme="glass"
}

:::card[Markdown Field]{
  eyebrow="Core"
  icon="@fa-duotone/laptop"
  href="/posts"
}
Portable Markdown content with live preview.
:::

:::card[Directive Autocomplete]{
  eyebrow="Authoring"
  icon="@fa-duotone/server"
  theme="cyan"
}
Snippets, placeholders, and lightweight diagnostics.
:::

:::card[Server Rendered]{
  eyebrow="Rendering"
  icon="@fa-duotone/laptop"
}
Shiki code blocks, heading anchors, TOCs, and themed directives.
:::

:::

:::

## Section: default theme with cards and buttons (hero)

:::section

## Ship Docs Faster

A hero-style section: a large h2, a paragraph, a button row, then a card grid.

:::buttons{gap="md"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Read the Docs]{
  href="/posts"
  variant="secondary"
}
:::

:::cards{
  columns="2"
  cardTheme="muted"
}

:::card[Install]{icon="@fa-duotone/server"}
One package, one plugin call.
:::

:::card[Render]{icon="@fa-duotone/laptop"}
One server component.
:::

:::

:::

## Sections: stacked back to back

:::section{theme="muted"}

## First Stacked Section

Check the vertical gap between adjacent sections.

:::

:::section{theme="panel"}

## Second Stacked Section

The sections have large outer margins (my-12).

:::

A closing paragraph after the last section.
