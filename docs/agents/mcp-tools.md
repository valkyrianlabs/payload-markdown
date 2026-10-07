---
title: MCP Tools Reference
navTitle: MCP Tools
description: Arguments, results, errors and options of the payload-markdown MCP tools and prompt.
order: 360
status: published
tags:
  - agents
  - mcp
  - reference
---

# MCP Tools Reference

The tools registered by `withPayloadMarkdownMcp()` from `payload-markdown/mcp`. Results are JSON text; failures set the MCP `isError` flag and return `{ "error": "<code>", "message": "…" }`.

:::toc[On this page]{depth="2" theme="compact"}
:::

## Addressing Documents

Tools that work on one document take either a collection document or a global:

| Argument | Type | Notes |
| --- | --- | --- |
| `collection` | string | Collection slug, with `id` (or `search` / `where` in `markdownRead`). |
| `id` | string or number | Document id. |
| `global` | string | Global slug, instead of `collection` + `id`. |
| `locale` | string | Locale for localized content. Defaults to the default locale. |

Draft-enabled collections and globals are always read at their latest draft.

## Refs

`markdownRead` returns a `targets` list. Each target is one piece of markdown:

- A markdown block (`vlMdBlock`) in a blocks field: `ref` is the block id, `scope` is `blocks`.
- A markdown field (`markdownField()`), at any depth: `ref` is the data path, for example `content` or `about.body`; `scope` is `field`.

Edits address targets by `ref`. Block ids stay stable when rows move; paths such as `layout.2.content` are also accepted.

## `markdownGuide`

Returns the authoring guide as Markdown. Agents should read it first.

| Argument | Type | Notes |
| --- | --- | --- |
| `collection` | string | Show this collection's settings (its themes, icons and code languages). |

The guide contains the workflow, every collection and global that holds markdown (with draft support, title field and whether the key may write), the directive themes, icon names and highlighted code languages configured for the site, every directive with its attributes and close markers, syntax rules, and examples. It is generated from the live config and directive registry.

## `markdownRead`

| Argument | Type | Notes |
| --- | --- | --- |
| `collection`, `id`, `global`, `locale` | | See [Addressing Documents](#addressing-documents). |
| `search` | string | Matches the title field (contains), `slug` (equals) or `id`. |
| `where` | object | Payload `where` query, combined with `search`. |
| `limit` | number | Documents for `search` / `where`, 1 to 25 (default 5). |
| `includeMarkdown` | boolean | Include each target's markdown (default `true`). |

Result:

```json
{
  "totalDocs": 1,
  "docs": [
    {
      "collection": "pages",
      "id": 1,
      "title": "Home",
      "status": "published",
      "drafts": true,
      "updatedAt": "2026-10-05T20:23:00.522Z",
      "adminUrl": "/admin/collections/pages/1",
      "previewUrl": "/next/preview?slug=home",
      "blocks": [
        {
          "path": "layout",
          "acceptsMarkdownBlocks": true,
          "rows": [
            { "id": "6ac4…294d", "type": "vlMdBlock", "name": "Intro", "markdownRef": "6ac4…294d" },
            { "id": "6ac4…294e", "type": "archive" }
          ]
        }
      ],
      "targets": [
        {
          "ref": "6ac4…294d",
          "path": "layout.0.content",
          "label": "Intro",
          "scope": "blocks",
          "block": { "field": "layout", "id": "6ac4…294d", "index": 0, "name": "Intro", "type": "vlMdBlock" },
          "chars": 42,
          "markdown": "# Welcome…"
        }
      ]
    }
  ]
}
```

`previewUrl` comes from the collection's `admin.preview`, when configured.

## `markdownValidate`

| Argument | Type | Notes |
| --- | --- | --- |
| `markdown` | string | Required. |
| `collection` | string | Collection whose settings apply. |
| `scope` | `field` or `blocks` | `blocks` for markdown blocks, `field` for markdown fields (default). |

Result: `{ ok, counts: { error, warning, info }, diagnostics: [{ severity, source, message, line, column, code }], errors, headings }`. `ok` is `true` only with no errors and no warnings; `info` diagnostics (for example a code language without highlighting) never fail validation.

## `markdownWrite`

| Argument | Type | Notes |
| --- | --- | --- |
| `collection`, `id`, `global`, `locale` | | See [Addressing Documents](#addressing-documents). |
| `edits` | array | Required. Applied together in one save. |
| `ifUpdatedAt` | string | `updatedAt` from `markdownRead`; the write fails with `conflict` if the document changed since. |
| `publish` | boolean | Publish instead of saving a draft. |
| `dryRun` | boolean | Validate and report without saving. |
| `allowWarnings` | boolean | Save despite validation warnings. Errors always block. |
| `overrideLock` | boolean | Write while someone has the document open. |

Edits:

| `action` | Fields | Effect |
| --- | --- | --- |
| `replace` | `target`, `markdown` | New markdown for a field or block. |
| `insert` | `field`, `markdown`, optional `after` / `before` (row id), `blockName` | New markdown block in a blocks field; appended when no anchor is given. Anchors can be any block type. |
| `remove` | `target` | Removes a markdown block. Fields cannot be removed. |

Every new markdown is validated with its target's scope, collection settings and per-block params. If any edit fails, nothing is saved and the error lists each edit's diagnostics. Only the top-level fields that contain edits are sent to Payload.

Result: `{ saved, status, updatedAt, adminUrl, previewUrl, edits: [{ index, action, target, path, blockId, validation }] }`. `status` is `draft`, `published`, or `live` for collections without drafts. Inserted blocks report their new `blockId`.

## `markdownPublish`

| Argument | Type | Notes |
| --- | --- | --- |
| `collection`, `id`, `global`, `locale` | | See [Addressing Documents](#addressing-documents). |
| `allowWarnings` | boolean | Publish despite warnings in the draft. Errors always block. |
| `overrideLock` | boolean | Publish while someone has the document open. |

Publishes the latest draft after validating every markdown target in it. Fails with `no_drafts` for collections and globals without drafts.

## `markdownEditDocument` Prompt

Arguments `document`, `request` and optional `source`. Produces a user message with the full workflow (guide, read, validate, write a draft, report, publish only on request). Clients such as Claude Code list prompts as slash commands.

## Error Codes

| Code | Meaning |
| --- | --- |
| `forbidden` | No user, or the API key lacks `Find` / `Update` for the collection or global. |
| `not_found` | Unknown collection, global or document. |
| `invalid_edit` | Malformed edit, unknown ref, or a blocks field that does not accept markdown blocks. |
| `validation_failed` | Markdown did not validate; nothing was saved. `details` holds the diagnostics. |
| `conflict` | `ifUpdatedAt` did not match: read again and reapply. |
| `locked` | Someone has the document open. Ask before retrying with `overrideLock`. |
| `no_drafts` | `publish` on a collection or global without drafts. |

## Plugin Options

`withPayloadMarkdownMcp(mcpOptions, options?)` returns `mcpPlugin` options with the tools and prompt added. Existing `mcp.tools`, `mcp.prompts` and `overrideAuth` are kept.

| Option | Default | Notes |
| --- | --- | --- |
| `tools` | all | Any of `guide`, `validate`, `read`, `write`, `publish`. |
| `prompts` | `true` | Register `markdownEditDocument`. |
| `access` | `mcpApiKey` | `mcpApiKey` honors the key's per-collection checkboxes; `user` relies on Payload access control only. |

To compose manually, `payloadMarkdownMcpTools(options)` and `payloadMarkdownMcpPrompts()` return the raw definitions. With `access: 'mcpApiKey'` they need the key settings on `req.context`, which `withPayloadMarkdownMcp` records.
