# Kitchen Sink: Payload Markdown 1.8

:::badges{gap="sm"}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"
}
::badge[license]{
  type="npm"
  target="license"
  package="@valkyrianlabs/payload-markdown"
}
::badge[build]{
  type="github"
  target="workflow"
  repo="valkyrianlabs/payload-markdown"
  workflow="deploy.yml"
  href="https://github.com/valkyrianlabs/payload-markdown/actions"
}
::badge[release]{
  type="static"
  label="release"
  message="1.8 preview"
  color="8b5cf6"
}
:::

A realistic product announcement that mixes every directive with ordinary prose, the way a real blog post or landing page would. Today we are announcing **Payload Markdown 1.8**: faster server rendering, richer directives, and an editor that finally knows what you meant to type.[^preview]

:::toc[In this announcement]{
  depth="2"
  theme="compact"
}
:::

![Release banner](https://picsum.photos/seed/pmd/1200/600)

:::section{theme="default"}

## Everything You Need To Ship Docs

Payload Markdown keeps your content as portable Markdown while the renderer handles presentation. Version 1.8 focuses on the parts authors touch every day.

:::cards{
  columns="3"
  theme="feature-grid"
  cardTheme="glass"
}

:::card[Server Rendered]{
  eyebrow="Performance"
  icon="@fa-duotone/server"
}
Directives, Shiki highlighting, and heading anchors render on the server. No client hydration beyond tabs and copy buttons.
:::

:::card[Smarter Autocomplete]{
  eyebrow="Authoring"
  icon="@fa-duotone/laptop"
  theme="cyan"
}
Snippets with placeholders, attribute value completion, and inline diagnostics in the editor.
:::

:::card[Portable Content]{
  eyebrow="Content"
  icon="@fa-duotone/server"
  href="/posts"
}
Everything stays plain Markdown. Move it to Git, another CMS, or a static site whenever you like.
:::

:::

:::

## What Changed

The headline changes in this release:

- **Card icons** now sit below an eyebrow with proper spacing.
- **Tabs** resolve `default` against labels as well as values.
- **Badges** gained curated resolvers for Debian and apt packages.
- **Diagnostics** report the exact line and column of malformed directives.

:::callout[Upgrading from 1.7]{
  variant="info"
  icon="@fa-duotone/laptop"
}
There are no breaking changes. Update the package, restart the dev server, and existing content renders exactly as before.
:::

| Area | 1.7 | 1.8 |
| :--- | :---: | ---: |
| Cold render (100 directives) | 180 ms | 95 ms |
| Bundle size (client) | 14 kB | 11 kB |
| Directive count | 15 | 16 |
| Editor diagnostics | Basic | Line and column |

## Get Started

:::tabs{
  default="pnpm"
  theme="glass"
  tabTheme="muted"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown@latest
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown@latest
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown@latest
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown@latest
```
:::

:::

:::steps{
  variant="cards"
  layout="stack"
  numbered
  stepTheme="default"
}

### Register the plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

export default buildConfig({
  plugins: [
    payloadMarkdown({
      collections: { posts: true },
    }),
  ],
})
```

### Render a post

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export default function Post({ post }) {
  return <MarkdownRenderer collectionSlug="posts" markdown={post.content} />
}
```

### Write your first directive

:::callout[Try it]{variant="tip"}
Type `:::` in the editor and pick a directive from the autocomplete list.
:::

:::

:::callout[Pass collectionSlug]{
  variant="warning"
  icon="@fa-duotone/server"
}
Collection-scoped config (code languages, themes, class names) only applies when `MarkdownRenderer` receives `collectionSlug`.
:::

## Fields Or Blocks

:::2col{cellTheme="panel"}

### Markdown Field

Use a direct Markdown field for articles, posts, docs, and release notes.

- One body per document
- Best for long-form writing

```tsx
<MarkdownRenderer collectionSlug="posts" markdown={post.content} />
```

### Markdown Block

Use the Markdown block inside a layout builder when Markdown is one section among others.

- Many blocks per page
- Per-block size and heading options

```tsx
<MarkdownBlockComponent {...block} collectionSlug="pages" />
```

:::

> "We moved four hundred docs pages from MDX to Payload Markdown in an afternoon. The source barely changed."
>
> — A happy early adopter

## Under The Hood

Rendering is a remark and rehype pipeline. Directives compile into layout tokens, are validated against the directive registry, and are themed by name, so authors never write Tailwind classes:

```ts
payloadMarkdown({
  themes: {
    callout: {
      items: [
        {
          name: 'blueprint',
          classes: 'rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-4 py-3',
        },
      ],
    },
  },
})
```

:::details[Advanced: rendering without React]{theme="glass"}
Use the headless renderer to get sanitized HTML, diagnostics, headings, plain text, and links:

```ts
import { renderMarkdown } from '@valkyrianlabs/payload-markdown/render'

const { html, diagnostics, headings } = await renderMarkdown(markdown)
```

1. Render at build time.
2. Store the HTML.
3. Serve it from a CDN.

:::

:::details[Known limitations]
- Fence meta such as titles and highlighted lines is not read.
- Directive markers must start at the beginning of a top-level line.

:::

:::callout[Removed in 2.0]{variant="danger"}
The legacy `config.options` block will be removed in 2.0. Move `langs`, `theme`, and `lineNumbers` into `code` now.
:::

## What People Are Building

:::cards{
  columns="auto"
  cardTheme="muted"
}

:::card[Developer Docs]{
  eyebrow="Docs"
  icon="@fa-duotone/laptop"
  href="/posts"
  linkScope="title"
}
Git-backed docs sites with tables of contents, steps, and tabs.
:::

:::card[Changelogs]{
  eyebrow="Releases"
  icon="@fa-duotone/server"
}
Release notes with badges, callouts, and collapsible migration notes.
:::

:::card[Landing Pages]{
  eyebrow="Marketing"
  theme="violet"
}
Sections, card grids, and call-to-action buttons without a page builder.
:::

:::card[Internal Wikis]{eyebrow="Knowledge"}
Plain Markdown that survives the next migration.
:::

:::

## Thanks

Thank you to everyone who filed issues and tested the preview builds. The full list of changes is in the release notes.

:::callout[Released]{
  variant="success"
  icon="@fa-duotone/server"
  theme="solid"
}
Payload Markdown 1.8 is available on npm today.
:::

:::card[Ready to build better docs?]{
  href="/posts"
  icon="@fa-duotone/laptop"
  linkScope="title"
  theme="glass"
}
Use rich Markdown directives, icon packs, buttons, cards, and clean autocomplete without turning docs into a page builder.

:::buttons{
  align="center"
  stack="mobile"
  gap="md"
}
::button[Get Started]{
  href="/posts"
  variant="primary"
  size="lg"
  icon="@fa-duotone/laptop"
}

::button[View on GitHub]{
  href="https://github.com/valkyrianlabs/payload-markdown"
  variant="secondary"
  size="lg"
  icon="@fa-duotone/server"
  iconPosition="right"
  newTab=true
}
:::

:::

---

*Posted by the Payload Markdown team.*

[^preview]: Version numbers and benchmarks on this page are illustrative demo content.
