---
title: Plugin Config
navTitle: Plugin Config
description: Use the public Payload Markdown config model for fields, blocks, code rendering, themes, and presentation defaults.
order: 110
status: published
tags:
  - configuration
  - payload
---

# Plugin Config

:::toc[On this page]{depth="3" theme="compact"}
:::

## Full Example

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from 'payload-markdown'

payloadMarkdown({
  enabled: true,
  code: {
    enhanced: true,
    fullBleed: false,
    langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
  icons: {
    baseDir: '../public/icons',
    packs: [
      { alias: 'fa-duotone', path: 'fa/duotone' },
      { alias: 'brand', path: 'brand' },
    ],
  },
  collections: {
    pages: true,
    posts: {
      fieldName: 'body',
      field: {
        label: 'Body Markdown',
        localized: true,
        required: true,
      },
      installField: true,
      installIntoBlocks: false,
      code: {
        lineNumbers: false,
      },
      config: {
        variant: 'docs',
      },
      themes: {
        card: {
          items: [
            {
              name: 'postHeroCard',
              classes: 'rounded-2xl border border-white/10 bg-cyan-950/30 p-5',
            },
          ],
        },
      },
    },
  },
  config: {
    size: 'lg',
    variant: 'blog',
  },
  themes: {
    card: {
      items: [
        {
          name: 'feature',
          classes: 'rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5',
        },
      ],
    },
  },
})
```

## Top-Level Options

- `enabled`: defaults to enabled behavior; set to `false` to return the incoming Payload config unchanged
- `collections`: map of collection slugs to `true`, an options object, or a falsey value to skip
- `code`: Shiki and fenced code rendering defaults
- `icons`: local SVG icon packs available to Markdown directives
- `themes`: directive theme registry extensions
- `config`: Markdown wrapper and typography defaults

:::details[Runtime settings initialization]
Runtime helpers read plugin settings from `payloadMarkdown(...)`. If you use renderer helpers before the plugin initializes, `getPayloadMarkdownSettings()` throws. In normal Payload usage, include the plugin in the config before rendering Markdown.
:::

## Where Settings Live

`payloadMarkdown(...)` resolves its render settings (`code`, `config`, `icons`, `themes` and each collection's `code`, `config` and `themes`) into a frozen, serialisable object and stores it in two places:

- on the Payload config it returns, as `config.custom.payloadMarkdown` (server-only);
- in a process-wide registry that every installed copy of the plugin shares (under either package name), so a second copy (for example one installed by another plugin) renders with the same settings.

`MarkdownRenderer`, `MarkdownBlockComponent` and `renderMarkdown` use, in order:

1. the `settings` you pass: the settings object, a Payload config, or a Payload instance;
2. otherwise the registry, which holds the settings of the most recently built config;
3. otherwise no plugin defaults.

```tsx
<MarkdownRenderer markdown={doc.content} settings={payload} />
```

If one process builds several Payload configs with different Markdown settings (for example multi-tenant setups), pass `settings` explicitly; without it, every renderer uses the last built config. `enabled: false` clears the registry.

When copies with different versions are loaded, the plugin logs one `console.warn` naming the versions. Install a single version to keep rendering consistent.

## Icons

Configure local SVG icon packs with `icons`:

```ts
payloadMarkdown({
  icons: {
    baseDir: '../public/icons',
    packs: [
      { alias: 'fa-duotone', path: 'fa/duotone' },
      { alias: 'brand', path: 'brand' },
    ],
  },
})
```

Expected folder layout:

```txt
public/icons/
  fa/duotone/
    home.svg
    rocket.svg
  brand/
    github.svg
```

Markdown references use `@pack/name`:

```md
::button[Home]{
  href="/home"
  icon="@fa-duotone/home"
}

::button[GitHub]{
  href="https://github.com/valkyrianlabs"
  icon="@brand/github"
  newTab=true
}
```

Only local SVG packs are supported. The plugin does not integrate FortAwesome packages, fetch remote icons, or accept arbitrary icon URLs.

Paid or pro icon files should stay local and gitignored. CI-safe tests and fixtures should use tiny committed SVG fixtures outside `public/icons`, and local paid-icon checks should be opt-in only.

The server renderer emits sanitized inline SVG in the rendered HTML. Icon files are parsed with an HTML parser and filtered through a strict SVG allowlist: only the first top-level `<svg>` is kept; `<script>`, `<style>`, `<foreignObject>`, animation elements, images, event-handler attributes, and non-`#fragment` `href`s are removed. Icons that rely on an embedded `<style>` block (for example duotone class rules) should express those styles as SVG presentation attributes or in your site CSS. If your app needs a bundler-backed static import registry for SVG component workflows, use the advanced icon registry helper to generate static imports from your local pack layout. Those imports rely on your host app's SVG support, such as Next, SVGR, Webpack, Turbopack, or an equivalent loader. Keep generated files that import paid icons out of source control.

## Collection Options

Collection entries can be `true` or an object:

```ts
payloadMarkdown({
  collections: {
    posts: true,
    pages: {
      fieldName: 'content',
      installField: false,
      installIntoBlocks: true,
    },
  },
})
```

Collection object options:

- `fieldName`: name for the auto-installed Markdown field, defaulting to `content`
- `field`: field options passed to `markdownField()` except `name`
- `installField`: explicitly add or skip a standalone Markdown field
- `installIntoBlocks`: explicitly add or skip `MarkdownBlock` inside collection `blocks` fields
- `code`: collection-scoped code rendering overrides
- `themes`: collection-scoped directive themes
- `config`: collection-scoped wrapper and typography config

## Field Options

Auto-installed fields support:

- `admin`
- `defaultValue`
- `label`
- `localized`
- `required`

```ts
payloadMarkdown({
  collections: {
    posts: {
      fieldName: 'body',
      field: {
        admin: {
          description: 'Use Markdown and supported directives.',
        },
        defaultValue: '# Draft',
        label: 'Body Markdown',
        localized: true,
        required: true,
      },
      installField: true,
    },
  },
})
```

## Config Namespace

`config` controls presentation around the rendered Markdown:

```ts
payloadMarkdown({
  config: {
    className: '[&_li::marker]:text-cyan-200/90',
    enableGutter: true,
    mutedHeadings: true,
    size: 'lg',
    variant: 'blog',
    wrapperClassName: 'max-w-4xl',
  },
})
```

Supported variants are `blog`, `docs`, `compact`, and `unstyled`. Supported sizes are `lg`, `md`, and `sm`.

## Split Field And Block Config

`config` can also be split by scope:

```ts
payloadMarkdown({
  config: {
    blocks: {
      size: 'md',
      variant: 'docs',
    },
    field: {
      size: 'lg',
      variant: 'blog',
    },
  },
})
```

Use the split shape when block layouts need denser typography while standalone fields use article-style typography.

## Deprecated Aliases

These remain supported but are not preferred:

- `config.options.langs` to `code.langs`
- `config.options.lineNumbers` to `code.lineNumbers`
- `config.options.theme` to `code.shikiTheme`
- `config.options.enhancedCodeBlocks` to `code.enhanced`
- `config.fullBleedCode` to `code.fullBleed`
- `config.sectionClassName` to directive themes
- `config.columnClassName` to directive themes

New `code` values win over legacy aliases at the same scope.
