---
title: Installation
navTitle: Installation
description: Install the package and register Payload Markdown in Payload config.
order: 20
status: published
tags:
  - getting-started
  - installation
---

# Installation

:::toc[On this page]{depth="3" theme="compact"}
:::

Install the package in the Payload app:

```bash
pnpm add payload-markdown
```

:::callout[Install the agent skill]{variant="tip"}
If you use Payload MCP or let AI agents such as Claude Code or Codex work in your repo, install the skill that ships with the package. It teaches agents every directive, theme and the MCP content workflow.

```bash
npx payload-markdown skill install
```

Run it again after upgrading the package. See [Agent Skill](/agents#agent-skill) for drift checks and options.
:::

## Package Names

The package is published under two names from the same build, always at the same version:

| Package | Install |
| --- | --- |
| `payload-markdown` | `pnpm add payload-markdown` |
| `@valkyrianlabs/payload-markdown` | `pnpm add @valkyrianlabs/payload-markdown` |

Both are fully supported and behave identically. Import from the name you installed: these docs use `payload-markdown`, so with the scoped package write `@valkyrianlabs/payload-markdown/server` instead of `payload-markdown/server`, and so on. The Payload admin components follow whichever name is installed, so the import map needs no extra configuration.

Switching an existing app from one name to the other: replace the dependency and the imports, update the Tailwind `@source` path, then run `payload generate:importmap` so the admin import map points at the new name.

:::callout[Install one name]{variant="warning"}
Installing both names loads two copies of the plugin. Pick one per app.
:::

## Register The Plugin

Add `payloadMarkdown()` to the Payload `plugins` array.

```ts
import { payloadMarkdown } from 'payload-markdown'
import type { Config } from 'payload'

const config: Config = {
  plugins: [
    payloadMarkdown({
      collections: {
        posts: true,
      },
    }),
  ],
}

export default config
```

When a collection is enabled with `true`, the plugin infers the useful install path:

- collections without a `blocks` field receive a Markdown text field named `content`
- collections with one or more `blocks` fields receive the `vlMdBlock` Markdown block inside those fields

:::callout[The plugin avoids duplicates]{variant="info"}
If a collection already has a field with the target name, the plugin does not add another one. If the root Payload config or a blocks field already includes `vlMdBlock`, it is not added twice.
:::

## Configure A Collection Explicitly

Use an object when you want to choose the field name, field options, or install behavior.

```ts
payloadMarkdown({
  collections: {
    posts: {
      fieldName: 'body',
      field: {
        admin: {
          description: 'Author-facing Markdown body',
        },
        defaultValue: '# Draft',
        label: 'Body Markdown',
        localized: true,
        required: true,
      },
      installField: true,
      installIntoBlocks: false,
    },
  },
})
```

## Preferred Config Shape

Keep each concern in its own namespace:

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from 'payload-markdown'

payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: false,
    langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
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
  collections: {
    posts: {
      code: {
        lineNumbers: false,
      },
      config: {
        variant: 'docs',
      },
      themes: {
        callout: {
          items: [
            {
              name: 'editorial',
              classes: 'rounded-xl border border-white/10 bg-white/5 px-4 py-3',
            },
          ],
        },
      },
    },
  },
})
```

Use `code`, not `config.options`, for Shiki and code fence behavior. Use `themes`, not `config.themes`, for directive theme registries.

## Tailwind Setup

The renderer uses Tailwind-friendly class strings. For the default typography layer, install and enable Tailwind Typography:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/payload-markdown/dist";
```

Installed the scoped package? Point `@source` at `../node_modules/@valkyrianlabs/payload-markdown/dist` instead.

Keep custom directive theme class strings in source-controlled config so Tailwind can discover them. Markdown authors should select named themes with `theme="..."` rather than writing arbitrary Tailwind classes in CMS content.
