# Example Docs Page

```markdown
---
title: Signed Push
navTitle: Signed Push
description: Upload docs with signed requests.
order: 30
status: published
tags:
  - workflow
---

# Signed Push

:::toc {title="On this page" depth="3" theme="compact"}
:::

Use signed push to validate and upload docs.

:::callout {variant="warning" title="Server-owned authority"}
The request may ask. The Payload plugin decides.
:::

:::steps {variant="cards" layout="stack" numbered stepTheme="glass"}

### Validate

Run `payload-markdown-docs validate`.

### Dry-run

Run `payload-markdown-docs push --dry-run`.

### Sync

Run `payload-markdown-docs push --sync` only when the server allows writes.

:::

Read [Publishing](/workflow/publishing) next.
```
