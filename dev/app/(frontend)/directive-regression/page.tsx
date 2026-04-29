import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

const layoutMarkdown = `
# Directive Regression

Intro paragraph outside any directive.

:::toc {theme="compact"}
:::

:::toc {title="Guide contents" depth="2"}
:::

## Install

Duplicate heading one.

## Install

Duplicate heading two.

:::callout {theme="soft"}
Default note callout with **strong Markdown** inside.
:::

:::callout {variant="info" title="Information"}
Info callout body with a [link](https://example.com).
:::

:::callout {variant="tip" title="Tip"}
- Keep directives small.
- Keep tests semantic.

:::

:::callout {variant="warning" title="Read this first"}
Do not skip the migration notes.
:::

:::callout {variant="danger" title="Danger"}
Destructive operations need review.
:::

:::callout {variant="success" title="Success"}
The static directive path rendered correctly.
:::

:::details {theme="glass" title="Advanced install notes"}
These steps are only needed when running from source.

1. Install dependencies.
2. Start the dev server.

:::

:::cards {columns="3" theme="spacious" cardTheme="glass"}

:::card {eyebrow="Field" title="Markdown Field" href="/docs/markdown-field"}
Portable Markdown content with **live preview**.
:::

:::card {eyebrow="Layout" title="Layout Directives" theme="cyan"}
Use structured Markdown without turning content into JSON soup.
:::

:::card {eyebrow="Docs" title="Docs Mode" theme="violet"}
TOC, anchors, callouts, details, steps, and cards.
:::

:::

:::cards {columns="2" theme="compact" cardTheme="muted"}

:::card {title="Nested callout"}
:::callout {variant="tip" title="Inside a card"}
Nested directives render safely.
:::
:::

:::card {title="Nested details" href="/docs/details"}
:::details {title="Inside details"}
Details inside card content.
:::
:::

:::

:::card {theme="emerald" title="Standalone Card" href="/docs/standalone-card"}
Standalone cards render safely outside a cards grid.
:::

:::steps

### Install the package

\`\`\`bash
pnpm add @valkyrianlabs/payload-markdown
\`\`\`

### Register the plugin

Add it to \`payload.config.ts\`.

### Render the field

Use the server renderer.

:::

:::steps {variant="default"}

### Confirm default rendering

Explicit default variant keeps the ordered docs flow.

:::

:::steps {variant="cards"}

### Create content

Write the Markdown source.

### Preview output

Check the rendered preview.

### Publish

Publish the page.

:::

:::steps {variant="cards" layout="stack" stepTheme="cyan"}

### Plan the content

Map the docs flow before writing.

:::

:::steps {variant="cards" layout="grid" columns="2" stepTheme="glass"}

### Add nested callout

:::callout {variant="tip" title="Nested step callout"}
Nested callouts remain readable inside numbered step cards.
:::

### Publish the page

\`\`\`bash
pnpm build
\`\`\`

:::

:::steps {variant="cards" layout="grid" columns="2" numbered="false"}

### Optional first step

Number markers can be suppressed.

### Optional second step

Grid layout still works without visible numbers.

:::

:::section {theme="panel"}
## Section Scope

Section paragraph.

:::2col
### Column One
Alpha

### Column Two
Beta
:::endcol

Section tail.
:::endsection

After section paragraph.

## Three Column Group

:::3col
### First
One

### Second
Two

### Third
Three
:::endcol

:::cell
### Explicit Cell
Cell content remains stable.
:::
`

const edgeCaseMarkdown = `
:::unknown

Unknown directive should remain authored text.

:::callout {variant="weird" title="Fallback"}
Invalid variants should fall back safely.
:::

:::details {title="Broken"
Malformed details attributes should warn without crashing.
:::

:::toc {depth="bad"}
:::

:::cards {columns="invalid" theme="not-real" cardTheme="missing"}

:::card {title="Fallback columns" theme="missing" unknown="true"}
Invalid columns and unknown card attributes should not crash.
:::

:::

:::steps {mode="bad" variant="cards" layout="diagonal" columns="wide" numbered="maybe"}
### Safe malformed steps
Unknown attributes should not crash.
:::

\`\`\`ts
const marker = ':::section'
console.log(marker)
\`\`\`

## Unterminated Group

:::2col
### First
Alpha

### Second
Beta
`

export default function DirectiveRegressionPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <section data-testid="directive-fixture">
        <MarkdownRenderer
          markdown={layoutMarkdown}
          options={{
            langs: ['text', 'ts'],
          }}
          variant="docs"
        />
      </section>

      <section data-testid="directive-edge-cases">
        <MarkdownRenderer
          markdown={edgeCaseMarkdown}
          options={{
            langs: ['text', 'ts'],
          }}
          variant="docs"
        />
      </section>
    </main>
  )
}
