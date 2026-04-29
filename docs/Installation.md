# Installation

```bash
pnpm add @valkyrianlabs/payload-markdown
```

## Register the Plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'
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

When enabled for a collection, the plugin can automatically install:

- a Markdown field when no blocks field is present
- the Markdown block into existing blocks-based layouts

## Preferred Configuration Shape

Keep code rendering, directive themes, and renderer presentation config separate:

```ts
import { DEFAULT_CODE_LANGS, payloadMarkdown } from '@valkyrianlabs/payload-markdown'

payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: false,
    langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
  collections: {
    posts: {
      code: {
        lineNumbers: false,
      },
      config: {
        className: '[&_li::marker]:text-cyan-200/90',
      },
      themes: {
        card: {
          extendDefaults: true,
          items: [
            {
              name: 'postHeroCard',
              classes: 'bg-gradient-to-br from-cyan-950/60 to-slate-950 border-cyan-300/40',
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
      extendDefaults: true,
      items: [
        {
          name: 'forge',
          classes: 'bg-gradient-to-br from-cyan-950/70 to-slate-950 border-cyan-400/50',
        },
      ],
    },
  },
})
```

Use `code`, not `config.options`, for Shiki and code fence behavior. Use `themes`, not `config.themes`, for directive theme registries.

## Tailwind Typography

For best rendering defaults, enable Tailwind Typography and scan the package output:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

Theme class strings should live in source/config so Tailwind can see them. Markdown authors should select named themes with `theme="..."` rather than placing arbitrary Tailwind class strings in content.
