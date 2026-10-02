import type { Content, Heading, PhrasingContent, Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'

export type HeadingAnchor = {
  depth: number
  id: string
  text: string
}

function phrasingToText(node: PhrasingContent, includeHtml: boolean): string {
  if (node.type === 'html' && !includeHtml) return ''
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node && Array.isArray(node.children))
    return node.children.map((child) => phrasingToText(child, includeHtml)).join('')

  return ''
}

/**
 * Text used to derive a heading's anchor slug. Inline HTML is included
 * verbatim, which is what anchors have always been generated from; changing
 * that would change existing URLs.
 */
export function headingToText(node: Heading): string {
  return node.children.map((child) => phrasingToText(child, true)).join('').trim()
}

/** Visible heading text used for TOC entries: inline HTML tags are dropped. */
export function headingToDisplayText(node: Heading): string {
  return node.children.map((child) => phrasingToText(child, false)).join('').trim()
}

export function slugifyHeading(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'section'
}

export type HeadingSlugger = {
  /** Marks an id as taken without returning it (for ids from other sources). */
  reserve: (id: string) => void
  /** Returns a slug for `text` that has not been returned before. */
  slug: (text: string) => string
}

/**
 * Stateful slugger used for heading anchors. Duplicate headings get `-1`,
 * `-2`, … suffixes as before, and every emitted id is tracked so a generated
 * suffix can never collide with a real heading (`Foo`, `Foo`, `Foo 1` gives
 * `foo`, `foo-1`, `foo-1-1`). Output for non-colliding headings is unchanged.
 */
export function createHeadingSlugger(): HeadingSlugger {
  const occurrences = new Map<string, number>()

  return {
    slug(text) {
      const original = slugifyHeading(text)
      let result = original

      while (occurrences.has(result)) {
        const next = (occurrences.get(original) ?? 0) + 1
        occurrences.set(original, next)
        result = `${original}-${next}`
      }

      occurrences.set(result, 0)

      return result
    },
    reserve(id) {
      if (!occurrences.has(id)) occurrences.set(id, 0)
    },
  }
}

function isHeading(node: Content): node is Heading {
  return node.type === 'heading'
}

function isContainerDirective(node: Content): node is ContainerDirective {
  return node.type === 'containerDirective'
}

function walkChildren(
  children: Content[],
  visitHeading: (heading: Heading) => void,
) {
  for (const child of children) {
    if (isHeading(child)) {
      visitHeading(child)
      continue
    }

    if (isContainerDirective(child)) walkChildren(child.children, visitHeading)
  }
}

export function collectHeadingAnchors(tree: Root): Array<{ anchor: HeadingAnchor; node: Heading }> {
  const slugger = createHeadingSlugger()
  const headings: Array<{ anchor: HeadingAnchor; node: Heading }> = []

  walkChildren(tree.children, (heading) => {
    headings.push({
      anchor: {
        id: slugger.slug(headingToText(heading)),
        depth: heading.depth,
        text: headingToDisplayText(heading),
      },
      node: heading,
    })
  })

  return headings
}

export function applyHeadingAnchors(tree: Root): HeadingAnchor[] {
  return collectHeadingAnchors(tree).map(({ anchor, node: heading }) => {
    const { id } = anchor
    const data = (heading.data ??= {})

    data.hProperties = {
      ...(data.hProperties ?? {}),
      id,
      dataHeadingAnchor: id,
    }

    return anchor
  })
}
