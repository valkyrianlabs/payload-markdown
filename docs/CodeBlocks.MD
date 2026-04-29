# Code Blocks and Syntax Highlighting

Code fences are rendered with Shiki during the Markdown compile pipeline. The browser receives finished HTML; it does not need a client-side syntax highlighter.

## Preferred Code Config

Use the top-level `code` namespace for code fence and Shiki behavior:

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
})
```

Use collection-level `code` when one collection needs different behavior:

```ts
payloadMarkdown({
  code: {
    lineNumbers: true,
  },
  collections: {
    posts: {
      code: {
        langs: [...DEFAULT_CODE_LANGS, 'latex'],
        lineNumbers: false,
      },
    },
  },
})
```

## Options

- `enhanced` controls the plugin's normalized code block renderer. It defaults to `true`.
- `fullBleed` allows fenced code blocks to extend beyond the normal content width on larger screens.
- `langs` controls the Shiki languages loaded by the renderer.
- `lineNumbers` controls visible line numbers. Line numbers require enhanced rendering.
- `shikiTheme` controls the Shiki theme. The default is `github-dark`.

## Language Fences

Use standard fenced code blocks with a language identifier:

````md
```ts
export function sum(a: number, b: number) {
  return a + b
}
```
````

The language hint is passed to Shiki during markdown compilation.

## Enhanced Rendering

Enhanced rendering gives code fences:

- Shiki tokenization
- normalized spacing and layout
- optional line numbers
- server-rendered HTML output
- copy button behavior from the renderer client helper

Disable it when you want output closer to raw Shiki:

```ts
payloadMarkdown({
  code: {
    enhanced: false,
  },
})
```

When `enhanced` is `false`, line numbers are disabled even if `lineNumbers` is set.

## Custom Shiki Theme

```ts
payloadMarkdown({
  code: {
    shikiTheme: 'min-dark',
  },
})
```

`shikiTheme` is intentionally separate from directive `themes`.

## Legacy Aliases

The old `config.options` shape still works, but it is deprecated:

```ts
payloadMarkdown({
  config: {
    fullBleedCode: true,
    options: {
      enhancedCodeBlocks: true,
      langs: [...DEFAULT_CODE_LANGS],
      lineNumbers: true,
      theme: 'github-dark',
    },
  },
})
```

Migration mapping:

- `config.options.langs` → `code.langs`
- `config.options.lineNumbers` → `code.lineNumbers`
- `config.options.theme` → `code.shikiTheme`
- `config.options.enhancedCodeBlocks` → `code.enhanced`
- `config.fullBleedCode` → `code.fullBleed`

New `code` values win over legacy aliases.
