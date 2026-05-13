---
title: Editor Autocomplete And Diagnostics
navTitle: Editor
description: Understand CodeMirror directive autocomplete, snippets, attribute completion, and non-fatal diagnostics.
order: 310
status: published
tags:
  - authoring
  - editor
---

# Editor Autocomplete And Diagnostics

The Payload field uses CodeMirror for Markdown editing.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Directive Autocomplete

Typing or invoking completion around `:::` offers public directives from the directive registry:

- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`
- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- `:::buttons`
- `:::tabs`
- `:::tab`

Typing or invoking completion around `::button` offers the leaf button directive and its attributes.

Button completion may also show shortcut labels such as `::button_icon` and `::button_full`. These are autocomplete variants only. Selecting them inserts canonical `::button[...]` Markdown; `::button_icon` and `::button_full` are not valid directive names in source.

Common button completions:

- `::button` inserts a compact button with `href` and `variant`
- `::button_icon` inserts canonical `::button` with an `icon` attribute included
- `::button_full` inserts canonical `::button` with the common button attributes filled in

Snippets insert directive skeletons and use CodeMirror placeholders/tabstops, so placeholder content such as `Content` can be overwritten immediately.

## Snippet Examples

Steps snippets include normal and card-based layouts:

```md
:::steps

### Step title

Content

:::
```

```md
:::steps{
  variant="cards"
  layout="grid"
  columns="2"
  numbered
}

### First step

Content

### Second step

Content

:::
```

Tabs snippets include child `tab` panels and code fences:

````md
:::tabs{
  default="pnpm"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add package-name
```
:::

:::tab[npm]{value="npm"}
```bash
npm install package-name
```
:::

:::
````

Button snippets use the leaf directive form:

```md
::button[Label]{
  href="/docs"
  variant="primary"
}
```

Expanded multiline attributes are preferred for readability:

```md
:::card[Fast Setup]{
  icon="@fa-duotone/bolt"
  theme="glass"
}
Install, configure, ship.
:::
```

For visible directive headings, `[Label]` is preferred over `title=""`. Existing `title=""` content remains compatible.

If both `[Label]` and `title` are present, the renderer uses `[Label]`. Matching values do not warn; differing values produce a non-fatal diagnostic so authors can remove the ambiguity.

## Syntax Highlighting

Directive highlighting distinguishes supported pieces where the active theme can style them:

- leaf directives such as `::button`
- container directives such as `:::card`
- directive labels such as `[Fast Setup]`
- argument names such as `href=`
- argument values such as `"/docs"` or `true`
- nested directive boundaries and closing markers

The editor now handles directive highlighting more robustly across nested blocks and after partially edited or non-clean previous lines.

## Closing Labels

Nested directives can be hard to scan when several `:::` closers appear in a row. The editor adds lightweight visual labels beside plain closers, such as `endcard` or `endbuttons`, without changing the stored Markdown.

```md
:::cards{
  columns="2"
}

:::card[First Card]
Content.
:::

:::card[Second Card]
Content.
:::

:::
```

The source remains plain Markdown. In the editor, the three closing markers are decorated so authors can see which `card` or `cards` block each closer ends. Explicit layout closers such as `:::endcol` and `:::endsection` are also highlighted as closing labels.

## Attribute Completion

Inside directive attribute braces, the editor suggests valid attributes where the registry knows them:

```md
:::card[Fast Setup]{
  theme=""
}
```

Theme-aware attributes include:

- `theme`
- `cardTheme`
- `cellTheme`
- `stepTheme`
- `tabTheme`

Known attribute values are suggested for supported attributes such as:

- callout `variant`
- toc `depth`
- steps `variant`
- steps `layout`
- steps `columns`
- steps `numbered`
- card and container theme names
- tabs and tab panel theme names

## Theme Completion Limits

Theme value completions are registry-backed. Built-in theme names are available in the editor.

Custom theme names can still be typed manually. Editor-side completion and linting may not know collection-scoped custom themes in every context, so treat editor suggestions as assistance rather than the source of truth. Render-time theme resolution uses the resolved plugin and collection config and falls back safely when unknown values are used.

## Diagnostics

The editor provides lightweight, non-fatal directive diagnostics for issues such as:

- unknown directive names
- malformed directive attributes
- unknown attributes
- unsupported callout variants
- invalid TOC depth
- invalid steps variant, layout, columns, or numbered value
- invalid cards columns
- invalid tabs defaults or duplicate tab values
- unknown theme, `cardTheme`, `cellTheme`, `stepTheme`, or `tabTheme`
- obvious unclosed directives

Diagnostics do not block rendering. The renderer falls back to safe defaults where possible.

:::details[Attribute parser notes]
The parser understands quoted values and shorthand markers such as `.class`, `#id`, and boolean attributes. Directive definitions still control which attributes are valid for each directive; unknown attributes can warn even if the attribute parser can read them.
:::
