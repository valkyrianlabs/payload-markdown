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

## Gotchas

- Do not invent directive names.
- Keep blank lines around nested directive content.
- Use `:::steps` for procedures.
- Use `:::cards` for overview grids.
- Use `:::callout` for warnings, tips, and notes.
- Prefer root-relative docs links in directive attributes, such as `href="/workflow/signed-push"`.
