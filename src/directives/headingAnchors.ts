import type { Content, Heading, PhrasingContent, Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'

export type HeadingAnchor = {
  depth: number
  id: string
  text: string
}

function phrasingToText(node: PhrasingContent): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node && Array.isArray(node.children))
    return node.children.map(phrasingToText).join('')

  return ''
}

export function headingToText(node: Heading): string {
  return node.children.map(phrasingToText).join('').trim()
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

function makeUniqueSlug(base: string, counts: Map<string, number>): string {
  const count = counts.get(base) ?? 0
  counts.set(base, count + 1)

  return count === 0 ? base : `${base}-${count}`
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

export function applyHeadingAnchors(tree: Root): HeadingAnchor[] {
  const counts = new Map<string, number>()
  const headings: HeadingAnchor[] = []

  walkChildren(tree.children, (heading) => {
    const text = headingToText(heading)
    const id = makeUniqueSlug(slugifyHeading(text), counts)
    const data = (heading.data ??= {})

    data.hProperties = {
      ...(data.hProperties ?? {}),
      id,
      dataHeadingAnchor: id,
    }

    headings.push({
      id,
      depth: heading.depth,
      text,
    })
  })

  return headings
}
