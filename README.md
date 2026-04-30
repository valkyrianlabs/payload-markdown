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

## Install

`pnpm add @valkyrianlabs/payload-markdown`

---

## [📖 Explore the Docs](https://docs.valkyrianlabs.com/plugins/payload-markdown)

Full setup, directive syntax, theme configuration, code block options, editor behavior, and migration notes live in the docs.

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

`payload-markdown` renders structured Markdown directly inside the Payload admin preview, including callouts, details, TOCs, steps, cards, tabs, themes, and code blocks — without turning your content into JSON-shaped sludge.

---

## Directive system

Payload Markdown supports structured directives for real content layouts:

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

See the docs for directive syntax, supported attributes, nesting behavior, themes, and examples:

[Directive documentation →](https://docs.valkyrianlabs.com/plugins/payload-markdown/directives)

---

## Themes

Directive themes are first-class.

Themes live beside `config`, not inside it. Theme objects use `classes`, not `className`.

Default themes are included automatically. You only define custom themes when you want to extend or override the built-ins.

Themes can be configured globally or scoped per collection, then selected directly from Markdown using directive attributes.

Stable classes and data attributes are emitted for overrides, including `data-directive`, `data-theme`, and `vl-md-*` hook classes.

[Theme documentation →](https://docs.valkyrianlabs.com/plugins/payload-markdown/configuration/themes)

---

## Code config

Code block rendering has its own top-level `code` namespace.

Use it to configure Shiki languages, the Shiki theme, line numbers, enhanced rendering, and full-bleed code behavior.

Legacy `config.options` still works, but `code` is the preferred API.

Migration mapping:

- `config.options.langs` → `code.langs`
- `config.options.lineNumbers` → `code.lineNumbers`
- `config.options.theme` → `code.shikiTheme`
- `config.options.enhancedCodeBlocks` → `code.enhanced`
- `config.fullBleedCode` → `code.fullBleed`

[Code block documentation →](https://docs.valkyrianlabs.com/plugins/payload-markdown/configuration/code)

---

## Quick setup

Register the plugin in your Payload config, enable it for one or more collections, then render Markdown content with the server renderer.

The full setup guide covers:

- plugin registration
- collection configuration
- field mode
- block mode
- server rendering
- scoped config
- themes
- code block options

[Quick start →](https://docs.valkyrianlabs.com/plugins/payload-markdown/getting-started)

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

[Editor documentation →](https://docs.valkyrianlabs.com/plugins/payload-markdown/editor)

---

## Tailwind setup

For best rendering defaults, enable Tailwind Typography and scan the plugin output.

Required pieces:

- install `@tailwindcss/typography`
- enable the typography plugin
- add the plugin `dist` directory to Tailwind sources

Theme class strings defined in your app config should also live in scanned source files.

Runtime arbitrary Tailwind classes inside CMS-authored Markdown are not the recommended styling path. Use directive `theme="..."` values and configure named themes in source.

[Tailwind setup →](https://docs.valkyrianlabs.com/plugins/payload-markdown/getting-started/tailwind)

---

## Built for docs, blogs, and technical content

Use one Markdown field to author:

- release notes
- documentation pages
- technical blog posts
- plugin docs
- install guides
- API walkthroughs
- landing-page sections

The content stays readable in Git and editable in Payload.

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
