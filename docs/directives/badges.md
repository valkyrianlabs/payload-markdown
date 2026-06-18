---
title: Badges
navTitle: Badges
description: Render img.shields.io badges with curated directive resolvers and strict Shields escape hatches.
order: 257
status: published
tags:
  - directives
  - badges
---

# Badges

Use `::badge` leaf directives for individual Shields images and `:::badges` to group them.

```md
:::badges
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"
}
:::
```

`::badge` renders an `img` from `https://img.shields.io`. When `href` is present, the renderer wraps the image in an anchor. Click behavior uses that anchor wrapper; the directive does not use Shields' `link` query parameter.

## `::badge`

Common attributes:

- `[Label]`: default image `alt` text
- `alt`: overrides the label-derived image alt text
- `href`: optional link target
- `newTab`: adds `target="_blank"` and `rel="noopener noreferrer"` when `true`
- `style`, `logo`, `logoColor`, `logoSize`, `label`, `labelColor`, `color`, and `cacheSeconds`: passed through to Shields as encoded query attributes

Curated resolvers:

- `type="static"` with `label`, `message`, and `color`
- `type="npm"` with `target="version"`, `target="downloads"`, or `target="license"` and `package`
- `type="npm" target="downloads"` also accepts `interval`; default is `dw`
- `type="github" target="workflow"` with `repo` and `workflow`
- `type="github"` with `target="release"`, `target="license"`, or `target="stars"` and `repo`
- `type="debian" target="version"` with `package`
- `type="apt"` is an alias for `type="debian"`

```md
::badge[build]{
  type="github"
  target="workflow"
  repo="valkyrianlabs/payload-markdown"
  workflow="deploy.yml"
  href="https://github.com/valkyrianlabs/payload-markdown/actions"
}
```

```md
::badge[downloads]{
  type="npm"
  target="downloads"
  package="@valkyrianlabs/payload-markdown"
  interval="dm"
}
```

```md
::badge[debian]{
  type="debian"
  target="version"
  package="curl"
}
```

```md
::badge[static]{
  type="static"
  label="docs"
  message="ready"
  color="0ea5e9"
}
```

## Escape Hatches

Use `path` for a Shields path that is not covered by the curated resolver map:

```md
::badge[coverage]{
  path="badge/coverage-95%25-brightgreen"
  style="flat-square"
}
```

Use `src` only for full Shields URLs. The renderer rejects non-`https://img.shields.io` hosts.

```md
::badge[custom]{
  src="https://img.shields.io/badge/custom-badge-blue"
}
```

## `:::badges`

Attributes:

- `align`: `left`, `center`, or `right`
- `gap`: `sm`, `md`, or `lg`
- `wrap`: `true` or `false`

Defaults:

- `align="left"`
- `gap="md"`
- `wrap="true"`

```md
:::badges{
  align="center"
  gap="md"
  wrap=true
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
::badge[license]{
  type="npm"
  target="license"
  package="@valkyrianlabs/payload-markdown"
}
:::
```
