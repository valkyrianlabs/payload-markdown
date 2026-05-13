---
title: Migrations
navTitle: Migrations
description: Migrate deprecated Payload Markdown config aliases and older block parameter fields.
order: 420
status: published
tags:
  - advanced
  - migrations
---

# Migrations

Most minor releases do not require stored content migrations. When a release changes stored data or Payload schema fields, a guide is provided here.

:::toc[On this page]{depth="3" theme="compact"}
:::

## Current Deprecations

The preferred public configuration shape is:

```ts
payloadMarkdown({
  code: {},
  themes: {},
  config: {},
  collections: {
    posts: {
      code: {},
      themes: {},
      config: {},
    },
  },
})
```

Legacy aliases still work but should be migrated when convenient.

## Code Config

Deprecated:

```ts
payloadMarkdown({
  config: {
    fullBleedCode: true,
    options: {
      enhancedCodeBlocks: true,
      langs: ['ts', 'tsx'],
      lineNumbers: true,
      theme: 'github-dark',
    },
  },
})
```

Preferred:

```ts
payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: true,
    langs: ['ts', 'tsx'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
})
```

Mapping:

- `config.options.langs` to `code.langs`
- `config.options.lineNumbers` to `code.lineNumbers`
- `config.options.theme` to `code.shikiTheme`
- `config.options.enhancedCodeBlocks` to `code.enhanced`
- `config.fullBleedCode` to `code.fullBleed`

New `code` values win over legacy values.

## Layout Class Aliases

Deprecated:

```ts
payloadMarkdown({
  config: {
    columnClassName: 'gap-8',
    sectionClassName: 'rounded-2xl border p-6',
  },
})
```

Preferred:

```ts
payloadMarkdown({
  themes: {
    columns: {
      items: [{ name: 'panel', classes: 'grid grid-cols-1 gap-8' }],
    },
    section: {
      items: [{ name: 'panel', classes: 'rounded-2xl border p-6' }],
    },
  },
})
```

## Available Migration Guides

- [v1.0.0 To v1.1.0](/advanced/v1-v1-1)

## General Guidance

- Back up production databases before schema migrations.
- Test migrations locally or against staging first.
- Run Payload locally after schema changes and handle any reconciliation prompts intentionally.
- If no schema warnings appear during development, no action is required.
