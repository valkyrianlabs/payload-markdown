# Typography

This page exercises plain Markdown and GFM with no directives, so the base prose styles can be audited on their own. Every section below is labelled with what it tests.

## Headings

# Heading level 1

## Heading level 2

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6

## Headings Followed By Text

### A level 3 heading directly above a paragraph

The spacing between a heading and the first paragraph under it should feel tight but not cramped.

#### A level 4 heading directly above a paragraph

Smaller headings should still separate clearly from body text.

##### A level 5 heading directly above a paragraph

Level 5 and 6 headings often end up the same size as body text; check that they still read as headings.

###### A level 6 heading directly above a paragraph

The smallest heading level, directly above a paragraph.

## Inline Formatting

A paragraph with **bold text**, *italic text*, ***bold italic text***, ~~strikethrough text~~, and `inline code`. It also has a [relative link](/posts), an [external link](https://payloadcms.com), and an autolinked URL: https://github.com/valkyrianlabs/payload-markdown.

Inline formatting combined: **bold with `code` inside**, *italic with a [link](/posts) inside*, ~~struck with **bold** inside~~, and a [link with `code` in its label](/posts).

A line ending with two trailing spaces  
forces a hard line break, and this sentence starts on a new line.

Escaped characters stay literal: \*not italic\*, \`not code\`, and \[not a link\](/nowhere).

## Long Paragraph

Portable Markdown is valuable precisely because it stays boring: a plain text file that any editor can open, any diff tool can compare, and any reviewer can read without a rendering step. The renderer's job is to make that boring source look deliberate on the page, which means the measure, the line height, the paragraph spacing, and the contrast of the body text all matter far more than any individual component. This paragraph is intentionally long so that the line length, the rhythm of wrapped lines, and the vertical spacing between this paragraph and its neighbours can be judged at desktop and mobile widths. If the measure is too wide the eye loses its place when returning to the start of the next line; if it is too narrow the text feels choppy and the paragraph becomes a tall, thin column. Look for inconsistent word spacing, awkward widows, and any place where inline elements such as `code spans`, **bold phrases**, or [links](/posts) disturb the line height of the surrounding text.

A short paragraph follows the long one.

## Unordered List

- First item
- Second item with **bold** and `code`
- Third item with a [link](/posts)
- A longer item that wraps onto multiple lines so the hanging indent and the alignment of the wrapped text with the first line can be checked at narrow widths.

## Ordered List

1. First step
2. Second step
3. Third step
4. Fourth step
5. Fifth step
6. Sixth step
7. Seventh step
8. Eighth step
9. Ninth step
10. Tenth step, where the marker becomes two digits

## Ordered List Starting At 7

7. Seventh
8. Eighth
9. Ninth

## Nested Lists

- Level one
  - Level two
    - Level three
      - Level four
  - Back to level two
- Level one again
  1. Ordered inside unordered
  2. Second ordered child
     - Unordered inside ordered inside unordered

1. Ordered level one
   1. Ordered level two
      1. Ordered level three
2. Ordered level one again
   - Unordered child

## Loose List With Paragraphs

- A loose list item with a paragraph.

  A second paragraph inside the same list item.

- Another loose item.

  ```ts
  const insideAList = true
  ```

- A final loose item.

## List Directly After A Paragraph

This paragraph is immediately followed by a list with no heading in between:
- Item one
- Item two
- Item three

And an ordered list straight after a paragraph:
1. One
2. Two
3. Three

## List Directly After A Heading

- Item directly under a heading
- Second item
- Third item

### Ordered List Directly After A Heading

1. Ordered item directly under a heading
2. Second ordered item

## Task List

- [x] Completed task
- [ ] Open task
- [ ] Open task with **bold** and `code`
- [x] Completed task with a [link](/posts)
  - [ ] Nested open task
  - [x] Nested completed task

## Blockquote

> A single-paragraph blockquote. Quotes should be visually distinct from body text without overpowering it.

## Multi-Paragraph Blockquote

> The first paragraph of a longer quote, which wraps across multiple lines so that the quote border and the text indentation can be compared over several lines of text.
>
> A second paragraph inside the same quote, with **bold**, *italic*, and `code`.
>
> — Attribution line

## Blockquote With Nested Content

> ### A heading inside a quote
>
> - A list inside a quote
> - Second item
>
> > A nested blockquote.
>
> ```ts
> const quoted = 'code inside a quote'
> ```

## Horizontal Rule

Text above the rule.

---

Text below the rule.

***

Text below a second rule written with asterisks.

## Table

| Feature | Status | Notes |
| --- | --- | --- |
| Markdown field | Stable | Portable content with live preview |
| Directives | Stable | Callouts, cards, steps, tabs, and layout |
| Code highlighting | Stable | Shiki, server rendered |

## Table With Alignment

| Left aligned | Centered | Right aligned |
| :--- | :---: | ---: |
| apple | 1 | $1.00 |
| banana | 22 | $22.50 |
| cherry with a much longer cell value | 333 | $333.75 |
| `inline code` | **bold** | [link](/posts) |

## Wide Table

| Column 1 | Column 2 | Column 3 | Column 4 | Column 5 | Column 6 | Column 7 | Column 8 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A fairly long value | Another long value | More content here | Even more content | Keep going | Still going | Nearly there | Last column value |
| short | short | short | short | short | short | short | short |

## Image

![A placeholder landscape image](https://picsum.photos/seed/pmd/1200/600)

## Image Inside A Paragraph

Text before the image ![A small inline image](https://picsum.photos/seed/pmd/120/60) and text after it in the same paragraph.

## Linked Image

[![A linked placeholder image](https://picsum.photos/seed/pmd/600/300)](https://picsum.photos)

## Footnotes

Footnotes are supported through GFM.[^first] A second reference uses a named label.[^named-note] Referencing the first note again reuses its number.[^first]

[^first]: The first footnote, with **bold** and `code`.

[^named-note]: A named footnote. Footnotes render in a list at the end of the document.

## Code: TypeScript

```ts
import { payloadMarkdown } from '@valkyrianlabs/payload-markdown'

export default buildConfig({
  plugins: [
    payloadMarkdown({
      collections: {
        posts: true,
      },
    }),
  ],
})
```

## Code: TSX

```tsx
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/server'

export function Post({ post }: { post: { content: string } }) {
  return <MarkdownRenderer collectionSlug="posts" markdown={post.content} />
}
```

## Code: JSON

```json
{
  "name": "@valkyrianlabs/payload-markdown",
  "private": false,
  "version": "1.7.2",
  "peerDependencies": {
    "payload": "^3.0.0"
  },
  "keywords": ["payload", "markdown", "directives"]
}
```

## Code: Shell Commands (Plain Text Fence)

`bash` is not in the default Shiki language set, so shell commands use a plain `text` fence here.

```bash
pnpm add @valkyrianlabs/payload-markdown
pnpm dev
```

## Code: YAML

```yaml
name: deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
```

## Code: CSS

```css
.vl-md-card {
  border-radius: 1rem;
  padding: 1.25rem;
}
```

## Code: No Language

```
A fence with no language renders as plain text.
  Indentation is preserved.
```

## Code: Single Line

```ts
export const answer = 42
```

## Code: Ten Or More Lines (Two-Digit Line Numbers)

```ts
const lines = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
]
```

## Code: Blank Lines Inside A Block

```ts
const first = 1

const second = 2


const afterTwoBlankLines = 3
```

## Code: Fence Meta Is Ignored

The renderer does not read fence meta (titles, highlighted lines), so this block should look identical to a plain `ts` fence.

```ts title="payload.config.ts" {2}
const highlighted = false
const titleShown = false
```

## Code: Very Long Line (Horizontal Scroll)

```ts
export const veryLongLine = 'This single line is intentionally far wider than any reasonable content column so the code block must scroll horizontally instead of wrapping or overflowing the page layout; keep going past the edge of the container to be sure the scrollbar appears and the line numbers stay fixed in place while scrolling.'
```

## Code: Long Unbroken Token

```text
https://example.com/a/really/long/url/without/any/spaces/that/cannot/wrap/naturally/and/must/scroll/horizontally/inside/the/code/block/container/abcdefghijklmnopqrstuvwxyz0123456789
```

## Inline Code With A Long Token

A paragraph with a long inline code token `@valkyrianlabs/payload-markdown/server/renderers/MarkdownRendererWithAVeryLongName` that may need to wrap on narrow screens.

## End Of Page

A final paragraph so the spacing after the last block can be checked.
