# Routing

Docs are managed as docs sets, not as one Page per Markdown file.

## Docs Groups

Docs groups reserve namespaces such as `/plugins` or `/internal/tools`.

## Docs Sets

Docs sets represent one documentation site. Their route base is derived from an
optional group plus the docs set slug, such as:

```text
/plugins/payload-markdown-docs
```

## Generated Docs

Generated docs records are internal storage for routing, search, sync correctness, and per-doc overrides.

`index.md` routes to the docs set route base. Nested files route below it.

## Links

Use root-relative links inside the docs set:

```markdown
[Quick start](/getting-started/quick-start)
```

Do not hardcode production docs domains for internal navigation.

## Route Adapter

The `/next` export can resolve docs routes and let an app fall back to normal Pages rendering when no docs route matches. It does not mutate Pages.

## Raw Markdown

The AI-facing `.md` export is served by a Next route handler. It is not a
generated Payload Page and cannot be returned from a `page.tsx` catch-all.

Use `createPayloadMarkdownDocsMarkdownResponse` at the output path from
`index.ai.yml`, or place AI exports in a dedicated namespace such as `/ai`.
