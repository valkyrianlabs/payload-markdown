# Frontmatter

Use only this supported frontmatter subset.

```yaml
---
title: Installation
navTitle: Install
description: Install and configure docs sync.
order: 10
status: published
tags:
  - getting-started
dependencies:
  - "@valkyrianlabs/payload-markdown"
redirectFrom:
  - /docs/install
---
```

Supported fields:

- `title`
- `navTitle`
- `description`
- `order`
- `status`
- `slug`
- `tags`
- `dependencies`
- `redirectFrom`
- `draft`

Rules:

- `status` must be `draft` or `published`.
- `order` must be a number (decimal, or a `0x`/`0o`/`0b` integer).
- `tags`, `dependencies`, and `redirectFrom` should use `- item` lines; a
  single-line list such as `tags: [getting-started]` is accepted but harder to
  review.
- `slug` may contain letters, numbers, and hyphens, starting with a letter or
  number.
- Nested values, multi-line values, and block scalars (`|`, `>`) on supported
  fields fail validation; keep every value on one line.
- Avoid unsupported fields unless the user accepts validation warnings.
- Name docs files with lowercase `.md`; `README.MD` or `.markdown` files are
  skipped with a warning. Avoid `?`, `#`, and spaces in file and directory
  names because they end up in routes.
- Explicit `title` is preferred even though title fallback exists.
- Use `slug` only to override the final route segment; move files to change route hierarchy.
