---
title: AI Agents and MCP
navTitle: AI Agents
description: Let AI agents read, edit, validate and publish payload-markdown content in your Payload app through MCP.
order: 350
status: published
tags:
  - agents
  - mcp
dependencies:
  - "@valkyrianlabs/payload-markdown"
  - "@payloadcms/plugin-mcp"
---

# AI Agents and MCP

Point an AI agent at your Payload app and ask for changes in plain language: "rewrite the Home page intro from our launch post", "add an FAQ block after the hero", "fix the broken callouts on the pricing page". The agent finds the document, writes payload-markdown with the directives your site actually supports, validates it with the same renderer your site uses, and saves a draft for you to review.

`@valkyrianlabs/payload-markdown/mcp` adds this to [Payload's official MCP plugin](https://payloadcms.com/docs/plugins/mcp). Any MCP client works: Claude Code, Claude Desktop, Cursor, VS Code, or your own agent.

:::toc[On this page]{depth="2" theme="compact"}
:::

:::callout[Safe by default]{variant="tip"}
Agents save drafts, not live pages. Every change is validated before it is saved, edits to a document land in one atomic save, and the agent can only touch what its API key and Payload user are allowed to.
:::

## Quick Setup

:::steps

### Install the MCP plugin

```text
pnpm add @payloadcms/plugin-mcp
```

### Register it with the markdown tools

Add `mcpPlugin` after `payloadMarkdown`, wrapping its options in `withPayloadMarkdownMcp`. Expose the collections and globals agents may work on.

```ts
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'
import { withPayloadMarkdownMcp } from '@valkyrianlabs/payload-markdown/mcp'

export default buildConfig({
  plugins: [
    payloadMarkdown({ collections: { pages: true, posts: true } }),
    mcpPlugin(
      withPayloadMarkdownMcp({
        collections: {
          pages: { enabled: true },
          posts: { enabled: true },
        },
      }),
    ),
  ],
})
```

Run `payload generate:importmap` and restart the dev server.

### Create an API key

In the Payload admin, open **MCP → API Keys** and create a key. Tick `Find` and `Update` for each collection the agent may edit, and keep the `markdown*` tools checked. The key acts as the user who created it.

### Connect your agent

The MCP endpoint is `/api/mcp` (Streamable HTTP, `Authorization: Bearer <key>`). With Claude Code:

```text
claude mcp add --transport http payload http://localhost:3000/api/mcp --header "Authorization: Bearer <key>"
```

Clients configured with JSON, such as Cursor's `mcp.json`, use the same URL and header:

```json
{
  "mcpServers": {
    "payload": {
      "url": "http://localhost:3000/api/mcp",
      "headers": { "Authorization": "Bearer <key>" }
    }
  }
}
```

### Install the agent skill

Recommended for Claude Code and Codex: the skill adds directive recipes, formatting rules and this workflow.

```text
npx payload-markdown skill install
```

:::

Then ask: _"Rewrite the Home page using our README at github.com/acme/widget. Use cards for the features."_

## What Agents Can Do

| Tool | What it does |
| --- | --- |
| `markdownGuide` | The authoring guide for this site: workflow, where markdown lives, configured themes, icons and code languages, and every directive with its attributes. |
| `markdownRead` | Finds documents by id, search or `where`, and lists each markdown field and markdown block with a `ref`, its markdown, the blocks outline, `updatedAt`, `adminUrl` and `previewUrl`. |
| `markdownValidate` | Renders markdown exactly like the site and returns every diagnostic with line and column. |
| `markdownWrite` | Replaces, inserts or removes markdown in one atomic save, after validating every change. Saves a draft unless asked to publish. |
| `markdownPublish` | Publishes the latest draft after validating all of its markdown. |

The `markdownEditDocument` prompt packages the whole workflow; many clients show it as a slash command. See [MCP Tools](/agents/mcp-tools) for every argument and result.

## How It Stays Correct

:::cards{columns="2" cardTheme="muted"}

:::card[Site-aware guide]
The guide is generated from the live directive registry and your config, so agents only use themes, icon names and code languages that exist in this app.
:::

:::card[Validation gate]
Every write is rendered first. Errors and warnings block the save (warnings can be accepted explicitly), so broken directives never reach a page.
:::

:::card[Surgical edits]
Markdown blocks are addressed by block id. Only the top-level fields that contain an edit are sent, so other blocks and fields are never rewritten.
:::

:::card[Concurrency]
Pass `ifUpdatedAt` from `markdownRead` and a write is refused if someone saved in between. Locked documents are not overwritten unless the user agrees.
:::

:::

## Access Control

Tools run as the API key's user with `overrideAccess: false`, so collection, field and document access rules apply. On top of that, `withPayloadMarkdownMcp` makes the markdown tools honor the key's per-collection and per-global checkboxes exactly like the built-in MCP tools: reading needs `Find`, writing and publishing need `Update`. Only collections and globals you expose in `mcpPlugin` get those checkboxes.

For a read-only connection, register only the read tools:

```ts
mcpPlugin(
  withPayloadMarkdownMcp(
    { collections: { pages: { enabled: { find: true } } } },
    { tools: ['guide', 'read', 'validate'] },
  ),
)
```

:::callout[Content is not instructions]{variant="warning"}
Agents often read websites or documents to write content. The guide and prompt tell agents to treat that text as content, never as instructions, and drafts give you a review step. Keep publishing a human decision for anything public.
:::

## Agent Skill

The package ships an agent skill for Claude Code and Codex with directive recipes, formatting rules and the MCP workflow. Install it from the project root:

```bash
npx payload-markdown skill install
```

| Agent | Installed at |
| --- | --- |
| Claude Code | `.claude/skills/payload-markdown` |
| Codex | `.agents/skills/payload-markdown` |

The installer updates skills that are already installed. Otherwise it installs for the agents the project uses (a `.claude/` directory or `CLAUDE.md` for Claude Code; `.agents/`, `.codex/` or `AGENTS.md` for Codex), and for both when it finds neither. Pass `--agent claude`, `--agent codex` or `--agent all` to choose, and `--dir <path>` to install into another project root. With pnpm, `pnpm exec payload-markdown skill install` does the same.

### Keep It Current

Each installed skill has a `skill.json` recording the package version it came from and a `sha256` of its files. Run the install again after upgrading the package. Drift shows up in three places:

- `npx payload-markdown skill check` exits non-zero when an installed skill is outdated, unversioned or edited locally. Add it to CI to catch a stale skill in review.
- `markdownGuide` lists the current skill hashes, and the skill tells agents to compare them with its `skill.json` and suggest an update when they differ.
- With shell access, the skill tells agents to run `skill check` before relying on it.

:::callout[Local edits are kept]{variant="info"}
The installer refuses to overwrite a skill with local edits, or a directory that is not this skill, unless you pass `--force`.
:::

## Next Steps

:::cards{columns="2"}

:::card[MCP Tools]{href="/agents/mcp-tools"}
Arguments, results, error codes and options for every tool.
:::

:::card[Custom Agents]{href="/agents/custom-agents"}
Use the same operations in your own dashboard chat or automation.
:::

:::
