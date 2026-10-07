<!-- vl-release:generated-local -- regenerate with `vlr install-local-skill` after changing release.toml; local edits are overwritten -->
# Payload Markdown: release specifics

Generated from this repository's `release.toml`. The general workflow is in `SKILL.md`;
this file says how it applies here.

## Files

| Purpose | Path |
|---|---|
| Release contract | `release.toml` |
| Staged release notes (keep current) | `.release/RELEASE_NOTES_NEXT.md` |
| Published release notes (do not edit) | `RELEASE_NOTES.md` |

## Versions

- Canonical: `package.json`
- Kept in sync by `vlr version …`: `src/version.ts` (regex), `skills/payload-markdown/claude/skill.json` (regex), `skills/payload-markdown/codex/skill.json` (regex)
- Tags: `vX.Y.Z` on branch `main`; GitHub release title: `vX.Y.Z - <title>`

## Release channels

- **npm package** (built by `vlr build-npm`): packed with `npm` from `.`, dist-tag `latest`, pre-pack: `pnpm build`, also published as `payload-markdown` (`[[npm.aliases]]`, derived from the same tarball)
  - registry `npmjs`: https://registry.npmjs.org/ (auth `oidc`), published with `vlr publish-npm`

## Before considering substantial work complete

```sh
vlr check
pnpm test:int
```
