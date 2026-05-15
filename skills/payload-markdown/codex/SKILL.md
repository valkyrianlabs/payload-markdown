---
name: payload-markdown
description: Write elegant automated documentation with @valkyrianlabs/payload-markdown. Use when Codex needs to author, rewrite, audit, or structure docs using Payload Markdown directives, theme names, cards, callouts, steps, tabs, TOCs, buttons, and layout primitives.
---

# Payload Markdown

Use this skill to write documentation that renders well with `@valkyrianlabs/payload-markdown`, especially docs generated or maintained by agents for downstream `@valkyrianlabs/payload-markdown-docs` projects.

This skill is about authoring clean Markdown content with Payload Markdown directives. It is not a Payload CMS implementation guide.

This package stores the Codex variant at `skills/payload-markdown/codex`. When installing into an environment that requires the skill directory name to match `name`, install or copy this subtree as `payload-markdown`.

## Workflow

1. Inspect the source of truth before writing docs: code, README, existing docs, examples, tests, public API, and current package metadata.
2. Choose a page shape: overview, installation, reference, migration, troubleshooting, release notes, or API guide.
3. Use normal Markdown for prose and use directives only where they improve scanning, sequencing, comparison, or calls to action.
4. Prefer readable directive labels such as `[Install]` over legacy `title=""`.
5. Keep examples copyable. Use long fences when documenting Markdown that contains code fences.
6. Run `scripts/check_payload_markdown_doc.py` on changed docs before finishing.

## Reference Map

- Read `reference/automated-docs-workflow.md` for source-driven docs generation and audit flow.
- Read `reference/formatting.md` for frontmatter, headings, links, prose, and fenced examples.
- Read `reference/payload-markdown-directives.md` for supported directive syntax and recipes.
- Read `reference/quality.md` before final review or docs drift audits.

## Authoring Defaults

- Use exactly one H1 per page.
- Put `:::toc[On this page]{depth="3" theme="compact"}` after the intro on long pages.
- Use `:::callout` for important notes, warnings, tips, and migration hazards.
- Use `:::steps` for setup, tutorials, and workflows.
- Use `:::cards` and `:::card` for page maps, feature groups, related links, and summary grids.
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
python3 skills/payload-markdown/codex/scripts/check_payload_markdown_doc.py docs/**/*.md
```

If the downstream project uses `@valkyrianlabs/payload-markdown-docs`, also run its docs validation command when available.
