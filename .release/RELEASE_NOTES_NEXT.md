<!--
vl-release staged release notes: the user-facing story of the NEXT release.
Maintained continuously while working; `vlr prepare` promotes it into the release notes
history (and the GitHub release) and resets this file to this template.

Format: the first line is "# <release title>" WITHOUT a version number (vlr adds it).
Everything after the title is the Markdown release body. Describe the resulting behavior
for users and operators; keep it representative of what actually ships.
-->
# Light and dark directive themes, polished defaults, multi-icon cards

### Light and dark, following your site

Directive defaults (cards, callouts, tabs, steps, details, the table of contents, buttons) now have a light and a dark palette. Before this release they were dark only, so on a light page they showed dark panels, and on a light OS setting the text inside them could turn dark on dark.

- **`colorScheme`:** a new renderer option. `auto` (default) follows Tailwind's `dark:` variant, which your app compiles, so it tracks a `.dark` class or `data-theme` attribute when you declare one with `@custom-variant dark`, and the OS preference otherwise. `light` and `dark` pin the palette; use `dark` for a site that is always dark. It can be set in plugin, collection, or scope config, or on `MarkdownRenderer`.
- **Design tokens:** every directive colour reads a public CSS custom property first, and the plugin never sets them, so your value always wins: `--pmd-surface`, `--pmd-surface-muted`, `--pmd-border`, `--pmd-accent`, `--pmd-accent-hover`, `--pmd-code-bg`.
- **Your design system:** when those tokens are unset, surfaces and borders use your Tailwind theme's `--color-card` and `--color-border` if it defines them, so directives match a shadcn-style app's cards.
- **Dark sites:** the dark palette is unchanged. Output rendered without `MarkdownRenderer` keeps it unless a container applies `PMD_COLOR_SCHEME_CLASS_NAMES` from `payload-markdown/render`.
- **Contrast:** the text in each directive's defaults (titles, bodies, links, captions, tab labels, buttons) is checked against WCAG AA in both schemes by the browser test suite. Primary buttons move to a slightly deeper cyan so white labels pass AA; small captions (eyebrows, the TOC title) derive from the body text colour so they stay legible on tinted surfaces.

### Consumer classes win over conflicting defaults

`className` and `wrapperClassName` are merged over the renderer defaults: a class that sets the same utility as a default replaces it, so `prose-a:font-bold` reliably beats the default `prose-a:font-medium`. Before, two classes of equal specificity resolved by stylesheet order, and an override could silently lose. Variant presets now reliably override the base defaults the same way (for example `compact` line height).

### Grids follow their container

`columns` on `:::cards`, step grids, and `:::2col`/`:::3col` is now a maximum: a grid fits as many columns as its own width allows, instead of switching at viewport breakpoints. `columns="4"` shows four cards across a wide layout, steps down to three or two in a content column or sidebar, and one on a phone.

### Bash highlighting

`bash` is in the default languages, so fences tagged `bash`, `sh`, `shell`, `zsh`, or `shellscript` are highlighted without extra config.

### Directive content matches the page

Markdown inside cards, callouts, details, tabs, and steps now renders with the same typography as the rest of the document. Before this release, those bodies dropped Tailwind Typography: lists lost their bullets, links were unstyled, inline code had no chip, tables and quotes collapsed into plain text, and body text and code were larger than on the page. Directive chrome (card titles, eyebrows, tab triggers, step numbers, the table of contents) stays `not-prose`. Your typography overrides in `config.className` now reach directive bodies too.

### Sharper defaults across directives

- **Cards:** titles use the heading colour and eyebrows a muted body colour. Linked cards brighten their border and title on hover. Title links show hover and focus states. Section-wide links get a rounded focus ring. A standalone card gets vertical margin.
- **Card icons:** spaced clear of the eyebrow, 16px below it and 12px above the title.
- **Colour card themes:** `cyan`, `violet`, `emerald`, `amber`, and `danger` get a tinted border and a stronger tint, so they are distinguishable.
- **Callouts:** each variant has a tinted edge and a coloured title and icon. The `soft`, `solid`, and `glass` themes look distinct again; the variant tint used to override the theme background. **`tip` callouts are now violet**, so they no longer match `info`. An icon on a wrapped title aligns with the first line, and an icon with no title sits beside the body.
- **Tabs:**
  - Inactive, hover, active, focus, and disabled triggers are visibly different. Before, they shared one colour, and disabled tabs looked enabled.
  - A panel holding only a code block shows just the code block.
  - `underline` and `pills` restyle the triggers as their names suggest.
- **Steps:**
  - Default steps have even spacing and styled step titles.
  - Step cards are no longer indented or offset by list styles.
  - Step cards in a grid stretch to the row height.
- **Table of contents:** the title reads as a label, entries indent by heading level, and links have a hover state.
- **Details:** the summary has a hover state, and a long summary wraps under its own text.
- **Sections and cells:** no extra space above the first child or below the last. Cells use normal margins instead of a flex gap.

### Typography, code, and mobile

- **Colours:** the base classes no longer depend on app tokens such as `text-foreground` or `border-border`. Those generated no CSS in apps without them, which left table rules bright white. Colours now come from Tailwind Typography's variables, with the neutral palette.
- **Tables:** honour GFM column alignment and scroll inside their own container on small screens.
- **Inline content:** images inside a sentence, such as a badge row, stay inline. Long inline code wraps.
- **Lists and quotes:**
  - List items match paragraph size in the `blog` and `compact` variants.
  - Ordered list numbers no longer hang outside the column.
  - Blockquotes drop the automatic curly quotes.
- **Footnotes and headings:** the generated "Footnotes" heading is visually hidden, and `h5`/`h6` use the heading colour.
- **Code blocks:** the copy button and line numbers stay in place when a long line scrolls. On pointer devices, the copy button appears on hover.
- **Code background:** set by the new `--pmd-code-bg` custom property. Code nested in a directive reads as a slightly darker well.
- **Buttons:** link buttons drop their side padding. Icon-only buttons are square and don't stretch on mobile. Wrapped labels are centred and readable.
- **Badges:** a `wrap="false"` badge row scrolls instead of widening the page.

### Fixes

- `cellTheme` on `:::2col` and `:::3col` now applies to generated cells and to explicit cells without their own theme.
- Static shields.io badges whose label or message contains a hyphen no longer return "badge not found".
- Tabs nested inside a tab panel no longer switch each other's panels.
- A badge `path` copied from shields.io already percent-encoded (`coverage-95%25-green`) is no longer encoded twice into `95%2525`. Raw and encoded paths render the same badge.

### Multiple icons on a card

`icon` on `:::card` accepts a comma-separated list, shown as a row of icons:

```md
:::card[Linux]{eyebrow="amd64 · Debian & Ubuntu" icon="@fa-brands/debian, @fa-brands/ubuntu"}
...
:::
```

### Upgrade notes

Rendered HTML changed. Directive containers no longer carry `not-prose`. Directive colours are now `color-mix()` expressions over the `--pmd-*` tokens, and the renderer root carries the colour scheme classes. Bodies are prose and tagged `data-directive-body`. Tables are wrapped in a `div.pmd-table`. Card icons are wrapped in a `div.pmd-card__icons`. TOC entries carry `data-toc-level`. Custom CSS that targets those structures may need a look. If you rebuild your Tailwind CSS from the package `dist` as documented, the new classes are picked up automatically.

If your site switches themes with a class or attribute and has not declared `@custom-variant dark`, add it: without it, `auto` follows the visitor's OS setting rather than your switcher. A site that is always dark can set `colorScheme: 'dark'` instead.
