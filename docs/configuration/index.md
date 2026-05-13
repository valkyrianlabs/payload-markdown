---
title: Configuration
navTitle: Configuration
description: Configure code rendering, directive themes, presentation defaults, and collection overrides.
order: 100
status: published
tags:
  - configuration
---

# Configuration

Payload Markdown separates configuration into clear namespaces:

```ts
payloadMarkdown({
  code: {},
  icons: {},
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

Use `code` for Shiki and fenced code behavior, `icons` for local SVG icon packs, `themes` for directive theme registries, and `config` for Markdown wrapper presentation.

:::cards {columns="3" cardTheme="glass"}

:::card {title="Plugin Config" href="/configuration/plugin-config"}
The full public config shape, icon packs, collection install options, and preferred namespaces.
:::

:::card {title="Scoping" href="/configuration/scoping"}
How defaults merge from plugin config through collection config and direct renderer props.
:::

:::card {title="Code Blocks" href="/configuration/code-blocks"}
Shiki themes, language loading, enhanced rendering, line numbers, and full-bleed code.
:::

:::card {title="Styling" href="/configuration/styling"}
Tailwind setup, wrapper classes, typography variants, and deprecated class aliases.
:::

:::card {title="Directive Themes" href="/configuration/directive-themes"}
Named themes, built-in theme groups, parent-child defaults, and stable output hooks.
:::

:::card {title="API Reference" href="/reference/api"}
Option names, exports, directive names, and renderer props in one place.
:::

:::

:::callout {variant="warning" title="Keep namespaces separate"}
Do not put directive themes under `config`, and prefer top-level or collection-level `code` over legacy `config.options`.
:::
