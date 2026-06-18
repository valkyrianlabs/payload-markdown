import type { Paragraph, PhrasingContent, Root, RootContent, Text } from 'mdast'
import type { LeafDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import { hasUnclosedDirectiveAttributeBlock } from '../../directives/attributes.js'
import { parseLeafDirectiveLine } from '../../directives/leafSyntax.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { resolveShieldsBadge } from '../../directives/shields.js'

type MessageFile = {
  message: (reason: string) => unknown
}

function isParagraph(node: RootContent): node is Paragraph {
  return node.type === 'paragraph'
}

function isText(node: Paragraph['children'][number]): node is Text {
  return node.type === 'text'
}

function makeText(value: string): Text {
  return {
    type: 'text',
    value,
  }
}

function splitParagraphLines(node: Paragraph): PhrasingContent[][] {
  const lines: PhrasingContent[][] = [[]]
  const currentLine = () => lines[lines.length - 1]

  for (const child of node.children) {
    if (!isText(child)) {
      currentLine().push(child)
      continue
    }

    const parts = child.value.split(/\r?\n/)

    for (let index = 0; index < parts.length; ++index) {
      if (index > 0) lines.push([])
      if (parts[index]) currentLine().push(makeText(parts[index]))
    }
  }

  return lines
}

function collectExpandedDirectiveText(
  lines: PhrasingContent[][],
  startIndex: number,
): { endIndex: number; text: string } | null {
  const firstText = getTextOnlyLine(lines[startIndex])

  if (!firstText) return null
  if (!hasUnclosedDirectiveAttributeBlock(firstText))
    return {
      endIndex: startIndex,
      text: firstText,
    }

  let text = firstText

  for (let index = startIndex + 1; index < lines.length; ++index) {
    const nextText = getTextOnlyLine(lines[index])

    if (nextText === null) break
    if (nextText.trim().startsWith('::')) break

    text += `\n${nextText}`

    if (!hasUnclosedDirectiveAttributeBlock(text))
      return {
        endIndex: index,
        text,
      }
  }

  return {
    endIndex: startIndex,
    text: firstText,
  }
}

function phrasingToText(node: PhrasingContent): null | string {
  if (node.type === 'text') return node.value
  if (node.type === 'inlineCode') return node.value
  if ('children' in node && Array.isArray(node.children)) {
    const values = node.children.map((child) => phrasingToText(child))

    return values.every((value): value is string => typeof value === 'string')
      ? values.join('')
      : null
  }

  return null
}

function getTextOnlyLine(children: PhrasingContent[]): null | string {
  const values = children.map((child) => phrasingToText(child))

  if (!values.every((value): value is string => typeof value === 'string')) return null

  return values.join('')
}

function appendParagraphLine(lines: PhrasingContent[][], children: PhrasingContent[]) {
  if (lines.length > 0) lines.push([makeText('\n'), ...children])
  else lines.push(children)
}

function flattenParagraphLines(lines: PhrasingContent[][]): PhrasingContent[] {
  return lines.flat()
}

function getAttribute(attributes: Record<string, boolean | string>, name: string): string | undefined {
  const value = attributes[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getBooleanAttribute(attributes: Record<string, boolean | string>, name: string): boolean {
  const value = attributes[name]

  if (value === true) return true
  if (typeof value !== 'string') return false

  return value === 'true'
}

function stringifyAttributes(attributes: Record<string, boolean | string>): Record<string, string> {
  return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, String(value)]))
}

function makeBadgeImageProperties(src: string, alt: string, includeDirective: boolean) {
  return {
    alt,
    className: ['pmd-badge'],
    ...(includeDirective ? { dataDirective: 'badge' } : {}),
    src,
  }
}

function makeBadgeDirective(line: string, file: MessageFile): LeafDirective | undefined {
  const parsed = parseLeafDirectiveLine(line, 'badge')
  if (!parsed) return undefined

  const definition = layoutDirectiveRegistry.get('badge')
  const attributes = parsed.attributes
  const label = parsed.label.trim()
  const href = getAttribute(attributes, 'href')
  const newTab = getBooleanAttribute(attributes, 'newTab')
  const alt = getAttribute(attributes, 'alt') ?? label

  for (const warning of parsed.warnings) file.message(warning)
  for (const warning of definition?.validateAttributes?.({ name: 'badge', attributes }) ?? [])
    file.message(warning)

  const resolved = resolveShieldsBadge(attributes)

  for (const warning of resolved.warnings) file.message(warning)
  if (!resolved.src) return undefined

  const imgProperties = makeBadgeImageProperties(resolved.src, alt, !href)

  return {
    name: 'badge',
    type: 'leafDirective',
    attributes: stringifyAttributes(attributes),
    children: label ? [{ type: 'text', value: label }] : [],
    data: href
      ? {
          hChildren: [
            {
              type: 'element' as const,
              children: [],
              properties: imgProperties,
              tagName: 'img',
            },
          ],
          hName: 'a',
          hProperties: {
            className: ['pmd-badge-link'],
            dataDirective: 'badge',
            href,
            ...(newTab
              ? {
                  rel: 'noopener noreferrer',
                  target: '_blank',
                }
              : {}),
          },
        }
      : {
          hName: 'img',
          hProperties: imgProperties,
        },
  }
}

function splitParagraphBadgeDirectives(node: Paragraph, file: MessageFile): RootContent[] {
  const out: RootContent[] = []
  let paragraphLines: PhrasingContent[][] = []

  const flushParagraph = () => {
    const children = flattenParagraphLines(paragraphLines)

    if (children.length > 0) out.push({ type: 'paragraph', children })

    paragraphLines = []
  }

  const lines = splitParagraphLines(node)

  for (let index = 0; index < lines.length; ++index) {
    const lineChildren = lines[index]
    const text = getTextOnlyLine(lineChildren)
    const expanded = text ? collectExpandedDirectiveText(lines, index) : null
    const badge = expanded ? makeBadgeDirective(expanded.text, file) : undefined

    if (!badge) {
      appendParagraphLine(paragraphLines, lineChildren)
      continue
    }

    flushParagraph()
    out.push(badge as RootContent)
    index = expanded?.endIndex ?? index
  }

  flushParagraph()

  return out.length > 0 ? out : [node]
}

export const remarkBadgeDirectives: Plugin<[], Root> = () => {
  return (tree, file) => {
    tree.children = tree.children.flatMap((node): RootContent[] => {
      if (!isParagraph(node)) return [node]

      return splitParagraphBadgeDirectives(node, file)
    })
  }
}
