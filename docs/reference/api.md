---
title: API Reference
navTitle: API
description: Reference exports, options, renderer props, directive names, and default theme names.
order: 500
status: published
tags:
  - reference
  - api
---

# API Reference

:::toc[On this page]{depth="3" theme="compact"}
:::

## Package Exports

Main export:

```ts
import {
  DEFAULT_CALLOUT_THEMES,
  DEFAULT_CARD_THEMES,
  DEFAULT_CARDS_THEMES,
  DEFAULT_CELL_THEMES,
  DEFAULT_CODE_LANGS,
  DEFAULT_COLUMNS_THEMES,
  DEFAULT_DETAILS_THEMES,
  DEFAULT_SECTION_THEMES,
  DEFAULT_STEPS_THEMES,
  DEFAULT_TAB_THEMES,
  DEFAULT_TABS_THEMES,
  DEFAULT_TOC_THEMES,
  MarkdownBlock,
  markdownField,
  payloadMarkdown,
} from '@valkyrianlabs/payload-markdown'
```

Server export:

```ts
import {
  MarkdownBlockComponent,
  MarkdownRenderer,
  PayloadMarkdownField,
} from '@valkyrianlabs/payload-markdown/server'
```

Headless render export (no React, Next.js or CSS; works in plain Node):

```ts
import {
  compileMarkdown,
  createHeadingSlugger,
  extractHeadingAnchors,
  renderMarkdown,
  slugifyHeading,
} from '@valkyrianlabs/payload-markdown/render'
```

Stylesheet export:

```ts
import '@valkyrianlabs/payload-markdown/styles.css'
```

Advanced export:

```ts
import {
  createHeadingSlugger,
  createPayloadMarkdownIconRegistryEntry,
  createPayloadMarkdownIconRegistrySource,
  extractHeadingAnchors,
  slugifyHeading,
  vlMdCodeBlockConfig,
  vlMdConfig,
  vlMdTailwindField,
} from '@valkyrianlabs/payload-markdown/advanced'
```

## `renderMarkdown`

```ts
function renderMarkdown(markdown: string, config?: MarkdownRenderConfig): Promise<RenderedMarkdown>

type RenderedMarkdown = {
  diagnostics: RenderDiagnostic[]
  errors: string[]
  headings: Array<{ depth: number; id: string; text: string }>
  html: string
  links: Array<{ kind: 'definition' | 'directive' | 'image' | 'link'; url: string }>
  text: string
  warnings: string[]
}

type RenderDiagnostic = {
  code?: string
  column?: number
  line?: number
  message: string
  severity: 'error' | 'info' | 'warning'
  source: 'code' | 'directive' | 'icon' | 'render' | 'theme'
}
```

`links` lists authored URLs before sanitization; unsafe directive links are removed from `html` and reported in `diagnostics`.

## `PayloadMarkdownConfig`

```ts
type PayloadMarkdownConfig = {
  code?: MarkdownCodeConfig
  collections?: Partial<Record<CollectionSlug, PayloadMarkdownCollectionConfig | true>>
  config?: ConfigOptions
  enabled?: boolean
  icons?: PayloadMarkdownIconsConfig
  themes?: MarkdownDirectiveThemes
}
```

`enabled` defaults to enabled behavior. Set `enabled: false` only when you want the plugin to return the incoming Payload config unchanged.

## `PayloadMarkdownIconsConfig`

```ts
type PayloadMarkdownIconPack = {
  alias: string
  path: string
}

type PayloadMarkdownIconsConfig = {
  baseDir: string
  packs: PayloadMarkdownIconPack[]
}
```

Icon refs in Markdown use `@pack/name`, such as `@fa-duotone/home`. The plugin validates pack aliases, pack paths, icon refs, traversal attempts, unknown packs, and missing SVG files.

## `PayloadMarkdownCollectionConfig`

```ts
type PayloadMarkdownCollectionConfig = {
  code?: MarkdownCodeConfig
  config?: ConfigOptions
  field?: Omit<MarkdownFieldOptions, 'name'>
  fieldName?: string
  installField?: boolean
  installIntoBlocks?: boolean
  themes?: MarkdownDirectiveThemes
}
```

## `MarkdownCodeConfig`

```ts
type MarkdownCodeConfig = {
  enhanced?: boolean
  fullBleed?: boolean
  langs?: string[]
  lineNumbers?: boolean
  shikiTheme?: string
}
```

Defaults:

- `enhanced`: `true`
- `lineNumbers`: `true` when enhanced rendering is enabled
- `shikiTheme`: `github-dark`
- `fullBleed`: `false`

## `MarkdownConfig`

```ts
type MarkdownConfig = {
  className?: string
  enableGutter?: boolean
  lead?: ReactNode
  mutedHeadings?: boolean
  size?: 'lg' | 'md' | 'sm'
  variant?: 'blog' | 'compact' | 'docs' | 'unstyled'
  wrapperClassName?: string

  // Deprecated aliases
  columnClassName?: string
  fullBleedCode?: boolean
  options?: RenderMarkdownOptions
  sectionClassName?: string
}
```

## `MarkdownRenderConfig`

```ts
type MarkdownRenderConfig = {
  code?: MarkdownCodeConfig
  icons?: PayloadMarkdownIconsConfig
  themes?: MarkdownDirectiveThemes
} & MarkdownConfig
```

## `ConfigOptions`

`config` can be shared or split by field and block scope:

```ts
type ConfigOptions =
  | MarkdownConfig
  | {
      blocks?: MarkdownConfig
      field?: MarkdownConfig
    }
```

## Renderer Props

```ts
type MarkdownRendererProps = {
  as?: keyof JSX.IntrinsicElements
  collectionSlug?: string
  emptyFallback?: ReactNode
  errorFallback?: ReactNode
  markdown?: null | string
  scope?: 'blocks' | 'field'
} & MarkdownRenderConfig
```

## Markdown Field Options

```ts
type MarkdownFieldOptions = {
  admin?: Partial<TextField['admin']>
  defaultValue?: string
  label?: string
  localized?: boolean
  name?: string
  required?: boolean
}
```

## Directive Names

Layout directives:

- `section`
- `2col`
- `3col`
- `cell`

Static directives:

- `badge`
- `badges`
- `button`
- `buttons`
- `callout`
- `details`
- `toc`
- `steps`
- `cards`
- `card`
- `tabs`
- `tab`

Close markers:

- `:::`
- `:::end`
- `:::endcol`
- `:::endsection`

## Directive Theme Groups

```ts
type MarkdownDirectiveThemes = {
  callout?: MarkdownDirectiveThemeGroup
  card?: MarkdownDirectiveThemeGroup
  cards?: MarkdownDirectiveThemeGroup
  cell?: MarkdownDirectiveThemeGroup
  columns?: MarkdownDirectiveThemeGroup
  details?: MarkdownDirectiveThemeGroup
  section?: MarkdownDirectiveThemeGroup
  steps?: MarkdownDirectiveThemeGroup
  tab?: MarkdownDirectiveThemeGroup
  tabs?: MarkdownDirectiveThemeGroup
  toc?: MarkdownDirectiveThemeGroup
}
```

Theme items use `classes`:

```ts
type MarkdownDirectiveTheme = {
  classes: string
  label?: string
  name: string
}
```

## Default Theme Names

Callout:

- `soft`
- `solid`
- `glass`

Card:

- `default`
- `muted`
- `glass`
- `cyan`
- `violet`
- `emerald`
- `amber`
- `danger`

Cards:

- `default`
- `compact`
- `spacious`
- `feature-grid`

Steps:

- `default`
- `muted`
- `glass`
- `cyan`

Tabs:

- `default`
- `muted`
- `glass`
- `underline`
- `pills`

Tab:

- `default`
- `muted`
- `glass`

Details:

- `default`
- `muted`
- `glass`

TOC:

- `default`
- `compact`
- `sidebar`

Section:

- `default`
- `muted`
- `panel`

Columns:

- `default`
- `panel`

Cell:

- `default`
- `panel`
