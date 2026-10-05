---
name: vl-release
description: Release workflow and setup for repositories released with vl-release (`vlr`). Use when adopting vl-release in a repository (release.toml, `vlr init`), whenever a change affects users, operators, security, compatibility, packaging, deployment or other substantial behavior (to keep the staged release docs in .release/ current), and before touching versions, release history, packaging or release CI.
---
<!-- vl-release:generated -- regenerate with `vlr install-skill`; local edits are overwritten -->

# vl-release

`vl-release` (also `vlr`) is the ValkyrianLabs release toolkit installed on this machine. A
repository opts in with a `release.toml` at its Git root; every `vlr` project command reads it.
The full references ship with the tool and work offline:

```sh
vlr help config     # release.toml reference (every key, version target kinds, package contracts)
vlr help staging    # staged release docs: formats, rules, how prepare promotes them
vlr help ci         # the release CI transaction and workflow conventions
```

## 1. Find this repository's specifics

- **`PROJECT.md` next to this file exists** → read it now. It is generated from this repository's
  `release.toml` and names the exact files, version targets, channels and checks used here.
- **No `PROJECT.md`, but `release.toml` exists** → run `vlr install-local-skill`, then read it.
- **No `release.toml`** → this repository has not adopted vl-release yet. Do not invent a release
  process; follow section 2 when asked to set releases up.

## 2. Setting up a repository (mandatory for a new repository)

1. `vlr init` scaffolds `release.toml` and the `.release/` staging files (it never overwrites).
2. Fill in `release.toml` from `vlr help config`, based on what the repository actually contains:
   - `[version]`: the canonical version file, plus a target for **every** other file that
     carries the version (meson.build, package.json, pyproject.toml, generated version
     constants via `regex`, a Homebrew formula). Never leave a version file unmanaged.
   - `[debian]` only if the repository builds .deb packages (`debian/control` exists), with one
     `[[debian.packages]]` contract per binary package: the paths it must ship, and paths that
     must never ship.
   - `[npm]` only if the repository publishes an npm package (`package.json` without
     `"private": true`), with a tarball contract (`package/...` paths it must and must never ship).
   - Publication (`[publish.apt]`, `[[publish.npm]]`, `[homebrew]`, `[source_archive]`):
     **ask the user** for repository URLs, registries, taps and which channels to enable; do not
     guess publication targets.
3. Add `build/` and `release/` to `.gitignore`.
4. Run `vlr check` until it passes, then `vlr version check`.
5. Run `vlr install-local-skill` to record this repository's specifics in `PROJECT.md`.
6. For release CI, read `vlr help ci`; this repository's workflows should call `vlr` commands
   rather than re-implementing release logic in YAML.

## 3. While you work: keep the staged release docs current

For any material change (user-visible behavior, operations/deployment, security,
compatibility, packaging, or a substantial internal change) update in the **same change**:

- **`.release/RELEASE_NOTES_NEXT.md`**: the user-facing release notes. Line 1 is
  `# <release title>` without a version number; the rest is the Markdown body.
- **`.release/CHANGELOG_NEXT.md`** (when Debian packaging is enabled): concise technical
  `- ` bullets. `vlr prepare` renders the Debian stanza; write no boilerplate.

Consolidate: rewrite and merge entries so they describe the resulting behavior; never append a
log of commits, fix-ups or abandoned attempts. Remove entries for reverted changes. No
placeholders. Purely internal refactors with no observable effect need no entry.
(`vlr help staging` has the exact formats.)

Before considering substantial work complete, run `vlr check`.

## 4. Never edit the published history by hand

`RELEASE_NOTES.md` and `debian/changelog` record published releases. Only `vlr prepare` (in
release CI) adds to them, and only `vlr finalize` persists that after publication succeeded.

## 5. Versions

Never edit version numbers by hand; every configured target is kept in sync:

```sh
vlr version check
vlr version bump patch|minor|major     # or: vlr version set X.Y.Z
```

## 6. Releasing

```sh
vlr status                          # version, release phase, staged-doc state
vlr cut patch|minor|major --push    # bump, commit, tag, push; the tag push starts release CI
```

`vlr cut X.Y.Z --push` releases an explicit version, including the version already in the
version file when it has never been released.

Release CI checks out the tag, runs `vlr prepare` (promoting the staged docs in the CI work tree
only), builds and validates artifacts from that prepared tree, publishes and verifies, and only
after every publication succeeded runs `vlr finalize`, which commits the promoted history and
the cleared `_NEXT` files back to the release branch. A failed release leaves the repository's
staged docs untouched and can simply be re-run; publication never replaces bytes that are
already published.

## Commands

| Command | Purpose |
|---|---|
| `vlr check [--release]` | Validate the repository (strict release gate with `--release`) |
| `vlr status [--json]` | Version, release phase, staged-doc state |
| `vlr prepare --dry-run` | Preview the rendered history entries without writing |
| `vlr release-title --staged` / `vlr release-body --staged` | Preview the GitHub release title/body |
| `vlr install-skill` / `vlr install-local-skill` | Update this skill / regenerate `PROJECT.md` |
| `vlr doctor` | Check the local toolchain |
| `vlr help config\|staging\|ci` | Offline references |
