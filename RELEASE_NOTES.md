# Payload Markdown release notes

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
