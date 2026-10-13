# Tabs

Tabs in every container theme (`default`, `muted`, `glass`, `underline`, `pills`) and every panel theme (`default`, `muted`, `glass`), with `default` selection, code, lists, nested directives, disabled tabs, and enough tabs to wrap. Shell commands use `text` fences because `bash` is not in the default Shiki language set.

## Basics

### Tabs: no attributes (first tab selected)

:::tabs

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: default="npm"

:::tabs{default="npm"}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: default matches a label instead of a value

:::tabs{default="Details"}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: labels from the label attribute and derived values

:::tabs

:::tab{label="Legacy label attribute"}
Uses `label=""` instead of `[Label]`; the value is derived from the label.
:::

:::tab[Derived Value]
No `value` attribute: the renderer derives `derived-value`.
:::

:::

## Container Themes

### Tabs: theme="default"

:::tabs{
  default="pnpm"
  theme="default"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: theme="muted"

:::tabs{
  default="pnpm"
  theme="muted"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: theme="glass"

:::tabs{
  default="pnpm"
  theme="glass"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: theme="underline"

:::tabs{
  default="pnpm"
  theme="underline"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

### Tabs: theme="pills"

:::tabs{
  default="pnpm"
  theme="pills"
}

:::tab[pnpm]{value="pnpm"}
```bash
pnpm add @valkyrianlabs/payload-markdown
```
:::

:::tab[npm]{value="npm"}
```bash
npm install @valkyrianlabs/payload-markdown
```
:::

:::tab[yarn]{value="yarn"}
```bash
yarn add @valkyrianlabs/payload-markdown
```
:::

:::tab[bun]{value="bun"}
```bash
bun add @valkyrianlabs/payload-markdown
```
:::

:::

## Panel Themes (tabTheme)

### Tabs: tabTheme="default"

:::tabs{tabTheme="default"}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: tabTheme="muted"

:::tabs{tabTheme="muted"}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: tabTheme="glass"

:::tabs{tabTheme="glass"}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

## Container And Panel Theme Combinations

### Tabs: theme="default" tabTheme="muted"

:::tabs{
  theme="default"
  tabTheme="muted"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="default" tabTheme="glass"

:::tabs{
  theme="default"
  tabTheme="glass"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="muted" tabTheme="muted"

:::tabs{
  theme="muted"
  tabTheme="muted"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="muted" tabTheme="glass"

:::tabs{
  theme="muted"
  tabTheme="glass"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="glass" tabTheme="muted"

:::tabs{
  theme="glass"
  tabTheme="muted"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="glass" tabTheme="glass"

:::tabs{
  theme="glass"
  tabTheme="glass"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="underline" tabTheme="muted"

:::tabs{
  theme="underline"
  tabTheme="muted"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="underline" tabTheme="glass"

:::tabs{
  theme="underline"
  tabTheme="glass"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="pills" tabTheme="muted"

:::tabs{
  theme="pills"
  tabTheme="muted"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: theme="pills" tabTheme="glass"

:::tabs{
  theme="pills"
  tabTheme="glass"
}

:::tab[Overview]{value="overview"}
Tabs render accessible server HTML. The selected panel holds **prose**, a [link](/posts), and `inline code`.
:::

:::tab[Details]{value="details"}
A second panel with different content.
:::

:::tab[More]{value="more"}
A third panel.
:::

:::

### Tabs: per-tab theme overrides tabTheme

:::tabs{
  theme="glass"
  tabTheme="muted"
}

:::tab[Inherits muted]{value="inherits"}
This panel takes `tabTheme="muted"` from the container.
:::

:::tab[Glass override]{
  value="glass"
  theme="glass"
}
This panel sets `theme="glass"` itself.
:::

:::tab[Default override]{
  value="default-panel"
  theme="default"
}
This panel sets `theme="default"` itself.
:::

:::

## Content

### Tabs: code in several languages

:::tabs{
  default="ts"
  theme="glass"
}

:::tab[TypeScript]{value="ts"}
```ts
payloadMarkdown({
  collections: { posts: true },
})
```
:::

:::tab[TSX]{value="tsx"}
```tsx
<MarkdownRenderer collectionSlug="posts" markdown={post.content} />
```
:::

:::tab[JSON]{value="json"}
```json
{ "dependencies": { "@valkyrianlabs/payload-markdown": "^1.7.2" } }
```
:::

:::tab[Long line]{value="long"}
```ts
export const aVeryLongLineInsideATabPanel = 'This line is wider than the tab panel so the code block should scroll horizontally inside the panel without stretching the tabs container.'
```
:::

:::

### Tabs: lists, paragraphs, and code mixed

:::tabs{tabTheme="muted"}

:::tab[Checklist]{value="checklist"}
Before you publish:

- [x] Write the post
- [ ] Add a cover image
- [ ] Proofread

1. Save
2. Preview
3. Publish

:::

:::tab[Mixed]{value="mixed"}
A paragraph, then a list, then code.

- One
- Two
  - Nested

```ts
const mixed = true
```

A paragraph after the code.
:::

:::tab[Table]{value="table"}
| Manager | Command |
| --- | --- |
| pnpm | `pnpm add` |
| npm | `npm install` |

:::

:::

### Tabs: nested directives in panels

:::tabs{theme="glass"}

:::tab[Callout]{value="callout"}
:::callout[Portable content]{variant="tip"}
Tabs still store as plain Markdown directives.
:::
:::

:::tab[Details]{value="details"}
:::details[Tab details]
Native details still work inside tabs.
:::
:::

:::tab[Cards]{value="cards"}
:::cards{columns="2"}

:::card[Tab card]{icon="@fa-duotone/server"}
Cards render inside tab panels.
:::

:::card[Another card]{
  icon="@fa-duotone/laptop"
  theme="cyan"
}
A second card.
:::

:::
:::

:::tab[Steps]{value="steps"}
:::steps{
  variant="cards"
  layout="grid"
  columns="2"
}

### First

Step one.

### Second

Step two.

:::
:::

:::

### Tabs: panels of very different heights

:::tabs

:::tab[Short]{value="short"}
One line.
:::

:::tab[Tall]{value="tall"}
A tall panel.

Paragraph two.

Paragraph three.

Paragraph four.

Paragraph five.
:::

:::

## Disabled Tabs

### Tabs: a disabled tab (bare attribute)

:::tabs

:::tab[Available]{value="available"}
This tab is enabled.
:::

:::tab[Coming soon]{
  value="soon"
  disabled
}
Content can stay in source while the trigger is disabled.
:::

:::tab[Also available]{value="also"}
Another enabled tab.
:::

:::

### Tabs: disabled="true" and disabled="false"

:::tabs{theme="pills"}

:::tab[Enabled]{
  value="enabled"
  disabled="false"
}
`disabled="false"` keeps the tab enabled.
:::

:::tab[Disabled]{
  value="disabled"
  disabled="true"
}
`disabled="true"` disables the trigger.
:::

:::

### Tabs: first tab disabled (second is selected)

:::tabs{theme="underline"}

:::tab[Disabled first]{
  value="first"
  disabled
}
Hidden because the first enabled tab is selected instead.
:::

:::tab[Selected]{value="selected"}
The first enabled tab is selected by default.
:::

:::

## Many Tabs

### Tabs: twelve tabs that wrap (default theme)

:::tabs

:::tab[pnpm]{value="tab-1"}
Instructions for **pnpm**.
:::

:::tab[npm]{value="tab-2"}
Instructions for **npm**.
:::

:::tab[yarn]{value="tab-3"}
Instructions for **yarn**.
:::

:::tab[bun]{value="tab-4"}
Instructions for **bun**.
:::

:::tab[deno]{value="tab-5"}
Instructions for **deno**.
:::

:::tab[Docker]{value="tab-6"}
Instructions for **Docker**.
:::

:::tab[Kubernetes]{value="tab-7"}
Instructions for **Kubernetes**.
:::

:::tab[Homebrew]{value="tab-8"}
Instructions for **Homebrew**.
:::

:::tab[apt]{value="tab-9"}
Instructions for **apt**.
:::

:::tab[Nix]{value="tab-10"}
Instructions for **Nix**.
:::

:::tab[Windows (winget)]{value="tab-11"}
Instructions for **Windows (winget)**.
:::

:::tab[From source]{value="tab-12"}
Instructions for **From source**.
:::

:::

### Tabs: twelve tabs that wrap (pills)

:::tabs{theme="pills"}

:::tab[pnpm]{value="tab-1"}
Instructions for **pnpm**.
:::

:::tab[npm]{value="tab-2"}
Instructions for **npm**.
:::

:::tab[yarn]{value="tab-3"}
Instructions for **yarn**.
:::

:::tab[bun]{value="tab-4"}
Instructions for **bun**.
:::

:::tab[deno]{value="tab-5"}
Instructions for **deno**.
:::

:::tab[Docker]{value="tab-6"}
Instructions for **Docker**.
:::

:::tab[Kubernetes]{value="tab-7"}
Instructions for **Kubernetes**.
:::

:::tab[Homebrew]{value="tab-8"}
Instructions for **Homebrew**.
:::

:::tab[apt]{value="tab-9"}
Instructions for **apt**.
:::

:::tab[Nix]{value="tab-10"}
Instructions for **Nix**.
:::

:::tab[Windows (winget)]{value="tab-11"}
Instructions for **Windows (winget)**.
:::

:::tab[From source]{value="tab-12"}
Instructions for **From source**.
:::

:::

### Tabs: twelve tabs that wrap (underline)

:::tabs{theme="underline"}

:::tab[pnpm]{value="tab-1"}
Instructions for **pnpm**.
:::

:::tab[npm]{value="tab-2"}
Instructions for **npm**.
:::

:::tab[yarn]{value="tab-3"}
Instructions for **yarn**.
:::

:::tab[bun]{value="tab-4"}
Instructions for **bun**.
:::

:::tab[deno]{value="tab-5"}
Instructions for **deno**.
:::

:::tab[Docker]{value="tab-6"}
Instructions for **Docker**.
:::

:::tab[Kubernetes]{value="tab-7"}
Instructions for **Kubernetes**.
:::

:::tab[Homebrew]{value="tab-8"}
Instructions for **Homebrew**.
:::

:::tab[apt]{value="tab-9"}
Instructions for **apt**.
:::

:::tab[Nix]{value="tab-10"}
Instructions for **Nix**.
:::

:::tab[Windows (winget)]{value="tab-11"}
Instructions for **Windows (winget)**.
:::

:::tab[From source]{value="tab-12"}
Instructions for **From source**.
:::

:::

### Tabs: long tab labels

:::tabs{theme="glass"}

:::tab[A deliberately long tab label number one]{value="long-1"}
First.
:::

:::tab[Another rather long tab label for wrapping]{value="long-2"}
Second.
:::

:::tab[Third long label to force a wrap on mobile]{value="long-3"}
Third.
:::

:::

### Tabs: a single tab

:::tabs

:::tab[Only tab]{value="only"}
A tabs block with one tab.
:::

:::
