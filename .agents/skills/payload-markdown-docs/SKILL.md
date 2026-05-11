---
name: payload-markdown-docs
description: Use this skill when maintaining Git-backed documentation for a project that uses `@valkyrianlabs/payload-markdown-docs`.
---

# Payload Markdown Docs Skill

Use this skill when maintaining Git-backed documentation for a project that uses `@valkyrianlabs/payload-markdown-docs`.

The docs source lives in `./docs` unless the user says otherwise. Edit Markdown source files first. Do not directly mutate generated Payload docs records unless the user explicitly asks for an admin-side override change.

## Core Rules

- Keep docs in repo-local Markdown files.
- Use `.md` files only. Do not introduce MDX unless the project explicitly enables it in a future version.
- Use supported frontmatter only.
- Keep internal docs links root-relative inside the docs set, such as `/getting-started/quick-start`.
- Use `payload-markdown` directives only when they are supported.
- Keep formatting plain Markdown: supported frontmatter, one H1, clear H2/H3 sections, root-relative links, and supported directives.
- Do not invent directives, frontmatter fields, CLI flags, sync modes, or runtime features.
- Do not describe unsupported features as implemented.
- Do not add MDX, arbitrary YAML objects, inline frontmatter arrays, HTML widgets, or one Payload Page per Markdown file.
- Run validation before finishing docs edits.
- Treat sync and publishing as CMS/server-owned. The request may ask; Payload
  docs sets and plugin config decide.
- Do not hardcode new docs packages into plugin config. A docs package should map
  to a Payload Admin docs set slug. Routes are derived from groups and slugs;
  trust belongs in global Keys and Trusted records.

## AI Markdown Export Manifest

Treat `./docs/index.ai.yml` as part of the standard docs package.
When creating, scaffolding, migrating, or updating Payload Markdown docs, create or
update this file automatically. Do not wait for the user to request it.

The manifest is source-controlled alongside the docs. It controls the generated
AI-facing raw Markdown route, usually `/plugins/<docs-package>.md`, while the
human docs continue to render at `/plugins/<docs-package>`.

Rules for `index.ai.yml`:

- Prefer `index.ai.yml`; `index.ai.yaml` is supported when already present.
- Generate `order` from the actual Markdown files present under `./docs`.
- Update `order` in the same change when docs pages are added, renamed, moved, or removed.
- Do not invent page names just to fill the manifest.
- Do not show the manifest in human docs navigation.
- Do not render the manifest as a normal docs page.
- Use it as the canonical ordering source for the `.md` export.
- Remember that the `.md` export is served by a Next route handler, not by a generated Payload Page.
- Avoid backend hand-sorting unless the project already has a docs sort field.

Ordering source preference:

1. `./docs/index.ai.yml`
2. `./docs/index.ai.yaml`
3. existing docs/nav order field
4. deterministic fallback order: title, slug/path, id

Default ordering pattern when applicable:

1. `index.md`
2. installation/setup docs
3. basic usage docs
4. rendering docs
5. blocks/component docs
6. styling/theming docs
7. configuration docs
8. advanced docs
9. examples
10. troubleshooting/reference

Supported first-pass values:

- `orphans: append`
- `orphans: ignore`
- `headingMode: normalize`
- `headingMode: preserve`

Defaults are `orphans: append` and `headingMode: normalize`.

Example manifest:

```yaml
version: 1

title: Payload Markdown Documentation
canonical: /plugins/payload-markdown
output: /plugins/payload-markdown.md

description: >
  Consolidated AI-facing documentation export for Payload Markdown.

preamble: |
  This file is intended for AI agents, editor tooling, Codex, ChatGPT,
  and offline reference.

  Read the documents in the listed order. Installation and basic usage
  should be treated as prerequisite context before rendering, styling,
  configuration, or advanced examples.

order:
  - ./index.md
  - ./install.md
  - ./usage.md
  - ./rendering.md
  - ./blocks.md
  - ./styling.md
  - ./configuration.md
  - ./examples.md

exclude:
  - ./drafts/**
  - ./internal.md

orphans: append
headingMode: normalize
```

Manifest fields:

- `version`: manifest format version.
- `title`: title of the generated Markdown export.
- `canonical`: canonical human-facing docs URL.
- `output`: canonical AI-facing Markdown export URL.
- `description`: short summary included near the top of the export.
- `preamble`: AI-facing usage note included before page content.
- `order`: ordered list of docs files to include first.
- `exclude`: glob/path list of docs to omit from the AI export.
- `orphans`: behavior for docs not listed in `order`.
- `headingMode`: heading normalization behavior.

## Default Workflow

```bash
pnpm exec payload-markdown-docs validate ./docs --source main-docs
pnpm exec payload-markdown-docs plan ./docs --source main-docs
```

Only push when the user asks for an upload and provides endpoint/auth context. Prefer GitHub OIDC in GitHub Actions:

```bash
pnpm exec payload-markdown-docs push ./docs \
  --endpoint "$DOCS_SYNC_ENDPOINT" \
  --source main-docs \
  --github-oidc \
  --dry-run
```

Ed25519 signed sync is still supported for non-GitHub CI or local workflows:

```bash
pnpm exec payload-markdown-docs push ./docs \
  --endpoint "$DOCS_SYNC_ENDPOINT" \
  --source main-docs \
  --key-id github-actions-main \
  --private-key-env DOCS_SYNC_PRIVATE_KEY \
  --sync
```

Sync writes require `sync.allowWrites: true`. Publishing additionally requires `sync.allowPublish: true` and a draft-enabled docs collection.

## References

- `reference/payload-markdown-directives.md`
- `reference/formatting.md`
- `reference/frontmatter.md`
- `reference/workflow.md`
- `reference/sync.md`
- `reference/routing.md`
- `reference/admin.md`
- `reference/troubleshooting.md`
- `examples/docs-page.md`
- `examples/github-actions.md`

## Safety Checklist

Before finishing:

1. Confirm changed docs have valid frontmatter.
2. Confirm `index.ai.yml` matches the current docs files.
3. Confirm internal links are root-relative.
4. Confirm directives match the reference.
5. Run validate.
6. Run plan when sync behavior matters.
7. Report any validation failures instead of guessing.
