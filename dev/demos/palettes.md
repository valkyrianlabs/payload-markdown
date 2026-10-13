# Palettes

Palettes are named colour themes. A directive's `theme` decides its shape; a palette only decides colours, so the two combine. This page uses the built-in hue palettes and the ones seeded into the **Markdown Appearance** global (`debian`, `ubuntu`, `apple`, `aurora`), which can be edited in the admin or by an MCP agent without a rebuild.

## Icons With Their Own Palettes

### Card: Debian red and Ubuntu orange in one icon list

:::cards{columns="2"}

:::card[Linux]{eyebrow="amd64 · Debian & Ubuntu" icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu" theme="glass"}
Each icon carries its own palette, so the order of the list never swaps the colours.
:::

:::card[Linux, reordered]{eyebrow="Same icons, other order" icon="@fa-brands/ubuntu palette=ubuntu, @fa-brands/debian palette=debian" theme="glass"}
Reordered: Ubuntu stays orange and Debian stays red.
:::

:::

### Card: Apple silver on a dark panel

:::card[macOS]{eyebrow="Apple Silicon · macOS 14+" icon="@fa-brands/apple palette=apple" theme="muted"}
`apple` is dark grey on light surfaces and silver in the dark scheme.
:::

### Card: the same icon twice, styled independently

:::card[Status]{icon="@fa-duotone/server palette=emerald, @fa-duotone/server palette=amber, @fa-duotone/server palette=red"}
Three copies of one icon, each with its own palette.
:::

## Duotone

### Card: distinct primary and secondary layers

:::card[Vault]{eyebrow="Duotone" icon="@fa-duotone/server palette=aurora, @fa-duotone/laptop palette=aurora"}
`aurora` sets `color` for the primary layer, `secondaryColor` for the secondary one, and a stronger `secondaryOpacity`.
:::

### Card: duotone without a secondary colour

:::card[Default duotone]{icon="@fa-duotone/server palette=sky"}
Without `secondaryColor` the secondary layer uses the same colour at the icon's own opacity.
:::

## Directive Palettes

### Cards: one palette for every icon in a grid

:::cards{columns="3" iconPalette="violet"}

:::card[First]{icon="@fa-duotone/server"}
Icons default to the grid's `iconPalette`.
:::

:::card[Second]{icon="@fa-duotone/laptop"}
Same palette, no repetition.
:::

:::card[Third]{icon="@fa-duotone/server palette=orange"}
An entry's own palette still wins.
:::

:::

### Card: a palette recolours the surface and its icons

:::card[Teal card]{palette="teal" icon="@fa-duotone/laptop" href="/docs/palettes"}
`palette` sets the card's background, border and link accent, and its icons follow. Here is a [link](#) in the accent colour.
:::

### Callout: the same palette on another directive

:::callout[Teal callout]{variant="note" palette="teal" icon="@fa-duotone/server"}
The palette that coloured the card recolours this callout's surface, border and icon.
:::

### Button: palettes on buttons and button icons

:::buttons
::button[Ubuntu]{href="#ubuntu" palette="orange" icon="@fa-brands/ubuntu"}
::button[Debian]{href="#debian" variant="secondary" icon="@fa-brands/debian palette=debian"}
::button{href="#apple" variant="ghost" icon="@fa-brands/apple palette=apple" ariaLabel="Apple"}
:::

### Details, tabs and steps

:::details[Pink details]{palette="pink" open="true"}
Details with a palette.
:::

:::tabs{palette="indigo"}

:::tab[First]
Tabs with a palette.
:::

:::tab[Second]
Second panel.
:::

:::

:::steps{variant="cards" layout="grid" columns="2" palette="emerald"}

### Install

Step cards pick up the palette's surface.

### Configure

Second step.

:::

## Without Palettes

### Card: unchanged icons

:::card[Plain]{icon="@fa-brands/debian, @fa-brands/ubuntu"}
No palette: the icons render exactly as before palettes existed.
:::
