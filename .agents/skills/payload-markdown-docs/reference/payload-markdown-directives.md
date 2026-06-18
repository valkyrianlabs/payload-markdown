# Payload Markdown Directives

Use directives to make docs clearer while keeping Markdown readable in Git.

## Table Of Contents

```markdown
:::toc {title="On this page" depth="3" theme="compact"}
:::
```

Use near the top of long reference or configuration pages.

## Callout

```markdown
:::callout {variant="warning" title="Server-owned authority"}
The request may ask. The Payload plugin decides.
:::
```

Use for warnings, notes, tips, and important constraints.

## Details

```markdown
:::details {title="Advanced notes"}
Optional deeper explanation.
:::
```

Use for advanced or secondary material.

## Steps

```markdown
:::steps {variant="cards" layout="stack" numbered stepTheme="glass"}

### Generate keys

Run keygen.

### Configure Payload

Add the public key.

:::
```

Use for ordered procedures.

## Cards

```markdown
:::cards {columns="3" cardTheme="glass"}

:::card {title="Signed sync" href="/workflow/signed-push"}
Upload docs with signed requests.
:::

:::card {title="Route adapter" href="/frontend/route-adapter"}
Render docs without turning them into Pages.
:::

:::
```

Use cards for overview pages and choice sets.

## Buttons

```markdown
:::buttons{align="left" stack="mobile" gap="md"}
::button[Read Docs]{href="/getting-started" variant="primary"}
::button[GitHub]{href="https://github.com/valkyrianlabs" variant="secondary" newTab=true}
:::
```

Use buttons for clear calls to action. `::button` is a leaf directive and should include `href`.

## Badges

```markdown
:::badges{
  align="left"
  gap="md"
  wrap=true
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"
}
::badge[build]{
  type="github"
  target="workflow"
  repo="valkyrianlabs/payload-markdown"
  workflow="deploy.yml"
}
:::
```

Use `::badge` for individual `img.shields.io` badges and `:::badges` to group them. Prefer curated resolvers:

- `type="static"` with `label`, `message`, and `color`
- `type="npm"` with `target="version"`, `target="downloads"`, or `target="license"` and `package`
- `type="github" target="workflow"` with `repo` and `workflow`
- `type="github"` with `target="release"`, `target="license"`, or `target="stars"` and `repo`
- `type="debian" target="version"` with `package`
- `type="apt"` as an alias for `type="debian"`

Use `path` only for uncovered Shields paths and `src` only for full `https://img.shields.io` URLs.

## Gotchas

- Do not invent directive names.
- Keep blank lines around nested directive content.
- Use `:::steps` for procedures.
- Use `:::cards` for overview grids.
- Use `::badge` and `:::badges` for Shields badges.
- Use `:::callout` for warnings, tips, and notes.
- Prefer root-relative docs links in directive attributes, such as `href="/workflow/signed-push"`.
