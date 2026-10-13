# Steps

Steps in the default ordered-list variant and the `cards` variant (stack and grid layouts), numbered and unnumbered, in every steps wrapper theme and every `stepTheme` (card themes), with nested code blocks and directives. Steps are grouped by `h2`, `h3`, or `h4` headings inside the directive.

## Default Variant

### Steps: default variant, no attributes

:::steps

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: explicit variant="default"

:::steps{variant="default"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: default variant with long content and code

:::steps

### Install the package

Install the plugin with your package manager. This paragraph is long enough to wrap so the alignment of wrapped lines with the step heading can be checked against the list marker.

```text
pnpm add @valkyrianlabs/payload-markdown
```

### Register the plugin

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

export default buildConfig({
  plugins: [payloadMarkdown({ collections: { posts: true } })],
})
```

- A list inside a step
- Second item

### Render the field

:::callout[Remember collectionSlug]{variant="warning"}
Pass `collectionSlug` when collection-scoped config should apply.
:::

### A step with only a heading

:::

### Steps: default variant, ten steps (two-digit markers)

:::steps

### Step number 1

Body for step 1.

### Step number 2

Body for step 2.

### Step number 3

Body for step 3.

### Step number 4

Body for step 4.

### Step number 5

Body for step 5.

### Step number 6

Body for step 6.

### Step number 7

Body for step 7.

### Step number 8

Body for step 8.

### Step number 9

Body for step 9.

### Step number 10

Body for step 10.

:::

### Steps: default variant split on h2 and h4 headings

:::steps

## A step from an h2

Steps also split on `h2` headings.

#### A step from an h4

And on `h4` headings.

:::

## Default Variant: Wrapper Themes

### Steps: default variant, theme="default"

:::steps{theme="default"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: default variant, theme="muted"

:::steps{theme="muted"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: default variant, theme="glass"

:::steps{theme="glass"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: default variant, theme="cyan"

:::steps{theme="cyan"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

## Cards Variant: Stack

### Steps: cards, no layout (defaults to stack, numbered)

:::steps{variant="cards"}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards, layout="stack", numbered (bare attribute)

:::steps{
  variant="cards"
  layout="stack"
  numbered
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards, layout="stack", numbered="false"

:::steps{
  variant="cards"
  layout="stack"
  numbered="false"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

## Cards Variant: Grid

### Steps: cards grid, columns="1"

:::steps{
  variant="cards"
  layout="grid"
  columns="1"
}

### Grid step 1

Step 1 of 2 in a `columns="1"` grid.

### Grid step 2

Step 2 of 2 in a `columns="1"` grid.

:::

### Steps: cards grid, columns="2"

:::steps{
  variant="cards"
  layout="grid"
  columns="2"
}

### Grid step 1

Step 1 of 4 in a `columns="2"` grid.

### Grid step 2

Step 2 of 4 in a `columns="2"` grid.

### Grid step 3

Step 3 of 4 in a `columns="2"` grid.

### Grid step 4

Step 4 of 4 in a `columns="2"` grid.

:::

### Steps: cards grid, columns="3"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
}

### Grid step 1

Step 1 of 6 in a `columns="3"` grid.

### Grid step 2

Step 2 of 6 in a `columns="3"` grid.

### Grid step 3

Step 3 of 6 in a `columns="3"` grid.

### Grid step 4

Step 4 of 6 in a `columns="3"` grid.

### Grid step 5

Step 5 of 6 in a `columns="3"` grid.

### Grid step 6

Step 6 of 6 in a `columns="3"` grid.

:::

### Steps: cards grid, columns="4"

:::steps{
  variant="cards"
  layout="grid"
  columns="4"
}

### Grid step 1

Step 1 of 8 in a `columns="4"` grid.

### Grid step 2

Step 2 of 8 in a `columns="4"` grid.

### Grid step 3

Step 3 of 8 in a `columns="4"` grid.

### Grid step 4

Step 4 of 8 in a `columns="4"` grid.

### Grid step 5

Step 5 of 8 in a `columns="4"` grid.

### Grid step 6

Step 6 of 8 in a `columns="4"` grid.

### Grid step 7

Step 7 of 8 in a `columns="4"` grid.

### Grid step 8

Step 8 of 8 in a `columns="4"` grid.

:::

### Steps: cards grid, columns="auto"

:::steps{
  variant="cards"
  layout="grid"
  columns="auto"
}

### Grid step 1

Step 1 of 5 in a `columns="auto"` grid.

### Grid step 2

Step 2 of 5 in a `columns="auto"` grid.

### Grid step 3

Step 3 of 5 in a `columns="auto"` grid.

### Grid step 4

Step 4 of 5 in a `columns="auto"` grid.

### Grid step 5

Step 5 of 5 in a `columns="auto"` grid.

:::

### Steps: cards grid, default columns (2)

:::steps{
  variant="cards"
  layout="grid"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

### Publish

Publish the post.

:::

### Steps: cards grid, numbered="false"

:::steps{
  variant="cards"
  layout="grid"
  columns="2"
  numbered="false"
}

### Optional first step

Number markers can be suppressed.

### Optional second step

Grid layout still works without visible numbers.

:::

### Steps: cards grid with unequal content

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
}

### Short

One line.

### Long

A much longer step body that wraps over several lines so this card is taller than the others. Check how the shorter cards in the same row stretch.

### Medium

Two sentences here. Enough to wrap once.

:::

## Cards Variant: Wrapper Themes

### Steps: cards stack, theme="default"

:::steps{
  variant="cards"
  theme="default"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards stack, theme="muted"

:::steps{
  variant="cards"
  theme="muted"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards stack, theme="glass"

:::steps{
  variant="cards"
  theme="glass"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards stack, theme="cyan"

:::steps{
  variant="cards"
  theme="cyan"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

## Cards Variant: Step Themes

### Steps: cards grid, stepTheme="default"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="default"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="muted"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="muted"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="glass"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="glass"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="cyan"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="cyan"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="violet"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="violet"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="emerald"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="emerald"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="amber"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="amber"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: cards grid, stepTheme="danger"

:::steps{
  variant="cards"
  layout="grid"
  columns="3"
  stepTheme="danger"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

## Combined Themes

### Steps: theme="glass" with stepTheme="cyan"

:::steps{
  variant="cards"
  layout="stack"
  theme="glass"
  stepTheme="cyan"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

### Steps: theme="cyan" with stepTheme="glass" grid

:::steps{
  variant="cards"
  layout="grid"
  columns="2"
  theme="cyan"
  stepTheme="glass"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

### Ship

Deploy the site.

:::

### Steps: theme="muted" with stepTheme="muted"

:::steps{
  variant="cards"
  theme="muted"
  stepTheme="muted"
}

### Install

Add the package to your project.

### Configure

Register the plugin in your Payload config.

### Render

Render Markdown with the server component.

:::

## Nested Content

### Steps: cards stack with code blocks and directives

:::steps{
  variant="cards"
  layout="stack"
  stepTheme="glass"
}

### Install

```text
pnpm add @valkyrianlabs/payload-markdown
```

### Configure

```ts
payloadMarkdown({
  collections: {
    posts: {
      config: { options: { lineNumbers: true } },
    },
  },
})
```

:::callout[Use scoped config]{variant="tip"}
Use collection-scoped config for posts.
:::

### Verify

:::details[What should I see?]
A rendered post with highlighted code and themed directives.
:::

- Open `/posts`
- Pick a post

### Ship

```json
{ "scripts": { "build": "next build" } }
```

:::

### Steps: cards grid with code that scrolls horizontally

:::steps{
  variant="cards"
  layout="grid"
  columns="2"
}

### Long command

```text
pnpm dlx some-long-cli-name --with-a-flag --and-another-flag=value --and-yet-another-flag=another-value
```

### Short command

```text
pnpm dev
```

:::
