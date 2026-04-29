import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

const layoutMarkdown = `
# Directive Regression

Intro paragraph outside any directive.

:::section
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
