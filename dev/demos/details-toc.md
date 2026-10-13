# Details And Table Of Contents

Native disclosure blocks (`:::details`) in every theme, open and closed, with nested content; and generated tables of contents (`:::toc`) in every theme and at several depths. A TOC lists every heading in the document up to its depth, including the `h1`, as one flat list.

## Table Of Contents

### TOC: no attributes (default title, depth 3, default theme)

:::toc
:::

### TOC: theme="compact" with a custom label

:::toc[Contents]{theme="compact"}
:::

### TOC: theme="sidebar"

:::toc[On this page]{theme="sidebar"}
:::

### TOC: legacy title attribute

:::toc{
  title="Title from the title attribute"
  depth="2"
}
:::

### TOC: depth="1" (only the h1)

:::toc[Depth 1]{depth="1"}
:::

### TOC: depth="2"

:::toc[Depth 2]{
  depth="2"
  theme="compact"
}
:::

### TOC: depth="4"

:::toc[Depth 4]{
  depth="4"
  theme="sidebar"
}
:::

### TOC: depth="6" (every heading)

:::toc[Depth 6]{depth="6"}
:::

### TOC: a long label

:::toc[A deliberately long table of contents label that may wrap on small screens]{
  depth="2"
  theme="compact"
}
:::

## Details

### Details: closed, default theme

:::details[Closed by default]
This content is hidden until the summary is clicked.
:::

### Details: open="true", default theme

:::details[Open by default]{open="true"}
This content is visible on first render.
:::

### Details: no label (default summary text)

:::details
With no label the summary reads "Details".
:::

### Details: legacy title attribute

:::details{
  title="Title from the title attribute"
  open="true"
}
The older `title=""` form still sets the summary.
:::

### Details: theme="default", open

:::details[Default theme]{
  theme="default"
  open="true"
}
The default details theme uses the solid panel surface.
:::

### Details: theme="muted", open

:::details[Muted theme]{
  theme="muted"
  open="true"
}
The muted details theme uses a quieter panel.
:::

### Details: theme="glass", open

:::details[Glass theme]{
  theme="glass"
  open="true"
}
The glass details theme uses the translucent panel.
:::

### Details: every theme, closed

:::details[Default theme, closed]
Hidden.
:::

:::details[Muted theme, closed]{theme="muted"}
Hidden.
:::

:::details[Glass theme, closed]{theme="glass"}
Hidden.
:::

### Details: code and lists inside, open

:::details[Install from source]{open="true"}
1. Clone the repository.
2. Install dependencies.
3. Run:

```text
pnpm install
pnpm build
```

Unordered notes:

- Node 20 or newer
- pnpm 9
  - Corepack works too

```ts
export default buildConfig({
  plugins: [payloadMarkdown()],
})
```
:::

### Details: long body, glass, open

:::details[Migration notes for older versions]{
  theme="glass"
  open="true"
}
Migration notes often run long. This paragraph wraps across several lines so the padding inside the disclosure and the gap between the summary and the body can be judged at different widths.

A second paragraph with **bold**, *italic*, `inline code`, and a [link](/posts).

> A blockquote inside details.

| Old option | New option |
| --- | --- |
| `config.options.langs` | `code.langs` |
| `config.options.theme` | `code.shikiTheme` |

:::

### Details: nested details and a callout

:::details[Outer disclosure]{
  theme="muted"
  open="true"
}
The outer body.

:::details[Inner disclosure]{open="true"}
A details block nested inside another details block.
:::

:::callout[Inside details]{variant="warning"}
A callout nested inside details.
:::
:::

### Details: long summary text

:::details[A deliberately long summary line that should wrap onto a second line on narrow screens and keep the disclosure marker aligned]
Check how the disclosure marker aligns with a wrapped summary.
:::

### Details: stacked back to back

:::details[First of three]
One.
:::

:::details[Second of three]
Two.
:::

:::details[Third of three]
Three.
:::

## Sample Headings For The TOC

These headings give the tables of contents above some nested structure at depths 2 through 6.

### Getting Started

#### Requirements

Node and a Payload project.

#### Installation

Install the package.

### Configuration

#### Collections

Enable Markdown on collections.

##### Collection Scope

A level 5 heading.

###### Scope Precedence

A level 6 heading.

#### Themes

Register custom directive themes.

### Rendering

#### Server Component

Use `MarkdownRenderer`.

#### Headless Rendering

Use `renderMarkdown`.

## Duplicate Headings

### Install

The first heading named Install gets the id `install`.

### Install

The second one gets `install-1`, and the TOC links to both.

## Last Section

A final section so the TOC has a closing entry.
