# Editor Autocomplete and Diagnostics

The Payload field uses CodeMirror for Markdown editing.

## Directive Autocomplete

Typing or invoking completion around `:::` offers public directives from the directive registry:

- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- layout directives

Snippets insert useful directive skeletons and use CodeMirror placeholders/tabstops, so placeholder content such as `Content` can be overwritten immediately.

## Attribute Completion

Inside directive attribute braces, the editor suggests valid attributes where the registry knows them:

```md
:::card {theme=""}
```

Theme-aware attributes include:

- `theme`
- `cardTheme`
- `cellTheme`
- `stepTheme`

Known attribute values are suggested for supported attributes such as:

- callout `variant`
- toc `depth`
- steps `variant`
- steps `layout`
- steps `columns`
- steps `numbered`
- card and container theme names

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
- unknown theme, `cardTheme`, `cellTheme`, or `stepTheme`
- obvious unclosed directives

Diagnostics do not block rendering. The renderer falls back to safe defaults where possible.
