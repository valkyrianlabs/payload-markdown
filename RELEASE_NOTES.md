# Payload Markdown release notes

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
