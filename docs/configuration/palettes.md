---
title: Colour Palettes
navTitle: Palettes
description: Named colour themes for icons and directives, managed in code or at runtime in the admin and over MCP, without CSS or rebuilds.
order: 155
status: published
tags:
  - configuration
  - palettes
  - icons
  - themes
---

# Colour Palettes

A palette is a named set of colours. Markdown references it by name to colour an icon, or to recolour a card, callout or button. Palettes only set colours, so they combine with a directive's structural `theme` (`glass`, `muted`, `cyan`, …): the theme keeps the shape, spacing and shadow, and the palette chooses the colours.

:::toc[On this page]{depth="2" theme="compact"}
:::

## Using Palettes In Markdown

Give each icon in an `icon` list its own palette with `palette=<name>` after the icon reference:

```md
:::card[Linux]{
  icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu"
  theme="glass"
}
Debian and Ubuntu support.
:::
```

The palette belongs to the icon, not to its position: reordering the list never swaps the colours, and the same icon can appear twice with different palettes.

Other ways to use a palette:

| Where | Syntax | Effect |
| --- | --- | --- |
| One icon | `icon="@pack/name palette=ubuntu"` | Colours that icon. Works on `card`, `callout` and `button` icons. |
| A directive's icons | `iconPalette="ubuntu"` | Default for the directive's icons without their own (`card`, `cards`, `callout`, `button`). |
| A directive | `palette="teal"` | Surface, border and link accent of the directive, and the default for its icons (`card`, `cards`, `callout`, `button`, `details`, `section`, `steps`, `tabs`). |

An icon uses its own `palette=` first, then the directive's `iconPalette`, then the directive's `palette`. On `:::cards`, `palette` and `iconPalette` also apply to child cards that set neither.

Markdown without palettes renders exactly as before.

## Built-In Palettes

Every Tailwind hue is available without setup, tuned for both colour schemes: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `neutral`.

```md
:::card[Release notes]{palette="emerald" icon="@fa-duotone/rocket"}
…
:::
```

## Palette Colours

| Colour | Used for |
| --- | --- |
| `color` | Icon colour and the duotone primary layer; a button's label colour. |
| `secondaryColor` | Duotone secondary layer (default: `color`). |
| `secondaryOpacity` | Opacity of the duotone secondary layer, 0–1 (default: the icon's own, 0.4 for Font Awesome). |
| `background` | Surface of a directive that uses the palette (`--pmd-surface`); a button's fill. |
| `border` | Border of a directive that uses the palette (`--pmd-border`). |
| `accent` | Links and hovered titles inside the directive (`--pmd-accent`). |
| `dark` | Any of the colours above, for the dark scheme. Unset ones keep the light value. |

Colours must be a hex colour (`#e95420`), `rgb()` / `hsl()` / `oklch()` / `lab()` and friends with numeric arguments, a CSS colour name, `currentColor`, `transparent`, or `var(--token)` to reuse a design token from your app. Anything else is rejected wherever a palette is defined, so a palette can never inject CSS.

Light and dark values follow the same switch as the directive defaults (see [Light And Dark](/configuration/styling#light-and-dark)).

## How Icons Are Painted

Palettes colour the SVG itself, not a wrapper:

- **Monochrome icons** that draw with `currentColor` take the palette `color`.
- **Brand icons that set no fill** (Font Awesome brands, for one) get `fill="currentColor"`, so they take the palette colour instead of rendering black.
- **Duotone icons**: the layer with class `fa-secondary` (or `pmd-icon-secondary` in your own SVGs) is painted with `secondaryColor`, at the icon's own opacity unless the palette sets `secondaryOpacity`. The primary layer takes `color`.
- **Icons with explicit colours** (`fill="#…"`, `stroke`, or the same in a `style`) are recoloured to the palette when, and only when, a palette is applied. `none` and gradient references (`url(#…)`) are kept.

Icons are still sanitized as before, and painting only adds a class (`pmd-icon--palette`), a `data-pmd-palette` attribute and generated, validated `style` values.

## Palettes In Code

Define palettes for the whole site, per collection, or per render. They are added to the built-ins, and replace them by name:

```ts
payloadMarkdown({
  palettes: [
    { name: 'debian', label: 'Debian', color: '#a80030', dark: { color: '#ff5277' } },
    { name: 'ubuntu', label: 'Ubuntu', color: '#e95420' },
    { name: 'apple', label: 'Apple', color: '#555555', dark: { color: '#d4d4d8' } },
  ],
})
```

`palettes: { extendDefaults: false, items: [...] }` drops the built-ins. Collections take `palettes` too, and `MarkdownRenderer` and `renderMarkdown` accept `palettes` for one render.

## Managing Palettes Without Code

Enable the **Markdown Appearance** global to let editors and MCP agents create, edit and delete palettes at runtime, without code changes, CSS or a rebuild:

```ts
payloadMarkdown({
  appearance: true,
})
```

It adds a global (slug `markdown-appearance`) with a list of palettes, each with the colours above and colour swatches in the row label. Regenerate the import map (`payload generate:importmap`) after enabling it. On a SQL database, create and run a migration for the new global; until it exists, renders use the configured palettes and log one warning.

Options (`appearance: { … }`):

| Option | Default | Notes |
| --- | --- | --- |
| `slug` | `markdown-appearance` | Global slug. |
| `access` | any authenticated user may read and update | Payload access control for the global. Rendering reads it on the server regardless. |
| `admin` | group `Markdown` | Global admin options. |
| `cacheTtl` | `30000` | How long, in milliseconds, a server process reuses the palettes it loaded. |
| `revalidate` | `true` | After a save: `true` revalidates every Next.js route (`revalidatePath('/', 'layout')`) so statically rendered pages pick up the change; `false` skips it; a function runs instead. |

Rendering reads the global at most once per `cacheTtl` per server process, never per icon or per render. Saving clears the cache of the process that saved it at once; other processes pick the change up within `cacheTtl`.

A palette in the global replaces a built-in or configured palette with the same name. A palette passed directly to `MarkdownRenderer` or `renderMarkdown` still wins over both.

### Rendering Elsewhere

`MarkdownRenderer` loads admin palettes itself. To render with them through `renderMarkdown`, load them and pass them on:

```ts
import { loadMarkdownPalettes } from 'payload-markdown'
import { renderMarkdown } from 'payload-markdown/render'

const result = await renderMarkdown(markdown, {
  runtimePalettes: await loadMarkdownPalettes(payload),
  settings: payload,
})
```

Without Payload, `renderMarkdown` uses the built-in and configured palettes only.

### Over MCP

With `withPayloadMarkdownMcp()`, agents get `markdownPalettes`, `markdownPaletteSave` and `markdownPaletteDelete` (see [MCP Tools](/agents/mcp-tools)), and `markdownGuide` lists every palette. Expose the global to API keys so they get `Find` / `Update` checkboxes for it:

```ts
mcpPlugin(
  withPayloadMarkdownMcp({
    collections: { pages: { enabled: true } },
    globals: { 'markdown-appearance': { enabled: true } },
  }),
)
```

Saving requires the key's `Update` permission on the global and passes Payload access control as the key's user.

## Editor Support

The markdown editor completes palette names after `palette=` and `iconPalette=` (inside icon lists too) and warns about unknown palettes and icon options, using the configured palettes and, once loaded, the ones in the Markdown Appearance global.

## Example: Platform Cards Without Custom CSS

Before palettes, a site that wanted Debian red and Ubuntu orange icons in one card needed site CSS that picked icons by position, plus custom card themes:

```css
/* No longer needed */
.vl-md-card--theme-linux .pmd-card__icon:nth-child(1) { color: #a80030; }
.vl-md-card--theme-linux .pmd-card__icon:nth-child(2) { color: #e95420; }
```

With palettes, keep the card theme you already use and colour each icon by name. Create `debian`, `ubuntu` and `apple` once, in code or in the Markdown Appearance global (by hand or with `markdownPaletteSave`):

| Name | `color` | `dark.color` |
| --- | --- | --- |
| `debian` | `#a80030` | `#ff5277` |
| `ubuntu` | `#e95420` | |
| `apple` | `#555555` | `#d4d4d8` |

Then the markdown carries the colours:

```md
:::cards{columns="2"}

:::card[Linux]{
  eyebrow="amd64 · Debian & Ubuntu"
  icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu"
  href="/docs/linux"
}
The production platform: a signed APT repository, systemd services, and a native FUSE mount.
:::

:::card[macOS]{
  eyebrow="New · Apple Silicon · macOS 14+"
  icon="@fa-brands/apple palette=apple"
  href="/docs/macos"
}
One Homebrew command or a self-contained installer.
:::

:::
```

Delete the position-based CSS and the `linux` / `macos` card themes. Changing a brand colour later is an edit in the admin (or one `markdownPaletteSave` call), live without a deploy.
