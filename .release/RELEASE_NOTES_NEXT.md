<!--
vl-release staged release notes: the user-facing story of the NEXT release.
Maintained continuously while working; `vlr prepare` promotes it into the release notes
history (and the GitHub release) and resets this file to this template.

Format: the first line is "# <release title>" WITHOUT a version number (vlr adds it).
Everything after the title is the Markdown release body. Describe the resulting behavior
for users and operators; keep it representative of what actually ships.
-->
# Agent skill installer

## Install the agent skill with one command

The Claude Code and Codex skill that ships with the package now has an installer:

```bash
npx payload-markdown skill install
```

It installs the skill at `.claude/skills/payload-markdown` (Claude Code) and/or `.agents/skills/payload-markdown` (Codex). It picks the agents your project uses, updates copies that are already installed, and refuses to overwrite local edits or an unrelated directory unless you pass `--force`. Use `--agent claude|codex|all` and `--dir <path>` to choose. Run it again after upgrading the package.

## Know when the skill is stale

- Each skill now has a `skill.json` with the package version and a `sha256` of its files.
- `npx payload-markdown skill check` exits non-zero when an installed skill is outdated, unversioned (copied by hand before this release) or edited locally, so CI can flag drift.
- `markdownGuide` now lists the package version and the current skill hashes. The skill tells agents to compare them, or to run `skill check`, and to suggest an update when they differ.

Copies installed by hand with `cp -r` have no `skill.json` and report as unversioned; run `npx payload-markdown skill install` once to replace them.

The skill's own validation commands now point at the installed location (`.claude/skills/payload-markdown/scripts/…` or `.agents/skills/payload-markdown/scripts/…`).
