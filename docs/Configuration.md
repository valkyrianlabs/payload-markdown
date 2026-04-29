# Configuration

The public config model has three top-level namespaces:

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

Use each namespace for one job:

- `code` controls code fence and Shiki rendering.
- `themes` registers named directive themes.
- `config` controls Markdown wrapper and typography presentation.

## Full Example

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
    pages: true,
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
              classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5',
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
          classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5',
        },
      ],
    },
  },
})
```

## `code`

```ts
payloadMarkdown({
  code: {
    enhanced: true,
    fullBleed: false,
    langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
    lineNumbers: true,
    shikiTheme: 'github-dark',
  },
})
```

Options:

- `enhanced`
- `fullBleed`
- `langs`
- `lineNumbers`
- `shikiTheme`

Use `shikiTheme`, not `theme`, to avoid confusion with directive themes.

## `themes`

```ts
payloadMarkdown({
  themes: {
    card: {
      extendDefaults: true,
      items: [
        {
          name: 'cyan',
          classes: 'rounded-2xl border border-white/[0.06] bg-cyan-950/15 p-5',
        },
      ],
    },
  },
})
```

Theme objects use `classes`, not `className`. `extendDefaults` defaults to `true`, so custom themes are added to the built-in set unless you opt out.

## `config`

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

`config` is for Markdown wrapper presentation. It is not the code block API and it is not the directive theme registry.

## Collection Overrides

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
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
        toc: {
          items: [
            {
              name: 'postSidebar',
              classes: 'rounded-xl border border-white/[0.06] bg-[#18191c] px-4 py-3',
            },
          ],
        },
      },
    },
  },
})
```

Collection config overrides plugin-level config for that collection.

## Deprecated Aliases

These still work but are no longer preferred:

- `config.options.langs` → `code.langs`
- `config.options.lineNumbers` → `code.lineNumbers`
- `config.options.theme` → `code.shikiTheme`
- `config.options.enhancedCodeBlocks` → `code.enhanced`
- `config.fullBleedCode` → `code.fullBleed`
- `config.sectionClassName` → directive themes
- `config.columnClassName` → directive themes

New `code` values win over legacy `config.options`.
