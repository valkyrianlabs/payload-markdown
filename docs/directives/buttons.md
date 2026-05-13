---
title: Buttons
navTitle: Buttons
description: Use button links and button groups with local SVG icon packs.
order: 255
status: published
tags:
  - directives
  - buttons
---

# Buttons

Use `::button` leaf directives for link buttons and `:::buttons` container directives for button groups.

```md
::button[Home]{
  href="/home"
  icon="@fa-duotone/home"
}
```

`::button` is the real Markdown directive. The editor may offer autocomplete shortcuts such as `::button_icon` or `::button_full`, but those are snippet variants only. Selecting them inserts canonical `::button[...]` Markdown; writing `::button_icon` in source is treated as an unknown directive.

## `::button`

Attributes:

- `href`: required link target
- `variant`: `primary`, `secondary`, `outline`, `ghost`, or `link`
- `size`: `sm`, `md`, or `lg`
- `icon`: local icon reference such as `@fa-duotone/home`
- `iconPosition`: `left` or `right`
- `newTab`: open `href` in a new tab when `true`
- `ariaLabel`: accessible label for icon-only buttons

Defaults:

- `variant="primary"`
- `size="md"`
- `iconPosition="left"`
- `newTab="false"`

Buttons render as anchors. When `newTab` is true, the renderer adds `target="_blank"` and `rel="noopener noreferrer"`.

```md
::button[GitHub]{
  href="https://github.com/valkyrianlabs"
  icon="@brand/github"
  newTab=true
  variant="secondary"
}
```

Icon-only buttons require `ariaLabel`:

```md
::button[]{
  href="/settings"
  icon="@fa-duotone/gear"
  ariaLabel="Open settings"
}
```

## `:::buttons`

Attributes:

- `align`: `left`, `center`, or `right`
- `stack`: `mobile`, `always`, or `never`
- `gap`: `sm`, `md`, or `lg`

Defaults:

- `align="left"`
- `stack="mobile"`
- `gap="md"`

```md
:::buttons{
  align="center"
  stack="mobile"
  gap="md"
}
::button[Get Started]{
  href="/docs"
  variant="primary"
  icon="@fa-duotone/rocket"
}

::button[GitHub]{
  href="https://github.com/valkyrianlabs"
  variant="secondary"
  icon="@brand/github"
  newTab=true
}
:::
```

`:::buttons` is intended for buttons, but non-button Markdown children render normally.

## Icons

Button icons come from the local SVG icon packs configured in `payloadMarkdown({ icons })`. Markdown references use `@pack/name`; `.svg` is optional in source and omitted internally.

```md
::button[Docs]{
  href="/docs"
  icon="@fa-duotone/book-open"
}

::button[GitHub]{
  href="https://github.com/valkyrianlabs"
  icon="@brand/social/github"
  iconPosition="right"
}
```

Icon refs must stay within a configured pack. Unknown packs, missing SVG files, malformed refs, traversal with `..`, backslashes, and non-SVG targets produce diagnostics and render the button without the icon.

:::callout[Keep licensed icons local] {variant="warning"}
Paid or pro SVG icon files should remain in a local ignored folder such as `public/icons`. Do not commit those assets or make CI depend on them.
:::
