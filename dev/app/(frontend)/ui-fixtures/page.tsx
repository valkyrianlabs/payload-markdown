import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

/**
 * Visual fixtures for the e2e suite (dev/e2e.spec.ts): the same directives in
 * each colour scheme, consumer overrides, and grids at several container
 * widths. `?theme=light|dark` switches the page theme (components/ThemeScript).
 */

const SAMPLE = `
## Fixture heading

Body paragraph with a [body link](#body) and \`inline code\`.

:::toc
:::

:::cards{columns="2"}

:::card[Card title]{eyebrow="Eyebrow" href="#card"}
Card body with a [card link](#card-link).
:::

:::card[Cyan card]{theme="cyan"}
Cyan body text.
:::

:::

:::callout[Note title]{variant="note"}
Note body text.
:::

:::callout[Info title]{variant="info"}
Info body text.
:::

:::callout[Tip title]{variant="tip"}
Tip body with a [callout link](#callout).
:::

:::callout[Warning title]{variant="warning"}
Warning body text.
:::

:::callout[Danger title]{variant="danger"}
Danger body text.
:::

:::callout[Success title]{variant="success"}
Success body text.
:::

:::tabs

:::tab[First tab]
First panel text.
:::

:::tab[Second tab]
Second panel text.
:::

:::tab[Off]{disabled}
Disabled panel.
:::

:::

:::details[Details summary]{open="true"}
Details body text.

\`\`\`bash
echo nested
\`\`\`
:::

:::steps{variant="cards" layout="grid" columns="2"}

### Step title

Step body text.

### Second step

Second step text.

:::

| Column | Value |
| --- | ---: |
| Cell | 1 |

\`\`\`bash
pnpm add payload-markdown
\`\`\`

:::buttons
::button[Primary]{href="#primary"}
::button[Secondary]{href="#secondary" variant="secondary"}
::button[Outline]{href="#outline" variant="outline"}
::button[Ghost]{href="#ghost" variant="ghost"}
::button[Link]{href="#link" variant="link"}
:::
`

const GRID = `
:::cards{columns="4"}
:::card[One]
1
:::
:::card[Two]
2
:::
:::card[Three]
3
:::
:::card[Four]
4
:::
:::
`

// Public tokens are scheme-agnostic, so a consumer sets one value per scheme.
const OVERRIDE_TOKENS =
  '[--pmd-surface:#fdf2f8] dark:[--pmd-surface:#2a0f1d] [--pmd-accent:#be185d] dark:[--pmd-accent:#f9a8d4] [--pmd-code-bg:#0b1021]'

export default function UiFixtures() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-16 px-6 py-12">
      <section data-testid="scheme-auto">
        <MarkdownRenderer markdown={SAMPLE} />
      </section>

      <section className="bg-neutral-950 p-6" data-testid="scheme-dark">
        <MarkdownRenderer colorScheme="dark" markdown={SAMPLE} />
      </section>

      <section className="bg-white p-6" data-testid="scheme-light">
        <MarkdownRenderer colorScheme="light" markdown={SAMPLE} />
      </section>

      <section className={OVERRIDE_TOKENS} data-testid="overrides">
        <MarkdownRenderer
          className="prose-a:font-bold"
          markdown={`${SAMPLE}\n\n:::card[Brand card]{theme="brand"}\nBrand body.\n:::`}
          themes={{
            card: [
              {
                name: 'brand',
                classes: 'rounded-none border-2 border-pink-500 bg-pink-100 p-5 dark:bg-pink-950',
              },
            ],
          }}
        />
      </section>

      {[1000, 700, 360].map((width) => (
        <section data-testid={`grid-${width}`} key={width} style={{ width }}>
          <MarkdownRenderer markdown={GRID} />
        </section>
      ))}
    </main>
  )
}
