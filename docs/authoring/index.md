---
title: Authoring
navTitle: Authoring
description: Write Markdown content with editor autocomplete, directive diagnostics, and copyable examples.
order: 300
status: published
tags:
  - authoring
---

# Authoring

Authoring happens in a CodeMirror-powered Payload field. Authors write Markdown, use directive snippets, and preview server-rendered output without storing rich-text JSON.

:::cards {columns="3" cardTheme="glass"}

:::card {title="Editor" href="/authoring/editor"}
Autocomplete, snippets, placeholder tabstops, attribute suggestions, and diagnostics.
:::

:::card {title="Rich Examples" href="/authoring/rich-examples"}
Copyable examples for blog posts, docs pages, landing sections, and comparison content.
:::

:::card {title="Markdown In Markdown" href="/authoring/markdown-in-markdown"}
How to document directive syntax and nested fenced code blocks without breaking examples.
:::

:::

## Authoring Principles

- Keep content portable and readable in Git.
- Use directives for structure, not arbitrary HTML.
- Use named themes from source config rather than raw Tailwind classes in authored Markdown.
- Prefer root-relative links inside the docs set, such as `/directives/cards`.
- Use fenced code blocks with language hints for Shiki.

:::callout {variant="tip" title="Directives are still Markdown"}
Every directive example in these docs is copyable source content. The same text can live in a Payload Markdown field, a Markdown block, or Git-backed docs.
:::
