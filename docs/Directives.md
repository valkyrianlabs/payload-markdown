# Directives

Directives are Markdown containers powered by the plugin directive registry. They keep content portable while giving the renderer structured hooks.

## Public Directives

- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- `:::tabs`
- `:::tab`
- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`

## Basic Syntax

```md
:::callout {variant="warning" title="Read this first"}
Content stays Markdown.
:::
```

Attributes use directive marker lines:

```md
:::card {title="Markdown Field" href="/docs/markdown-field" theme="cyan"}
Portable Markdown content.
:::
```

Quoted values are supported. Boolean-style attributes are supported where a directive defines them, such as `open="true"` on details or `numbered` on card steps.

## Rendering Guarantees

- Directives render server-side.
- Directives do not require client hydration.
- Nested Markdown remains Markdown.
- Unknown or malformed attributes warn where possible and fall back safely.
- Stable selectors are emitted for testing and styling, such as `data-directive`, `data-theme`, and `vl-md-*` classes.

## Heading Anchors

Headings render with deterministic IDs:

```md
## Install

## Install
```

Conceptual output:

```html
<h2 id="install">Install</h2>
<h2 id="install-1">Install</h2>
```

The table of contents directive uses those same heading IDs.

## Directive Pages

- [Callout](/plugins/payload-markdown/callout)
- [Details](/plugins/payload-markdown/details)
- [Table of Contents](/plugins/payload-markdown/table-of-contents)
- [Steps](/plugins/payload-markdown/steps)
- [Cards](/plugins/payload-markdown/cards)
- [Tabs](/plugins/payload-markdown/tabs)
- [Layout Directives](/plugins/payload-markdown/layout)
- [Directive Themes](/plugins/payload-markdown/directive-themes)
