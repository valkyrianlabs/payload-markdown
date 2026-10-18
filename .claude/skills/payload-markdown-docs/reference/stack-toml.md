# Project Metadata: `stack.toml`

`./docs/stack.toml` sits at the docs root, next to `index.md`. It is
metadata, not a docs page: it never becomes a route. `pmdocs` converts it into
the manifest `project` object, and the sync endpoint stores it on the docs set.

## Shape

```toml
[project]
title = "Vaulthalla"                                  # optional
description = "The Final Cloud — encrypted storage."  # optional

[[stack.languages]]
name = "C++23"

[[stack.languages]]
name = "TypeScript"

[[stack.databases]]
name = "PostgreSQL"

[[stack.infrastructure]]
name = "Cloudflare R2"
```

- Each category is `[[stack.<category>]]`, an array of tables, or the
  equivalent inline form `languages = [{ name = "Go" }]` under `[stack]`.
  A single `[stack.languages]` table is an error.
- Category keys are free-form: letters, digits, `-` and `_`, starting with a
  letter or digit (`machine-learning`, not `"machine learning"`). The site
  displays them as labels (`machine-learning` becomes "Machine Learning").
- Every technology needs `name`: one line of plain text, at most 128 bytes.
  Other keys are ignored with a warning.
- Categories keep their order in the file, and technologies keep theirs. Put
  the most important first: compact cards show only the first few.
- Duplicate categories, and duplicate names in one category, are errors. Both
  checks ignore case. The same technology may appear in two categories.
- Limits: 32 categories, 64 technologies per category, 256 in total.
- `title` is one line of at most 256 bytes. `description` may span lines and
  is at most 2048 bytes. Neither may be blank: remove the key instead.

## What a sync does

| `stack.toml` | Result on the docs set |
| --- | --- |
| missing | Nothing changes. |
| present with stacks | The stack is replaced. |
| `[stack]` with no categories | The stack is cleared. |
| no `[stack]` table at all | The stack is cleared, with a `missing_stack` warning. |
| `title` / `description` set | They replace the docs set title and description, unless the admin enabled "Manually manage title/desc". |
| `title` / `description` missing | The docs set keeps its current values. |

Docs sets created before this feature start in manual mode, so their existing
titles are never overwritten until an admin turns the toggle off.

## Maintaining it

- When dependencies change (package.json, meson.build, Cargo.toml,
  requirements, Dockerfiles, infrastructure code), update the stack in the same
  change.
- Use recognizable product names (`PostgreSQL`, `Next.js`, `libpqxx`). Do not
  list transitive or dev-only helpers unless they matter to readers.
- Run `pmdocs validate --source <docs-set-slug>`. Problems name the key to fix,
  for example: `stack.toml: stack.languages[1].name must not be empty.`
- `pmdocs plan` and `push` summarize the categories they will send. When a site
  runs a payload-markdown-docs version older than 1.3.0, `push` warns that the
  stack was not synchronized. The docs still sync.
