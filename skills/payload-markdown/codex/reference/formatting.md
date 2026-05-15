# Formatting Guidance

## Frontmatter

When the docs system supports frontmatter, keep it simple and scalar-first:

```yaml
---
title: Installation
navTitle: Install
description: Install and configure the package.
order: 20
status: published
tags:
  - getting-started
  - installation
---
```

Use only fields that the target docs system supports. Do not invent navigation or publishing fields.

## Page Structure

- Use exactly one H1.
- Start with a short summary paragraph.
- Use H2 for major tasks and H3 for subsections.
- Avoid skipping heading levels unless the surrounding docs already do.
- Put the TOC after the intro on long pages.

## Links

- Use root-relative internal links inside a docs set, such as `/configuration/code-blocks`.
- Do not link to `.md` source paths unless documenting repository internals.
- Use external URLs only when the reader must leave the docs set.
- Prefer descriptive link text over "click here".

## Code And Markdown Examples

Use language-tagged fences:

````md
```ts
payloadMarkdown({
  collections: {
    posts: true,
  },
})
```
````

When documenting Markdown that contains fenced code blocks, make the outer fence longer than the inner fence:

`````md
````md
:::steps

### Install

```bash
pnpm add package-name
```

:::
````
`````

## Prose Style

- Prefer direct instructions.
- Use present tense for current behavior.
- Use "preferred" or "legacy" instead of implying older syntax is broken when it remains supported.
- Name defaults explicitly when users depend on them.
- Keep examples complete enough to copy.

## What To Avoid

- MDX imports or JSX components unless the target project explicitly supports MDX.
- Raw HTML widgets for layout.
- Runtime Tailwind classes in authored Markdown.
- Unsupported directive names.
- Placeholder claims such as "fully customizable" without naming the customization surface.
