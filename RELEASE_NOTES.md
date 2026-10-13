# Payload Markdown release notes

<!-- vl-release:entry version=1.8.0 -->
## 1.8.0 — Light and dark directive themes, polished defaults, multi-icon cards

_Released 2026-10-13_

#### Light and dark, following your site

Directive defaults (cards, callouts, tabs, steps, details, the table of contents, buttons) now have a light and a dark palette. Before this release they were dark only, so on a light page they showed dark panels, and on a light OS setting the text inside them could turn dark on dark.

- **`colorScheme`:** a new renderer option. `auto` (default) follows Tailwind's `dark:` variant, which your app compiles, so it tracks a `.dark` class or `data-theme` attribute when you declare one with `@custom-variant dark`, and the OS preference otherwise. `light` and `dark` pin the palette; use `dark` for a site that is always dark. It can be set in plugin, collection, or scope config, or on `MarkdownRenderer`.
- **Design tokens:** every directive colour reads a public CSS custom property first, and the plugin never sets them, so your value always wins: `--pmd-surface`, `--pmd-surface-muted`, `--pmd-border`, `--pmd-accent`, `--pmd-accent-hover`, `--pmd-code-bg`.
- **Your design system:** when those tokens are unset, surfaces and borders use your Tailwind theme's `--color-card` and `--color-border` if it defines them, so directives match a shadcn-style app's cards.
- **Dark sites:** the dark palette is unchanged. Output rendered without `MarkdownRenderer` keeps it unless a container applies `PMD_COLOR_SCHEME_CLASS_NAMES` from `payload-markdown/render`.
- **Contrast:** the text in each directive's defaults (titles, bodies, links, captions, tab labels, buttons) is checked against WCAG AA in both schemes by the browser test suite. Primary buttons move to a slightly deeper cyan so white labels pass AA; small captions (eyebrows, the TOC title) derive from the body text colour so they stay legible on tinted surfaces.

#### Consumer classes win over conflicting defaults

`className` and `wrapperClassName` are merged over the renderer defaults: a class that sets the same utility as a default replaces it, so `prose-a:font-bold` reliably beats the default `prose-a:font-medium`. Before, two classes of equal specificity resolved by stylesheet order, and an override could silently lose. Variant presets now reliably override the base defaults the same way (for example `compact` line height).

#### Grids follow their container

`columns` on `:::cards`, step grids, and `:::2col`/`:::3col` is now a maximum: a grid fits as many columns as its own width allows, instead of switching at viewport breakpoints. `columns="4"` shows four cards across a wide layout, steps down to three or two in a content column or sidebar, and one on a phone.

#### Bash highlighting

`bash` is in the default languages, so fences tagged `bash`, `sh`, `shell`, `zsh`, or `shellscript` are highlighted without extra config.

#### Directive content matches the page

Markdown inside cards, callouts, details, tabs, and steps now renders with the same typography as the rest of the document. Before this release, those bodies dropped Tailwind Typography: lists lost their bullets, links were unstyled, inline code had no chip, tables and quotes collapsed into plain text, and body text and code were larger than on the page. Directive chrome (card titles, eyebrows, tab triggers, step numbers, the table of contents) stays `not-prose`. Your typography overrides in `config.className` now reach directive bodies too.

#### Sharper defaults across directives

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

#### Typography, code, and mobile

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

#### Fixes

- `cellTheme` on `:::2col` and `:::3col` now applies to generated cells and to explicit cells without their own theme.
- Static shields.io badges whose label or message contains a hyphen no longer return "badge not found".
- Tabs nested inside a tab panel no longer switch each other's panels.
- A badge `path` copied from shields.io already percent-encoded (`coverage-95%25-green`) is no longer encoded twice into `95%2525`. Raw and encoded paths render the same badge.

#### Multiple icons on a card

`icon` on `:::card` accepts a comma-separated list, shown as a row of icons:

```md
:::card[Linux]{eyebrow="amd64 · Debian & Ubuntu" icon="@fa-brands/debian, @fa-brands/ubuntu"}
...
:::
```

#### Upgrade notes

Rendered HTML changed. Directive containers no longer carry `not-prose`. Directive colours are now `color-mix()` expressions over the `--pmd-*` tokens, and the renderer root carries the colour scheme classes. Bodies are prose and tagged `data-directive-body`. Tables are wrapped in a `div.pmd-table`. Card icons are wrapped in a `div.pmd-card__icons`. TOC entries carry `data-toc-level`. Custom CSS that targets those structures may need a look. If you rebuild your Tailwind CSS from the package `dist` as documented, the new classes are picked up automatically.

If your site switches themes with a class or attribute and has not declared `@custom-variant dark`, add it: without it, `auto` follows the visitor's OS setting rather than your switcher. A site that is always dark can set `colorScheme: 'dark'` instead.

<!-- vl-release:entry version=1.7.2 -->
## 1.7.2 — Install as payload-markdown, plus an agent skill installer

_Released 2026-10-08_

### `pnpm add payload-markdown`

The plugin is now also published under the short name `payload-markdown`:

```bash
pnpm add payload-markdown
```

`@valkyrianlabs/payload-markdown` stays fully supported, and nothing changes for apps that use it. Both names come from the same build and are released together at the same version, with identical files. The only differences are the package name and the name Payload's admin import map uses for the plugin's components, which follows whichever name you installed. Import from the name you installed (`payload-markdown/server`, `payload-markdown/mcp`, and so on) and install only one of them.

Switching an existing app to the short name: replace the dependency and the imports, point Tailwind's `@source` at `node_modules/payload-markdown/dist`, and run `payload generate:importmap`.

The duplicate-copies warning now reads `Duplicate copies of payload-markdown are loaded`, and also fires when both names are installed in one app.


### Install the agent skill with one command

The Claude Code and Codex skill that ships with the package now has an installer:

```bash
npx payload-markdown skill install
```

It installs the skill at `.claude/skills/payload-markdown` (Claude Code) and/or `.agents/skills/payload-markdown` (Codex). It picks the agents your project uses, updates copies that are already installed, and refuses to overwrite local edits or an unrelated directory unless you pass `--force`. Use `--agent claude|codex|all` and `--dir <path>` to choose. Run it again after upgrading the package.

### Know when the skill is stale

- Each skill now has a `skill.json` with the package version and a `sha256` of its files.
- `npx payload-markdown skill check` exits non-zero when an installed skill is outdated, unversioned (copied by hand before this release) or edited locally, so CI can flag drift.
- `markdownGuide` now lists the package version and the current skill hashes. The skill tells agents to compare them, or to run `skill check`, and to suggest an update when they differ.

Copies installed by hand with `cp -r` have no `skill.json` and report as unversioned; run `npx payload-markdown skill install` once to replace them.

The skill's own validation commands now point at the installed location (`.claude/skills/payload-markdown/scripts/…` or `.agents/skills/payload-markdown/scripts/…`).

### About 1.7.1

- `v1.7.1` was tagged, but its release stopped part-way: only `payload-markdown@1.7.1` reached npm while the new package name was being set up, and `@valkyrianlabs/payload-markdown` stayed at 1.7.0.
- 1.7.2 contains the same changes and is the first release published under both names at once. Install 1.7.2 or later.

<!-- vl-release:entry version=1.7.0 -->
## 1.7.0 — AI Agents Manage Your Content over MCP

_Released 2026-10-05_

Connect Claude, Cursor or any MCP client to your Payload app and ask for content changes in plain language. Agents read your pages, write payload-markdown with the directives, themes, icons and code languages your site actually has, validate it with your renderer, and save drafts for you to review.

### AI agents over MCP

- New `@valkyrianlabs/payload-markdown/mcp` export for Payload's official `@payloadcms/plugin-mcp`: wrap its options in `withPayloadMarkdownMcp()` to register `markdownGuide`, `markdownRead`, `markdownValidate`, `markdownWrite`, `markdownPublish` and the `markdownEditDocument` prompt.
- Writes are validated with the site renderer first, saved as drafts by default, address markdown blocks by id, support inserting and removing blocks, and refuse stale or locked documents.
- Tools run as the API key's user under Payload access control and honor the key's per-collection `Find` / `Update` permissions.
- The same operations are exported as plain functions for custom agents and in-admin chats.
- The agent skill gained an MCP content workflow and a short setup note.

See the new AI Agents section of the docs to set it up in four steps.

### Upgrading

- `zod` is now a dependency (`^3.25.0 || ^4.0.0`).
- Adding `mcpPlugin` to a config that relies on Payload's implicit `users` collection requires defining `users` explicitly (see Troubleshooting).

### Releases

Releases are now cut with vl-release: the npm tarball, release notes and `SHA256SUMS` are attached to each GitHub release, and the published package is the exact, validated tarball.
