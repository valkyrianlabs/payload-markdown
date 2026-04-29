# @valkyrianlabs/payload-markdown

<span class="flex gap-3">
  <a href="https://github.com/valkyrianlabs/payload-markdown/actions"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/valkyrianlabs/payload-markdown/deploy.yml"></a>
  <a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown" /></a>
  <a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown" /></a>
  <a href="https://github.com/valkyrianlabs/payload-markdown?tab=MIT-1-ov-file"><img alt="license" src="https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown" /></a>
  <a href="https://github.com/valkyrianlabs/payload-markdown"><img alt="GitHub Repo" src="https://img.shields.io/badge/github-repo-blue?logo=github" /></a>
</span>

Markdown field and block support for Payload CMS with a CodeMirror editor, server-rendered Markdown, Shiki code blocks, and registry-backed content directives.

The stored value stays portable Markdown. The plugin handles editing, preview, syntax highlighting, directive rendering, and scoped styling through explicit `code`, `themes`, and `config` namespaces.

```bash
pnpm add @valkyrianlabs/payload-markdown
```

## Documentation

### Getting Started

#### [Installation](/plugins/payload-markdown/installation)

#### [Rendering](/plugins/payload-markdown/rendering)

#### [Blocks](/plugins/payload-markdown/blocks)

### Configuration

#### [Configuration](/plugins/payload-markdown/configuration)

#### [Scoping](/plugins/payload-markdown/scoping)

#### [Code Blocks](/plugins/payload-markdown/code-blocks)

#### [Styling](/plugins/payload-markdown/styling)

#### [Directive Themes](/plugins/payload-markdown/directive-themes)

### Directives

#### [Directives Overview](/plugins/payload-markdown/directives)

#### [Layout Directives](/plugins/payload-markdown/layout)

#### [Callout](/plugins/payload-markdown/callout)

#### [Details](/plugins/payload-markdown/details)

#### [Table of Contents](/plugins/payload-markdown/table-of-contents)

#### [Steps](/plugins/payload-markdown/steps)

#### [Cards](/plugins/payload-markdown/cards)

### Authoring

#### [Editor Autocomplete and Diagnostics](/plugins/payload-markdown/editor)

#### [Examples](/plugins/payload-markdown/examples)

### Upgrading

#### [Migrations](/plugins/payload-markdown/migrations)

## Quick Start

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: false,
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
  collections: {
    posts: true,
  },
  config: {
    size: 'lg',
    variant: 'blog',
  },
})
```

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function PostBody({ content }: { content?: string | null }) {
  return <MarkdownRenderer collectionSlug="posts" markdown={content} />
}
```

## What You Get

- Plain Markdown storage for portable content.
- Payload field and block support.
- CodeMirror editing with directive autocomplete, snippets, placeholders, and lightweight diagnostics.
- Server-rendered Markdown with Shiki code highlighting.
- Registry-backed directives for callouts, details, TOCs, steps, cards, and layout.
- Heading anchors with deterministic duplicate slugs.
- Top-level and collection-scoped `code`, `themes`, and `config`.
- Directive theme registry with stable `vl-md-*` hook classes and `data-theme` attributes.

## Local Development

The repository includes a `/dev` Payload/Next sample project used to exercise the plugin during development. Plugin source lives in `/src`; the dev app is only the local test surface.

## Configuration Shape

Use separate namespaces for separate concerns:

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

Do not put directive themes under `config`, and prefer `code` over legacy `config.options`.
