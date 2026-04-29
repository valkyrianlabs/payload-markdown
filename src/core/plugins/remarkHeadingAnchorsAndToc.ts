import type { Link, List, ListItem, Paragraph, Root } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { visit } from 'unist-util-visit'

import type { HeadingAnchor } from '../../directives/headingAnchors.js'

import { resolveTocDepth, resolveTocTitle } from '../../directives/definitions/toc.js'
import { applyHeadingAnchors } from '../../directives/headingAnchors.js'

function isContainerDirective(node: unknown): node is ContainerDirective {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'type' in node &&
      (node as { type?: string }).type === 'containerDirective',
  )
}

function makeParagraph(value: string): Paragraph {
  return {
    type: 'paragraph',
    children: [{ type: 'text', value }],
  }
}

function makeTocLink(heading: HeadingAnchor): Link {
  return {
    type: 'link',
    children: [{ type: 'text', value: heading.text }],
    url: `#${heading.id}`,
  }
}

function makeTocList(headings: HeadingAnchor[]): List {
  return {
    type: 'list',
    children: headings.map(
      (heading): ListItem => ({
        type: 'listItem',
        children: [
          {
            type: 'paragraph',
            children: [makeTocLink(heading)],
          },
        ],
        spread: false,
      }),
    ),
    ordered: true,
    spread: false,
  }
}

function applyTocContent(tree: Root, headings: HeadingAnchor[]) {
  visit(tree, (node) => {
    if (!isContainerDirective(node) || node.name !== 'toc') return

    const depth = resolveTocDepth(node)
    const title = resolveTocTitle(node)
    const visibleHeadings = headings.filter((heading) => heading.depth <= depth)

    node.children = [makeParagraph(title), makeTocList(visibleHeadings)]
  })
}

export const remarkHeadingAnchorsAndToc: Plugin<[], Root> = () => {
  return (tree) => {
    const headings = applyHeadingAnchors(tree)

    applyTocContent(tree, headings)
  }
}
