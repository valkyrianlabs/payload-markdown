---
title: Custom Agents
navTitle: Custom Agents
description: Use the payload-markdown agent operations in your own chat, dashboard or automation without MCP.
order: 370
status: published
tags:
  - agents
  - api
---

# Custom Agents

The MCP tools are thin wrappers around plain server functions. Use the functions directly to build an in-admin chat, a scheduled content job, or an agent on any LLM SDK, with the same validation, draft and access behavior.

:::toc[On this page]{depth="2" theme="compact"}
:::

## The Operations

```ts
import {
  getMarkdownGuide,
  publishMarkdown,
  readMarkdownDocuments,
  validateMarkdown,
  writeMarkdown,
} from '@valkyrianlabs/payload-markdown/mcp'
```

| Function | MCP tool | Returns |
| --- | --- | --- |
| `getMarkdownGuide({ payload, collection? })` | `markdownGuide` | Guide Markdown string. |
| `readMarkdownDocuments({ req, collection, id \| search \| where })` | `markdownRead` | `{ docs, totalDocs }` |
| `validateMarkdown(markdown, { payload, collection?, scope? })` | `markdownValidate` | `{ ok, counts, diagnostics, errors, headings }` |
| `writeMarkdown({ req, collection, id, edits, … })` | `markdownWrite` | `{ saved, status, edits, adminUrl, … }` |
| `publishMarkdown({ req, collection, id })` | `markdownPublish` | `{ saved, status, … }` |

The document operations take a `PayloadRequest` with a user and always run with `overrideAccess: false`, so they act exactly as that user could in the admin. They throw `MarkdownAgentError` with a `code` (see [error codes](/agents/mcp-tools#error-codes)).

## Example: A Server Endpoint

A Payload endpoint that applies an agent's edits for the logged-in user:

```ts
import type { Endpoint } from 'payload'

import { MarkdownAgentError, writeMarkdown } from '@valkyrianlabs/payload-markdown/mcp'

export const applyAgentEdits: Endpoint = {
  path: '/agent/markdown',
  method: 'post',
  handler: async (req) => {
    const { collection, edits, id, ifUpdatedAt } = await req.json?.()

    try {
      const result = await writeMarkdown({ collection, edits, id, ifUpdatedAt, req })
      return Response.json(result)
    } catch (error) {
      if (error instanceof MarkdownAgentError)
        return Response.json({ code: error.code, details: error.details, message: error.message }, { status: 400 })
      throw error
    }
  },
}
```

## Example: Tools For An LLM

Give your model the guide as context and expose read, validate and write as tools. A minimal loop with any SDK:

```ts
const guide = getMarkdownGuide({ collection: 'pages', payload: req.payload })

const tools = {
  read: (args) => readMarkdownDocuments({ ...args, req }),
  validate: (args) => validateMarkdown(args.markdown, { collection: 'pages', payload: req.payload, scope: args.scope }),
  write: (args) => writeMarkdown({ ...args, req }),
}
```

Keep `publish` out of the model's tools and publish from your UI after review, or call `publishMarkdown` only on an explicit user action.

## Building Blocks

For lower-level work the export also includes:

- `collectMarkdownTargets(fields, data, payload)`: markdown targets and blocks outlines of any document data.
- `describeMarkdownLocations(fields, payload)`: where markdown can live in a collection or global config.
- `isMarkdownField(field)`: detects fields created by `markdownField()`.
- `MARKDOWN_GUIDE_EXAMPLES`: the guide's examples, each validated in the package tests.
