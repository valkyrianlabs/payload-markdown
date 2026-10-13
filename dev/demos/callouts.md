# Callouts

Every callout variant (`note`, `info`, `tip`, `warning`, `danger`, `success`) in every built-in theme (`soft`, `solid`, `glass`), with and without titles and icons, and with rich nested content. The default theme is `soft` and the default variant is `note`.

## Defaults

### Callout: no attributes at all

:::callout
A callout with no label and no attributes renders as a `note` in the `soft` theme.
:::

### Callout: label only

:::callout[Just a label]
A callout with a label and no attributes.
:::

### Callout: legacy title attribute

:::callout{
  variant="info"
  title="Title from the title attribute"
}
The older `title=""` form still renders a title.
:::

### Callout: one-line body

:::callout{variant="tip"}
One line.
:::

## Variants: Title Only

### Callout: note with title

:::callout[Note]{variant="note"}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info with title

:::callout[Information]{variant="info"}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip with title

:::callout[Tip]{variant="tip"}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning with title

:::callout[Warning]{variant="warning"}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger with title

:::callout[Danger]{variant="danger"}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success with title

:::callout[Success]{variant="success"}
Confirmation: the migration finished and every document was re-rendered.
:::

## Variants: No Title

### Callout: note without title

:::callout{variant="note"}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info without title

:::callout{variant="info"}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip without title

:::callout{variant="tip"}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning without title

:::callout{variant="warning"}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger without title

:::callout{variant="danger"}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success without title

:::callout{variant="success"}
Confirmation: the migration finished and every document was re-rendered.
:::

## Variants: Icon And Title

Only two icons exist in the dev icon pack: `@fa-duotone/server` and `@fa-duotone/laptop`.

### Callout: note with icon and title

:::callout[Note]{
  variant="note"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info with icon and title

:::callout[Information]{
  variant="info"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip with icon and title

:::callout[Tip]{
  variant="tip"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning with icon and title

:::callout[Warning]{
  variant="warning"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger with icon and title

:::callout[Danger]{
  variant="danger"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success with icon and title

:::callout[Success]{
  variant="success"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.
:::

## Variants: Icon Without Title

### Callout: note with icon, no title

:::callout{
  variant="note"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info with icon, no title

:::callout{
  variant="info"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip with icon, no title

:::callout{
  variant="tip"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning with icon, no title

:::callout{
  variant="warning"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger with icon, no title

:::callout{
  variant="danger"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success with icon, no title

:::callout{
  variant="success"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.
:::

## Theme: soft

### Callout: note, soft theme

:::callout[Note (soft)]{
  variant="note"
  theme="soft"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info, soft theme

:::callout[Information (soft)]{
  variant="info"
  theme="soft"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip, soft theme

:::callout[Tip (soft)]{
  variant="tip"
  theme="soft"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning, soft theme

:::callout[Warning (soft)]{
  variant="warning"
  theme="soft"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger, soft theme

:::callout[Danger (soft)]{
  variant="danger"
  theme="soft"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success, soft theme

:::callout[Success (soft)]{
  variant="success"
  theme="soft"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.
:::

## Theme: solid

### Callout: note, solid theme

:::callout[Note (solid)]{
  variant="note"
  theme="solid"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info, solid theme

:::callout[Information (solid)]{
  variant="info"
  theme="solid"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip, solid theme

:::callout[Tip (solid)]{
  variant="tip"
  theme="solid"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning, solid theme

:::callout[Warning (solid)]{
  variant="warning"
  theme="solid"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger, solid theme

:::callout[Danger (solid)]{
  variant="danger"
  theme="solid"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success, solid theme

:::callout[Success (solid)]{
  variant="success"
  theme="solid"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.
:::

## Theme: glass

### Callout: note, glass theme

:::callout[Note (glass)]{
  variant="note"
  theme="glass"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.
:::

### Callout: info, glass theme

:::callout[Information (glass)]{
  variant="info"
  theme="glass"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.
:::

### Callout: tip, glass theme

:::callout[Tip (glass)]{
  variant="tip"
  theme="glass"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.
:::

### Callout: warning, glass theme

:::callout[Warning (glass)]{
  variant="warning"
  theme="glass"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.
:::

### Callout: danger, glass theme

:::callout[Danger (glass)]{
  variant="danger"
  theme="glass"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.
:::

### Callout: success, glass theme

:::callout[Success (glass)]{
  variant="success"
  theme="glass"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.
:::

## Rich Content

### Callout: note with multiple paragraphs, a list, and code

:::callout[Note: rich body]{
  variant="note"
  icon="@fa-duotone/laptop"
}
Neutral supporting context that sits alongside the main text.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

### Callout: info with multiple paragraphs, a list, and code

:::callout[Information: rich body]{
  variant="info"
  icon="@fa-duotone/laptop"
}
Explanatory context, such as how a feature behaves under the hood.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

### Callout: tip with multiple paragraphs, a list, and code

:::callout[Tip: rich body]{
  variant="tip"
  icon="@fa-duotone/laptop"
}
A recommended shortcut: use `[Label]` instead of `title=""` in new Markdown.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

### Callout: warning with multiple paragraphs, a list, and code

:::callout[Warning: rich body]{
  variant="warning"
  icon="@fa-duotone/server"
}
An important caveat: pass `collectionSlug` so collection-scoped config applies.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

### Callout: danger with multiple paragraphs, a list, and code

:::callout[Danger: rich body]{
  variant="danger"
  icon="@fa-duotone/server"
}
Destructive behavior: this operation drops the field and cannot be undone.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

### Callout: success with multiple paragraphs, a list, and code

:::callout[Success: rich body]{
  variant="success"
  icon="@fa-duotone/server"
}
Confirmation: the migration finished and every document was re-rendered.

A second paragraph with **bold**, *italic*, a [link](/posts), and `inline code`.

- First list item
- Second list item with `code`
  - A nested item

1. An ordered item
2. Another ordered item

```ts
payloadMarkdown({
  collections: { posts: true },
})
```

A closing paragraph after the code block.
:::

## Edge Cases

### Callout: long title that wraps

:::callout[A deliberately long callout title that should wrap onto a second line on narrow screens without colliding with the icon]{
  variant="info"
  icon="@fa-duotone/laptop"
}
Check that the icon stays aligned with the first line of the title.
:::

### Callout: long body paragraph

:::callout[Long body]{variant="note"}
This callout holds a single long paragraph so the inner padding, the line length, and the contrast of variant-tinted text can be judged over several wrapped lines. Callouts are often dropped into the middle of long articles, so they must not feel cramped next to the surrounding prose, and the text colour must stay readable against every variant background in every theme.
:::

### Callout: blockquote and table inside

A blank line is required between the last table row and the closing marker.

:::callout[Quote and table]{variant="tip"}
> A blockquote inside a callout.

| Option | Default |
| --- | --- |
| `variant` | `note` |
| `theme` | `soft` |

:::

### Callout: nested details

:::callout[With nested details]{variant="warning"}
The disclosure below is nested inside the callout.

:::details[Show the recovery steps]
1. Restore the backup.
2. Re-run the migration.

:::
:::

### Callouts: stacked back to back

:::callout[First]{variant="info"}
Two callouts with nothing between them.
:::

:::callout[Second]{variant="success"}
Check the vertical gap between adjacent callouts.
:::

### Callout: directly after a paragraph

The callout below follows this paragraph with no heading in between.

:::callout{variant="note"}
Spacing between a paragraph and a callout.
:::

A paragraph directly after a callout.
