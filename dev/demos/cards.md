# Cards

Card grids (`:::cards`) and individual cards (`:::card`): every column count, every grid theme, every card theme, header combinations (eyebrow, icon, title), link scopes, and nested content.

## Columns

### Cards: columns="1"

:::cards{columns="1"}

:::card[Card 1]
Card 1 of 2 in a `columns="1"` grid.
:::

:::card[Card 2]
Card 2 of 2 in a `columns="1"` grid.
:::

:::

### Cards: columns="2"

:::cards{columns="2"}

:::card[Card 1]
Card 1 of 4 in a `columns="2"` grid.
:::

:::card[Card 2]
Card 2 of 4 in a `columns="2"` grid.
:::

:::card[Card 3]
Card 3 of 4 in a `columns="2"` grid.
:::

:::card[Card 4]
Card 4 of 4 in a `columns="2"` grid.
:::

:::

### Cards: columns="3"

:::cards{columns="3"}

:::card[Card 1]
Card 1 of 6 in a `columns="3"` grid.
:::

:::card[Card 2]
Card 2 of 6 in a `columns="3"` grid.
:::

:::card[Card 3]
Card 3 of 6 in a `columns="3"` grid.
:::

:::card[Card 4]
Card 4 of 6 in a `columns="3"` grid.
:::

:::card[Card 5]
Card 5 of 6 in a `columns="3"` grid.
:::

:::card[Card 6]
Card 6 of 6 in a `columns="3"` grid.
:::

:::

### Cards: columns="4"

:::cards{columns="4"}

:::card[Card 1]
Card 1 of 8 in a `columns="4"` grid.
:::

:::card[Card 2]
Card 2 of 8 in a `columns="4"` grid.
:::

:::card[Card 3]
Card 3 of 8 in a `columns="4"` grid.
:::

:::card[Card 4]
Card 4 of 8 in a `columns="4"` grid.
:::

:::card[Card 5]
Card 5 of 8 in a `columns="4"` grid.
:::

:::card[Card 6]
Card 6 of 8 in a `columns="4"` grid.
:::

:::card[Card 7]
Card 7 of 8 in a `columns="4"` grid.
:::

:::card[Card 8]
Card 8 of 8 in a `columns="4"` grid.
:::

:::

### Cards: columns="auto"

:::cards{columns="auto"}

:::card[Card 1]
Card 1 of 5 in a `columns="auto"` grid.
:::

:::card[Card 2]
Card 2 of 5 in a `columns="auto"` grid.
:::

:::card[Card 3]
Card 3 of 5 in a `columns="auto"` grid.
:::

:::card[Card 4]
Card 4 of 5 in a `columns="auto"` grid.
:::

:::card[Card 5]
Card 5 of 5 in a `columns="auto"` grid.
:::

:::

### Cards: default columns (no attribute, renders 3)

:::cards

:::card[Default 1]
No `columns` attribute.
:::

:::card[Default 2]
No `columns` attribute.
:::

:::card[Default 3]
No `columns` attribute.
:::

:::

## Grid Themes

### Cards: theme="default"

:::cards{
  columns="3"
  theme="default"
}

:::card[default 1]
Grid gap and outer margin come from the `default` cards theme.
:::

:::card[default 2]
Grid gap and outer margin come from the `default` cards theme.
:::

:::card[default 3]
Grid gap and outer margin come from the `default` cards theme.
:::

:::

### Cards: theme="compact"

:::cards{
  columns="3"
  theme="compact"
}

:::card[compact 1]
Grid gap and outer margin come from the `compact` cards theme.
:::

:::card[compact 2]
Grid gap and outer margin come from the `compact` cards theme.
:::

:::card[compact 3]
Grid gap and outer margin come from the `compact` cards theme.
:::

:::

### Cards: theme="spacious"

:::cards{
  columns="3"
  theme="spacious"
}

:::card[spacious 1]
Grid gap and outer margin come from the `spacious` cards theme.
:::

:::card[spacious 2]
Grid gap and outer margin come from the `spacious` cards theme.
:::

:::card[spacious 3]
Grid gap and outer margin come from the `spacious` cards theme.
:::

:::

### Cards: theme="feature-grid"

:::cards{
  columns="3"
  theme="feature-grid"
}

:::card[feature-grid 1]
Grid gap and outer margin come from the `feature-grid` cards theme.
:::

:::card[feature-grid 2]
Grid gap and outer margin come from the `feature-grid` cards theme.
:::

:::card[feature-grid 3]
Grid gap and outer margin come from the `feature-grid` cards theme.
:::

:::

## Card Themes

### Cards: one card per theme

:::cards{columns="4"}

:::card[Theme: default]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="default"
}
This card uses `theme="default"`.
:::

:::card[Theme: muted]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="muted"
}
This card uses `theme="muted"`.
:::

:::card[Theme: glass]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="glass"
}
This card uses `theme="glass"`.
:::

:::card[Theme: cyan]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="cyan"
}
This card uses `theme="cyan"`.
:::

:::card[Theme: violet]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="violet"
}
This card uses `theme="violet"`.
:::

:::card[Theme: emerald]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="emerald"
}
This card uses `theme="emerald"`.
:::

:::card[Theme: amber]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="amber"
}
This card uses `theme="amber"`.
:::

:::card[Theme: danger]{
  eyebrow="Card theme"
  icon="@fa-duotone/server"
  theme="danger"
}
This card uses `theme="danger"`.
:::

:::

### Cards: cardTheme="default" inherited by children

:::cards{
  columns="2"
  cardTheme="default"
}

:::card[Inherits default]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="default"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="muted" inherited by children

:::cards{
  columns="2"
  cardTheme="muted"
}

:::card[Inherits muted]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="muted"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="glass" inherited by children

:::cards{
  columns="2"
  cardTheme="glass"
}

:::card[Inherits glass]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="glass"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="cyan" inherited by children

:::cards{
  columns="2"
  cardTheme="cyan"
}

:::card[Inherits cyan]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="cyan"` from the grid.
:::

:::card[Overrides with violet]{theme="violet"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="violet" inherited by children

:::cards{
  columns="2"
  cardTheme="violet"
}

:::card[Inherits violet]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="violet"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="emerald" inherited by children

:::cards{
  columns="2"
  cardTheme="emerald"
}

:::card[Inherits emerald]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="emerald"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="amber" inherited by children

:::cards{
  columns="2"
  cardTheme="amber"
}

:::card[Inherits amber]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="amber"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

### Cards: cardTheme="danger" inherited by children

:::cards{
  columns="2"
  cardTheme="danger"
}

:::card[Inherits danger]{eyebrow="Inherited"}
No `theme` on this card, so it takes `cardTheme="danger"` from the grid.
:::

:::card[Overrides with cyan]{theme="cyan"}
A child `theme` overrides the parent `cardTheme`.
:::

:::

## Header Combinations

### Card: title only

:::cards{columns="3"}

:::card[Title only]
Body text under a plain title.
:::

:::card[Eyebrow + title]{eyebrow="Eyebrow"}
Body text under an eyebrow and a title.
:::

:::card[Icon + title]{icon="@fa-duotone/server"}
Body text under an icon and a title.
:::

:::card[Icon + eyebrow + title]{
  eyebrow="Eyebrow"
  icon="@fa-duotone/laptop"
}
Body text under an eyebrow, an icon, and a title.
:::

:::card{icon="@fa-duotone/server"}
Icon only, no title and no eyebrow.
:::

:::card{eyebrow="Eyebrow only"}
Eyebrow only, no title and no icon.
:::

:::card{
  eyebrow="Eyebrow"
  icon="@fa-duotone/laptop"
}
Icon and eyebrow, no title.
:::

:::card
Title-less card with only body text.
:::

:::

### Card: legacy title attribute

:::card{
  title="Title from the title attribute"
  eyebrow="Legacy"
}
The older `title=""` form still renders a card title.
:::

### Card: long title that wraps

:::cards{columns="3"}

:::card[A deliberately long card title that wraps across several lines in a narrow column]{
  eyebrow="Long title"
  icon="@fa-duotone/server"
}
Check the title line height and the gap to the body.
:::

:::card[Short]{
  eyebrow="Short title"
  icon="@fa-duotone/laptop"
}
A neighbour with a short title.
:::

:::card[Medium length title]{eyebrow="A long eyebrow label that may wrap too"}
A neighbour with a long eyebrow.
:::

:::

### Cards: multiple icons (comma-separated)

:::cards{columns="2"}

:::card[Linux]{eyebrow="amd64 · Debian & Ubuntu" icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu" href="/docs/linux"}
The production platform: a signed APT repository, systemd services and a native FUSE mount at `/mnt/vaulthalla`.
:::

:::card[macOS]{eyebrow="New · Apple Silicon · macOS 14+" icon="@fa-duotone/laptop" href="/docs/macos"}
One Homebrew command or a self-contained installer that brings its own PostgreSQL and Caddy.
:::

:::

## Body Content

### Cards: unequal body lengths side by side

:::cards{columns="3"}

:::card[Short body]{icon="@fa-duotone/server"}
One line.
:::

:::card[Medium body]{icon="@fa-duotone/laptop"}
A couple of sentences of body text. Enough to wrap onto a few lines in a three-column grid.
:::

:::card[Long body]{icon="@fa-duotone/server"}
A much longer body that runs on for several sentences so this card is noticeably taller than its neighbours. Grid rows stretch cards to equal height by default, so the short cards should fill the row without their content floating in the middle. This also shows whether the bottom padding stays consistent when one card dictates the row height.
:::

:::

### Card: long body with multiple paragraphs

:::card[Long body]{
  eyebrow="Article"
  icon="@fa-duotone/laptop"
}
The first paragraph of a long card body. Cards are often used as summaries, but sometimes authors put real content in them, so paragraph spacing inside a card matters.

The second paragraph continues with **bold**, *italic*, `inline code`, and a [link](/posts).

The third paragraph closes the card.
:::

### Card: list and code inside

:::cards{columns="2"}

:::card[List inside]{
  eyebrow="Checklist"
  icon="@fa-duotone/server"
}
Before deploying:

- Run the test suite
- Build the package
  - Check the bundle size
- Tag the release

1. Ordered one
2. Ordered two

:::

:::card[Code inside]{
  eyebrow="Config"
  icon="@fa-duotone/laptop"
}
Register the plugin:

```ts
payloadMarkdown({
  collections: {
    posts: true,
  },
})
```

Then restart the dev server.
:::

:::

### Card: nested callout, details, and buttons

:::card[Nested directives]{
  eyebrow="Composition"
  icon="@fa-duotone/server"
}
:::callout[Inside a card]{variant="tip"}
A callout nested in a card.
:::

:::details[Details inside a card]
Native disclosure inside a card body.
:::

:::buttons
::button[Primary]{href="/posts"}
::button[Secondary]{
  href="/posts"
  variant="secondary"
}
:::
:::

## Links

### Card: href with default linkScope (full card link)

:::cards{columns="3"}

:::card[Full card link]{
  href="/posts"
  icon="@fa-duotone/server"
}
The whole card is clickable. Hover anywhere on the card.
:::

:::card[Explicit linkScope="full"]{
  href="/posts"
  linkScope="full"
  eyebrow="Full"
}
Same as the default when `href` is set.
:::

:::card[Title-only link]{
  href="/posts"
  linkScope="title"
  icon="@fa-duotone/laptop"
}
Only the title is a link, so this [body link](/posts) stays valid.
:::

:::

### Card: newTab

:::cards{columns="2"}

:::card[External, new tab]{
  href="https://payloadcms.com"
  newTab=true
  icon="@fa-duotone/laptop"
}
Opens in a new tab (`target="_blank"`).
:::

:::card[External title link, new tab]{
  href="https://payloadcms.com"
  linkScope="title"
  newTab="true"
  eyebrow="Title link"
}
Only the title opens in a new tab.
:::

:::

### Cards: href with linkScope="section" (default)

:::cards{
  columns="3"
  href="/posts"
}

:::card[Section link 1]
The whole grid is one link.
:::

:::card[Section link 2]
Hovering any card should hint at the same target.
:::

:::card[Section link 3]
A [body link](/) still sits above the overlay.
:::

:::

### Cards: href with linkScope="card"

:::cards{
  columns="3"
  href="/posts"
  linkScope="card"
  cardTheme="muted"
}

:::card[Inherits link 1]{icon="@fa-duotone/server"}
Each card is its own full-card link to the parent `href`.
:::

:::card[Inherits link 2]{icon="@fa-duotone/laptop"}
Same target as the first card.
:::

:::card[Overrides target]{
  href="/"
  icon="@fa-duotone/server"
}
This card overrides the parent `href`.
:::

:::

### Cards: href with linkScope="title"

:::cards{
  columns="3"
  href="/posts"
  linkScope="title"
}

:::card[Title link 1]
Titles inherit the parent link.
:::

:::card[Title link 2]
Body text stays plain.
:::

:::card[Full override]{
  href="/"
  linkScope="full"
}
This card overrides the parent default and links the full card.
:::

:::

### Cards: newTab on the grid

:::cards{
  columns="2"
  href="https://payloadcms.com"
  linkScope="card"
  newTab=true
}

:::card[New tab from parent]
Inherits `newTab` from the grid.
:::

:::card[Same tab override]{newTab="false"}
Overrides the parent with `newTab="false"`.
:::

:::

## Standalone Cards

### Card: standalone, default theme

:::card[Standalone card]{
  eyebrow="Outside a grid"
  icon="@fa-duotone/server"
}
A card rendered outside `:::cards` takes the full content width.
:::

### Card: standalone, glass with link

:::card[Standalone glass link]{
  href="/posts"
  theme="glass"
  icon="@fa-duotone/laptop"
}
A standalone full-card link in the glass theme.
:::

### Card: CTA composition (title link + buttons)

:::card[Ready to build better docs?]{
  href="/posts"
  icon="@fa-duotone/server"
  linkScope="title"
  theme="cyan"
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
  icon="@fa-duotone/laptop"
}

::button[View GitHub]{
  href="https://github.com/valkyrianlabs/payload-markdown"
  variant="secondary"
  newTab=true
}
:::

:::

## Dense Grids

### Cards: columns="auto" with uneven lengths, muted

:::cards{
  columns="auto"
  cardTheme="muted"
  theme="compact"
}

:::card[Short]
Small note.
:::

:::card[Longer]
Longer content can wrap without forcing every card into a rigid column.
:::

:::card[Longest]{icon="@fa-duotone/server"}
The longest card in this auto grid has several sentences. Auto-fit columns are at least 16rem wide, so the number of columns depends on the content width.
:::

:::card[Tiny]
Hi.
:::

:::

### Cards: feature-grid with glass cards (landing style)

:::cards{
  columns="3"
  theme="feature-grid"
  cardTheme="glass"
}

:::card[Markdown Field]{
  eyebrow="Core"
  icon="@fa-duotone/laptop"
  href="/posts"
}
Portable Markdown content with live preview.
:::

:::card[Directive Autocomplete]{
  eyebrow="Authoring"
  icon="@fa-duotone/server"
  theme="cyan"
}
Snippets, placeholders, and lightweight diagnostics.
:::

:::card[Server Rendered]{
  eyebrow="Rendering"
  icon="@fa-duotone/laptop"
}
Shiki code blocks, heading anchors, TOCs, and themed directives.
:::

:::
