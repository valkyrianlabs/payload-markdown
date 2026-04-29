# Migrations

Most minor releases do not require stored content migrations. When a release changes stored data or Payload schema fields, a guide is provided here.

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

### Code Config

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

- `config.options.langs` → `code.langs`
- `config.options.lineNumbers` → `code.lineNumbers`
- `config.options.theme` → `code.shikiTheme`
- `config.options.enhancedCodeBlocks` → `code.enhanced`
- `config.fullBleedCode` → `code.fullBleed`

New `code` values win over legacy values.

### Layout Class Aliases

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

- [v1.0.0 → v1.1.0](/plugins/payload-markdown/migrations/v1-v1_1)

## General Guidance

- Back up production databases before schema migrations.
- Test migrations locally or against staging first.
- If no schema warnings appear during development, no action is required.
