# Agent Docs Workflow

Use this workflow when editing docs source files.

1. Inspect the docs tree, usually `./docs`.
2. Edit Markdown files in place.
3. Keep frontmatter valid and simple.
4. Keep internal docs links root-relative.
5. Use only supported `payload-markdown` directives.
6. Run validation.
7. Run plan when sync impact matters.
8. Only push when the user asks for upload/sync and provides endpoint/auth context.

Validation:

```bash
pnpm exec payload-markdown-docs validate ./docs --source main-docs
```

Plan:

```bash
pnpm exec payload-markdown-docs plan ./docs --source main-docs
```

Dry-run upload with GitHub OIDC:

```bash
pnpm exec payload-markdown-docs push ./docs \
  --endpoint "$DOCS_SYNC_ENDPOINT" \
  --source main-docs \
  --github-oidc \
  --dry-run
```

Use Ed25519 key flags only when the project is not using GitHub OIDC.

Do not directly edit generated Payload docs records unless the user specifically asks for Payload-side overrides.
