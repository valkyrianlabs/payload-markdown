# Tabs

Use `:::tabs` with child `:::tab` directives for package-manager examples, feature comparisons, and compact docs sections.

````md
:::tabs {default="pnpm" theme="glass"}

:::tab {label="pnpm" value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab {label="npm" value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::
````

## `:::tabs`

Attributes:

- `default`: selected tab value on first render
- `theme`: tabs container theme
- `tabTheme`: default child tab panel theme

When `default` is missing or does not match a child tab value, the first tab is selected.

## `:::tab`

Attributes:

- `label`: visible tab label
- `value`: stable tab identity
- `theme`: tab panel theme
- `disabled`: optional disabled trigger state

If `value` is missing, the renderer derives one from `label`. If both are missing, it generates a safe fallback.

## Nested Markdown

Tab panels support normal Markdown, code fences, and nested directives:

````md
:::tabs {default="install"}

:::tab {label="Install" value="install"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab {label="Notes" value="notes"}
:::callout {variant="tip" title="Portable content"}
Tabs still store as plain Markdown directives.
:::
:::

:::
````

## Interactivity and Accessibility

Tabs render accessible server HTML with `role="tablist"`, `role="tab"`, and `role="tabpanel"`.

The renderer progressively enhances tabs on the client:

- clicking a trigger switches panels
- arrow keys move between triggers
- Home and End jump to the first and last triggers
- Enter and Space activate a focused trigger

There is no URL hash or cross-page tab sync yet.

## Themes

Built-in tabs container themes:

- `default`
- `muted`
- `glass`
- `underline`
- `pills`

Built-in tab panel themes:

- `default`
- `muted`
- `glass`
