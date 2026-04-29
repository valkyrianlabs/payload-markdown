![@valkyrianlabs/payload-markdown](https://docs-media.valkyrianlabs.com/payload-markdown_v1.3_release_banner.png)

<a href="https://github.com/valkyrianlabs/payload-markdown/actions"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/valkyrianlabs/payload-markdown/deploy.yml"></a>
&nbsp;
<a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown" /></a>
&nbsp;
<a href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"><img alt="npm" src="https://img.shields.io/npm/dw/@valkyrianlabs/payload-markdown" /></a>
&nbsp;
<a href="https://github.com/valkyrianlabs/payload-markdown?tab=MIT-1-ov-file"><img alt="license" src="https://img.shields.io/npm/l/@valkyrianlabs/payload-markdown" /></a>

# Payload Markdown

Structured Markdown editing and rendering for Payload CMS.

`@valkyrianlabs/payload-markdown` gives Payload a Markdown-first authoring system with a CodeMirror editor, Shiki-powered code blocks, registry-backed directives, named themes, tabs, cards, table-of-contents generation, autocomplete, diagnostics, and server-first rendering.

No bloated rich text editor.  
No JSON-shaped content prison.  
No MDX ceremony for common docs/blog layouts.

Just portable Markdown that renders like a real system.

---

## Install from NPM

```bash
pnpm add @valkyrianlabs/payload-markdown
```

---

## [📖 Explore the Docs](https://docs.valkyrianlabs.com/plugins/payload-markdown)

---

## Why this exists

Most CMS content systems eventually force you into one of two weak paths:

- heavy rich text editors with fragile JSON-shaped content
- bare Markdown fields with no structure, no layout, and no serious authoring support

This plugin takes the third path:

- Markdown stays the source of truth
- structure lives directly in the content
- rendering is production-ready by default
- directives provide layout without turning content into a page-builder blob
- themes provide clean visual control without runtime Tailwind roulette
- autocomplete and diagnostics make authoring fast instead of fussy

**Write fast. Render clean. Stay in control.**

---

## What you get

- **Drop-in fields** — Markdown fields for Payload collections
- **Markdown blocks** — block support for Payload layouts
- **Editor UX** — CodeMirror-powered editing
- **Code rendering** — Shiki-powered highlighting
- **Server-first output** — clean rendering without client ceremony
- **Structured directives** — callouts, details, TOCs, steps, cards, tabs, and layouts
- **Autocomplete** — directive snippets and placeholders
- **Diagnostics** — lightweight authoring warnings
- **Heading anchors** — automatic IDs and table-of-contents support
- **Themes** — themeable directive output with stable hooks
- **Scoped config** — global and collection-level overrides
- **Portable storage** — clean Markdown source
- **AI-friendly workflow** — content that agents and humans can edit sanely

![Payload Markdown v1.3 directive preview](https://docs-media.valkyrianlabs.com/payload-markdown_v1.3_new_directives_example_1.png)

`payload-markdown` now renders structured Markdown directly inside the Payload admin preview, including callouts, details, TOCs, steps, cards, tabs, themes, and code blocks — without turning your content into JSON-shaped sludge.

---

## Directive system

Payload Markdown now supports structured directives for real content layouts:

- `:::callout`
- `:::details`
- `:::toc`
- `:::steps`
- `:::cards`
- `:::card`
- `:::tabs`
- `:::tab`
- `:::section`
- `:::2col`
- `:::3col`
- `:::cell`

Directives are plain Markdown. They stay readable in Git, easy to review in PRs, and simple for AI/editor tooling to maintain.

### Callouts

```markdown
:::callout {variant="warning" theme="soft" title="Read this first"}
This is a structured callout written directly in Markdown.
:::
```

### Details

```markdown
:::details {title="Advanced notes" theme="glass" open}
Progressively disclose advanced content without custom React glue.
:::
```

### Table of contents

```markdown
:::toc {title="On this page" depth="3" theme="compact"}
:::
```

### Steps

```markdown
:::steps {variant="cards" layout="stack" numbered stepTheme="cyan"}

### Install

Add the package.

### Configure

Register the plugin.

### Render

Use the server renderer.

:::
```

### Cards

```markdown
:::cards {columns="3" theme="spacious" cardTheme="glass"}

:::card {eyebrow="Core" title="Markdown Field"}
Portable Markdown content with live preview.
:::

:::card {eyebrow="Layout" title="Directive System" theme="cyan"}
Structured content without JSON soup.
:::

:::card {eyebrow="Rendering" title="Server-first Output" theme="violet"}
Clean rendering without client-side ceremony.
:::

:::
```

### Tabs

```markdown
:::tabs {default="pnpm" theme="glass"}

:::tab {label="pnpm" value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab {label="npm" value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::
```

---

## Themes

Directive themes are first-class.

Themes live beside `config`, not inside it:

```ts
payloadMarkdown({
  themes: {
    card: {
      extendDefaults: true,
      items: [
        {
          name: 'forge',
          classes:
            'bg-gradient-to-br from-cyan-950/70 to-slate-950 border-white/10',
        },
      ],
    },
  },
})
```

Use themes from Markdown:

```markdown
:::card {title="Themed Card" theme="forge"}
This card uses a configured theme.
:::
```

Theme objects use `classes`, not `className`.

Default themes are included automatically. You only define custom themes when you want to extend or override the built-ins.

Stable classes and data attributes are emitted for overrides:

```html
<article
  data-directive="card"
  data-theme="cyan"
  class="vl-md-card vl-md-card--theme-cyan ..."
>
```

---

## Code config

Code block rendering has its own top-level `code` namespace:

```ts
payloadMarkdown({
  code: {
    langs: [...DEFAULT_CODE_LANGS],
    lineNumbers: true,
    shikiTheme: 'github-dark',
    enhanced: true,
    fullBleed: false,
  },
})
```

Legacy `config.options` still works, but `code` is the preferred API.

Migration mapping:

- `config.options.langs` → `code.langs`
- `config.options.lineNumbers` → `code.lineNumbers`
- `config.options.theme` → `code.shikiTheme`
- `config.options.enhancedCodeBlocks` → `code.enhanced`
- `config.fullBleedCode` → `code.fullBleed`

---

## Quick setup

### Register the plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

export default {
  plugins: [
    payloadMarkdown({
      collections: {
        posts: true,
      },
    }),
  ],
}
```

### Render content

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

<MarkdownRenderer
  markdown={content}
  collectionSlug="posts"
/>
```

---

## Full config example

```ts
import {
  DEFAULT_CODE_LANGS,
  payloadMarkdown,
} from '@valkyrianlabs/payload-markdown'

export default {
  plugins: [
    payloadMarkdown({
      code: {
        langs: [...DEFAULT_CODE_LANGS],
        lineNumbers: true,
        shikiTheme: 'github-dark',
        enhanced: true,
        fullBleed: false,
      },

      themes: {
        card: {
          extendDefaults: true,
          items: [
            {
              name: 'forge',
              classes:
                'bg-gradient-to-br from-cyan-950/70 to-slate-950 border-white/10',
            },
          ],
        },
      },

      config: {
        variant: 'blog',
        size: 'lg',
      },

      collections: {
        pages: true,

        posts: {
          code: {
            langs: [...DEFAULT_CODE_LANGS, 'latex', 'r'],
            lineNumbers: true,
          },

          themes: {
            card: {
              extendDefaults: true,
              items: [
                {
                  name: 'postHeroCard',
                  classes:
                    'bg-gradient-to-br from-cyan-950/60 to-slate-950 border-white/10',
                },
              ],
            },
          },

          config: {
            className: '[&_li::marker]:!text-cyan-200/90',
          },
        },
      },
    }),
  ],
}
```

---

## Editor experience

The editor is built on CodeMirror and includes:

- Markdown syntax highlighting
- directive autocomplete
- directive snippets
- snippet placeholders/tabstops
- theme-aware attribute suggestions
- lightweight diagnostics for malformed directives
- warnings for unknown directives, invalid variants, invalid themes, malformed attrs, and common structural issues

The goal is simple: author Markdown like text, but get enough tooling that complex docs stay pleasant.

---

## Tailwind setup

For best rendering defaults, enable Tailwind Typography and scan the plugin output:

```bash
pnpm add @tailwindcss/typography
```

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Ensure Tailwind scans plugin output */
@source "../node_modules/@valkyrianlabs/payload-markdown/dist";
```

Theme class strings defined in your app config should also live in scanned source files.

Runtime arbitrary Tailwind classes inside CMS-authored Markdown are not the recommended styling path. Use directive `theme="..."` values and configure named themes in source.

---

## Real examples

### Layout directives in practice

![blocks demo](https://docs-media.valkyrianlabs.com/payload-markdown%20v1.0.0%20blocks%20demo.png)

Plain Markdown can define real layout structure:

- sections
- columns
- cards
- steps
- tabs
- callouts
- details
- tables of contents

No builder UI.  
No hidden schema.  
No frontend duct tape.

---

### Code blocks in practice

![code blocks demo](https://docs-media.valkyrianlabs.com/payload-markdown%20v1%20code%20blocks%20demo.png)

Production-ready code rendering with clean defaults:

- Shiki syntax highlighting
- line numbers
- copy buttons
- centralized panel styling
- configurable language loading
- server-first output

---

## Philosophy

- Markdown should stay the source of truth
- content should remain portable
- structure should be readable in plain text
- rich layouts should not require a page builder
- defaults should look good without locking you in
- styling should be centralized, themeable, and overridable
- the renderer should respect its container
- AI and human editors should both be able to work with the content

If that aligns with how you build, this will feel right.
