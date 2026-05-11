# GitHub Actions Example

```yaml
name: Publish docs

on:
  pull_request:
    paths:
      - 'docs/**'
  push:
    branches: [main]
    paths:
      - 'docs/**'

permissions:
  id-token: write
  contents: read

jobs:
  docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Validate docs
        run: pnpm exec payload-markdown-docs validate ./docs --source main-docs

      - name: Dry-run docs sync
        if: github.event_name == 'pull_request'
        run: |
          pnpm exec payload-markdown-docs push ./docs \
            --endpoint "$DOCS_SYNC_ENDPOINT" \
            --source main-docs \
            --github-oidc \
            --dry-run
        env:
          DOCS_SYNC_ENDPOINT: ${{ secrets.DOCS_SYNC_ENDPOINT }}

      - name: Publish docs
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          pnpm exec payload-markdown-docs push ./docs \
            --endpoint "$DOCS_SYNC_ENDPOINT" \
            --source main-docs \
            --github-oidc \
            --sync \
            --publish
        env:
          DOCS_SYNC_ENDPOINT: ${{ secrets.DOCS_SYNC_ENDPOINT }}
```
