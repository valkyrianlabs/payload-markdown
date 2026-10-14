<!--
vl-release staged release notes: the user-facing story of the NEXT release.
Maintained continuously while working; `vlr prepare` promotes it into the release notes
history (and the GitHub release) and resets this file to this template.

Format: the first line is "# <release title>" WITHOUT a version number (vlr adds it).
Everything after the title is the Markdown release body. Describe the resulting behavior
for users and operators; keep it representative of what actually ships.
-->
# Colour palettes for icons and directives

### Colour each icon by name

Palettes are named colour themes that markdown references directly. Each entry of an `icon` list can carry its own palette, so a card can show Debian red next to Ubuntu orange without site CSS:

```md
:::card[Linux]{icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu" theme="glass"}
Debian and Ubuntu support.
:::
```

The palette travels with the icon: reordering the list never swaps colours, and the same icon can appear twice in different colours. `iconPalette="name"` sets a default for a directive's other icons, and `palette="name"` recolours the surface, border and links of a card, cards grid, callout, button, details, section, steps or tabs (and its icons), on top of the structural `theme`.

- **Real SVG paint:** brand icons that set no fill (Font Awesome brands) take the palette colour instead of rendering black; duotone icons get separate primary and secondary colours (`color`, `secondaryColor`, `secondaryOpacity`); icons with explicit colours are recoloured only when a palette is applied.
- **Light and dark:** palettes take optional `dark` colours and follow the same colour-scheme switch as the directive defaults.
- **Built in:** every Tailwind hue (`red`, `orange`, `amber`, `emerald`, `teal`, `sky`, `violet`, `slate`, …) works without setup.
- **Safe values:** colours must be hex, a numeric colour function, a CSS colour name, `currentColor`, `transparent` or `var(--token)`; anything else is rejected, so palettes cannot inject CSS.
- Markdown without palettes renders exactly as before.

### Manage palettes without code changes

`payloadMarkdown({ palettes: [...] })` (and per collection, or per render) defines palettes in code. Set `appearance: true` to add the **Markdown Appearance** global, where editors create and edit palettes in the admin, with colour swatches, and markdown picks them up live: no CSS, config change or rebuild. Rendering reads the global at most once per `cacheTtl` (30 s) per server process, never per icon; a save refreshes that process's cache and revalidates statically rendered Next.js pages. If the global cannot be read, renders keep the last palettes loaded and retry shortly. Concurrent palette saves from MCP re-read the global so they do not overwrite each other.

Enabling `appearance` adds a global: regenerate the import map, and on a SQL database create and run a migration. Until then renders use the configured palettes and log one warning.

### MCP and editor support

- New MCP tools `markdownPalettes`, `markdownPaletteSave` and `markdownPaletteDelete`. Writes need the API key's `Update` permission on the global (expose it with `globals: { 'markdown-appearance': { enabled: true } }` in `withPayloadMarkdownMcp`) and pass Payload access control. Saves validate every colour and return advisory contrast notes.
- `markdownGuide` lists every palette with its colours, and `markdownValidate` reports unknown palettes.
- The markdown editor completes palette names (after `palette=`, `iconPalette=` and inside icon lists) and warns about unknown palettes and icon options, including palettes created in the admin after the app was built.
- `renderMarkdown(markdown, { settings: payload })` includes admin palettes too, and `loadMarkdownPalettes(payload)` returns them (cached) for other uses.

### Fixes

- Icon-only buttons now get the `pmd-button--icon-only` class, so they render square as intended in 1.8.0 (the class was dropped while rendering).
- The table of contents has a little more space below its list.
- A callout or button `icon` list with more than one entry now reports that only the first icon is shown, instead of dropping the rest silently.
