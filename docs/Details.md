# Details

Use `:::details` for optional or advanced content. It renders native `<details>` and `<summary>` markup.

```md
:::details {title="Advanced notes" theme="glass" open="true"}
These steps are only needed when running from source.
:::
```

## Attributes

- `title`: summary text
- `open`: use `open="true"` to render initially open
- `theme`: details theme name

Defaults:

- `title="Details"`
- `theme="default"`

## Native Behavior

The directive uses browser-native disclosure behavior. It does not require client-side hydration.

## Markdown Content

````md
:::details {title="Install from source"}
1. Clone the repository.
2. Install dependencies.
3. Run:

```bash
pnpm build
```
:::
````

## Themes

Built-in details themes:

- `default`
- `muted`
- `glass`
