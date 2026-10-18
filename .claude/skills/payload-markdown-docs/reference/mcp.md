# MCP Tools

Use this reference when the session is connected to a site's Payload MCP server
(`/api/mcp`) that registers the payload-markdown-docs tools (`docsGuide`,
`docsFind`, ...). Those come from `withPayloadMarkdownDocsMcp()` in
`payload-markdown-docs/mcp`.

## Ground Rule

Git owns generated docs. Over MCP you cannot change a doc's content or its
frontmatter fields (title, navTitle, description, order, dependencies, route),
create docs, or delete them. Every MCP write that tries is refused with
`sync_owned`, including the built-in collection tools and payload-markdown's
`markdownWrite`.

To change content, edit the Markdown under `./docs` in the repository, run
`pmdocs validate --source <docs-set-slug>`, and let the sync (CI or
`pmdocs push`) update the site. Do not try to work around `sync_owned`.

## Workflow

1. Call `docsGuide` first. It lists the collections, which fields Git owns, which
   are editable, whether docs have drafts, and what the API key allows.
2. Locate records with `docsStructure` (docs sets and groups) and `docsFind`
   (docs by docs set, route, source path or title).
3. Pass the record's `updatedAt` as `ifUpdatedAt` on every write.
4. Writes to draft-enabled records save drafts. Publish (`publish: true` or
   `docsPublish`) only when the user asked to.
5. Report what changed with the returned `adminUrl`.

## Tools

- `docsGuide`: site-specific rules and permissions.
- `docsStructure`: docs groups and sets, routing, SEO, publishing security, last
  sync status, doc counts.
- `docsFind`: docs with sync drift (`sync.contentDrift`, `sync.fieldsDrift`) and
  the admin-owned fields you may change (`editable`).
- `docsUpdate`: change admin-owned doc fields only: `heroImage`,
  `overrides.navTitle`, `overrides.hideFromNav`, `parent`, `publishedAt`. Use
  `overrides.navTitle` for a different sidebar label.
- `docsPublish`: publish the latest draft or unpublish a doc or docs set.
- `docsVersions`: list versions, or inspect one with `versionId`. Only versions
  with `gitSnapshot: true` can be restored.
- `docsRestoreVersion`: roll back to a Git snapshot (draft unless `publish`).
  The next sync from Git still applies.
- `docsSetSave`, `docsGroupSave`: create or update docs sets and groups (titles,
  descriptions, SEO `meta`, group, routing, branch, repositories, workflow refs).
  A docs set slug is the `--source` id; renaming it breaks existing syncs.
- `docsAccessList`, `docsAccessSave`, `docsAccessDelete`: sync credentials.
  Store public keys only; never paste a private key. Confirm access changes with
  the user.
- `docsSyncRuns`: the sync audit log; pass `id` for warnings, errors and the plan
  summary.

Use payload-markdown's `markdownRead` to read a doc's markdown and
`markdownValidate` to check markdown before committing it to Git.

## Errors

- `sync_owned`: the field is Git-owned; change the Markdown in Git instead.
- `not_git_snapshot`: the version was edited outside Git; do not restore it.
- `conflict`: read the record again and reapply.
- `forbidden`: the API key or user lacks the permission; tell the user which
  checkbox is missing instead of retrying.
- `locked`: someone has the record open; ask before using `overrideLock`.
