---
name: payload-markdown
description: Write elegant automated documentation with payload-markdown. Use when Codex needs to author, rewrite, audit, or structure docs using Payload Markdown directives, theme names, cards, callouts, steps, tabs, TOCs, buttons, badges, and layout primitives.
---

# Payload Markdown

Use this skill to write documentation that renders well with `payload-markdown` (also published as `@valkyrianlabs/payload-markdown`; same package and version, so use whichever name the project installed in imports), especially docs generated or maintained by agents for downstream `@valkyrianlabs/payload-markdown-docs` projects.

This skill is about authoring clean Markdown content with Payload Markdown directives, in files or live in a Payload app over MCP. It is not a Payload CMS implementation guide.

## Keep This Skill Current

This skill ships with `payload-markdown` (the Codex variant, installed at `.agents/skills/payload-markdown`). `skill.json` next to this file records the package version it came from and a `sha256` of the skill files.

Check for drift before relying on it:

- With shell access in a project that depends on the package, run `npx payload-markdown skill check`.
- When the `markdownGuide` tool is available, compare the skill `sha256` it lists for `codex` with `sha256` in `skill.json`.

If they differ, or `skill.json` is missing, tell the user the skill is out of date and suggest `npx payload-markdown skill install`, then re-read this skill after it is updated. The installer refuses to overwrite local edits unless run with `--force`.

## Workflow

1. Inspect the source of truth before writing docs: code, README, existing docs, examples, tests, public API, and current package metadata.
2. Choose a page shape: overview, installation, reference, migration, troubleshooting, release notes, or API guide.
3. Use normal Markdown for prose and use directives only where they improve scanning, sequencing, comparison, or calls to action.
4. Prefer readable directive labels such as `[Install]` over legacy `title=""`.
5. Keep examples copyable. Use long fences when documenting Markdown that contains code fences.
6. Run `scripts/check_payload_markdown_doc.py` on changed docs before finishing.

## Live Content Over MCP

When the `markdownGuide`, `markdownRead`, `markdownValidate`, `markdownWrite` and `markdownPublish` tools are available, edit Payload content directly: guide → read → validate until `ok` → write a draft with `ifUpdatedAt` → share the preview → publish only when asked. Read `reference/mcp-content-workflow.md` first.

Quick setup when the tools are missing: the app registers `@payloadcms/plugin-mcp` with `withPayloadMarkdownMcp()` from `payload-markdown/mcp`, the user creates a key in the admin (**MCP → API Keys**), and the MCP client connects to `<app URL>/api/mcp` (Streamable HTTP) with the header `Authorization: Bearer <key>`.

## Reference Map

- Read `reference/automated-docs-workflow.md` for source-driven docs generation and audit flow.
- Read `reference/formatting.md` for frontmatter, headings, links, prose, and fenced examples.
- Read `reference/payload-markdown-directives.md` for supported directive syntax and recipes.
- Read `reference/quality.md` before final review or docs drift audits.
- Read `reference/mcp-content-workflow.md` before editing live content through the MCP tools.
- `reference/directive-spec.json` is the machine-readable directive spec generated from the renderer: directive names, open and close markers, attributes with types and allowed values, theme groups, badge types and targets, and parser constraints. Prefer it over memory when unsure whether an attribute or value exists.

## Authoring Defaults

- Use exactly one H1 per page.
- Put `:::toc[On this page]{depth="3" theme="compact"}` after the intro on long pages.
- Use `:::callout` for important notes, warnings, tips, and migration hazards.
- Use `:::steps` for setup, tutorials, and workflows.
- Use `:::cards` and `:::card` for page maps, feature groups, related links, and summary grids.
- Use `::badge` and `:::badges` for Shields badges when package, build, release, license, or status metadata helps orient the page.
- Use `:::tabs` only for truly parallel alternatives such as package managers or framework variants.
- Use `:::details` for optional caveats, migration notes, or advanced branches.
- Use `:::section`, `:::2col`, `:::3col`, and `:::cell` sparingly for dense landing-style docs sections.
- Avoid unsupported directives, MDX components, arbitrary HTML widgets, and runtime Tailwind classes in authored Markdown.

## Examples

- `examples/docs-page.md`: polished docs page with TOC, cards, steps, callouts, tabs, and details.
- `examples/reference-page.md`: API/reference style page with structured sections and warnings.
- `examples/release-notes.md`: release note page using cards, details, and migration callouts.

## Validation

Run the helper on changed Markdown files:

```bash
python3 .agents/skills/payload-markdown/scripts/check_payload_markdown_doc.py docs/**/*.md
```

The checker reads `reference/directive-spec.json` (falling back to built-in tables when it is missing) and reports unknown directives, attributes and values, text after a container marker that is not `[label]` or `{…}`, markers inside list items or blockquotes, stray closers, and unclosed containers.

If the downstream project uses `@valkyrianlabs/payload-markdown-docs`, also run its docs validation command when available.
