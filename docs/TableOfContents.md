# Table of Contents

Use `:::toc` to render a table of contents from headings in the current Markdown document.

```md
:::toc {title="On this page" depth="3" theme="compact"}
:::
```

## Attributes

- `title`: visible TOC title and aria label
- `depth`: maximum heading depth from `1` to `6`
- `theme`: TOC theme name

Defaults:

- `title="On this page"`
- `depth="3"`
- `theme="default"`

Invalid `depth` values fall back to `3` and produce a non-fatal diagnostic where diagnostics are available.

## Heading Anchors

The renderer gives headings stable IDs:

```md
## Install

## Install
```

Conceptual output:

```html
<h2 id="install">Install</h2>
<h2 id="install-1">Install</h2>
```

`:::toc` links to the same IDs, so heading anchors and TOC entries stay aligned.

## Themes

Built-in TOC themes:

- `default`
- `compact`
- `sidebar`
