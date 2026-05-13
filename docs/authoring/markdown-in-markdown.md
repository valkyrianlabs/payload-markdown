---
title: Markdown In Markdown
navTitle: Markdown In Markdown
description: Document directive syntax and nested code fences using Markdown-in-Markdown fenced examples.
order: 330
status: published
tags:
  - authoring
  - examples
  - directives
---

# Markdown In Markdown

When documenting Markdown syntax, the examples often contain both directive markers and fenced code blocks. Use a fence with more backticks than any fence inside the example.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Showing A Directive

Use four backticks around an example that contains a normal triple-backtick code fence:

`````md
````md
:::callout[Use the server renderer]{variant="tip"}
Render fields with:

```tsx
<MarkdownRenderer markdown={post.content} />
```
:::
````
`````

The rendered documentation shows the directive syntax instead of executing it.

## Showing Nested Directives

Use the same approach for a directive inside another directive:

`````md
````md
:::steps{
  variant="cards"
  stepTheme="glass"
}

### Configure

:::callout[Collection scope]{variant="warning"}
Pass `collectionSlug` when collection-scoped config should apply.
:::

### Render

```tsx
<MarkdownRenderer collectionSlug="posts" markdown={content} />
```

:::
````
`````

## Showing Tabs

Tabs examples usually contain directive nesting and package-manager code fences:

`````md
````md
:::tabs{default="pnpm"}

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

:::
````
`````

## Common Mistakes

:::cards{
  columns="2"
  cardTheme="muted"
}

:::card[Outer fence too short]
If the outer example fence is also triple backticks, the first inner code block closes the example early.
:::

:::card[Unclosed directive]
Every container directive needs a closing `:::` or the specific closer documented for layout directives.
:::

:::card[Raw classes in content]
Prefer named themes from config. Keep Tailwind class strings in source where Tailwind can scan them.
:::

:::card[Absolute internal links]
Use docs-root relative links such as `/directives/cards`, not a production domain.
:::

:::
