import type { Paragraph, PhrasingContent, Root, RootContent, Text } from 'mdast'
import type { LeafDirective } from 'mdast-util-directive'
import type { Plugin } from 'unified'

import type { MarkdownRenderConfig } from '../../types/core.js'

import { hasUnclosedDirectiveAttributeBlock } from '../../directives/attributes.js'
import { parseButtonDirectiveLine } from '../../directives/buttonSyntax.js'
import {
  DEFAULT_BUTTON_ICON_POSITION,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  isButtonIconPosition,
  isButtonSize,
  isButtonVariant,
} from '../../directives/definitions/button.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { normalizePayloadMarkdownIconRef } from '../../icons/refs.js'

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

function getLeafDirectiveName(text: string): string | undefined {
  const trimmed = text.trim()
  if (trimmed.startsWith(':::')) return undefined

  const match = trimmed.match(/^::([\w-]+)(?:$|[\s[{])/)

  return match?.[1]
}

function makeIconPlaceholder(icon: string, iconPosition: 'left' | 'right') {
  const normalized = normalizePayloadMarkdownIconRef(icon)
  const iconKey = normalized.icon?.key ?? icon

  return {
    type: 'element' as const,
    children: [],
    properties: {
      ariaHidden: 'true',
      className: [
        'pmd-button__icon',
        `pmd-button__icon--${iconPosition}`,
      ],
      dataPmdIcon: iconKey,
      dataPmdIconRef: icon,
      focusable: 'false',
    },
    tagName: 'span',
  }
}

function makeButtonDirective(
  line: string,
  file: MessageFile,
  _config: MarkdownRenderConfig,
): LeafDirective | undefined {
  const parsed = parseButtonDirectiveLine(line)
  if (!parsed) return undefined

  const definition = layoutDirectiveRegistry.get('button')
  const attributes = parsed.attributes
  const label = parsed.label.trim()
  const href = getAttribute(attributes, 'href')
  const variant = isButtonVariant(attributes.variant) ? attributes.variant : DEFAULT_BUTTON_VARIANT
  const size = isButtonSize(attributes.size) ? attributes.size : DEFAULT_BUTTON_SIZE
  const iconPosition = isButtonIconPosition(attributes.iconPosition)
    ? attributes.iconPosition
    : DEFAULT_BUTTON_ICON_POSITION
  const icon = getAttribute(attributes, 'icon')
  const ariaLabel = getAttribute(attributes, 'ariaLabel')
  const newTab = getBooleanAttribute(attributes, 'newTab')

  for (const warning of parsed.warnings) file.message(warning)
  for (const warning of definition?.validateAttributes?.({ name: 'button', attributes }) ?? [])
    file.message(warning)

  if (icon) {
    const normalized = normalizePayloadMarkdownIconRef(icon)
    if (normalized.warning) file.message(normalized.warning)
  }

  if (!label && !ariaLabel) file.message('Icon-only button requires an ariaLabel attribute.')

  const hChildren = [
    ...(icon && iconPosition === 'left' ? [makeIconPlaceholder(icon, iconPosition)] : []),
    ...(label
      ? [
          {
            type: 'text' as const,
            value: label,
          },
        ]
      : []),
    ...(icon && iconPosition === 'right' ? [makeIconPlaceholder(icon, iconPosition)] : []),
  ]

  return {
    name: 'button',
    type: 'leafDirective',
    attributes: Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [key, String(value)]),
    ),
    children: label ? [{ type: 'text', value: label }] : [],
    data: {
      hChildren,
      hName: 'a',
      hProperties: {
        ...(ariaLabel ? { ariaLabel } : {}),
        className: [
          'pmd-button',
          `pmd-button--${variant}`,
          `pmd-button--${size}`,
        ],
        dataButton: '',
        dataDirective: 'button',
        dataIconPosition: icon ? iconPosition : undefined,
        dataSize: size,
        dataVariant: variant,
        href,
        ...(newTab
          ? {
              rel: 'noopener noreferrer',
              target: '_blank',
            }
          : {}),
      },
    },
  }
}

function splitParagraphButtonDirectives(
  node: Paragraph,
  file: MessageFile,
  config: MarkdownRenderConfig,
): RootContent[] {
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
    const button = expanded ? makeButtonDirective(expanded.text, file, config) : undefined

    if (!button) {
      const leafName = text ? getLeafDirectiveName(text) : undefined
      if (leafName && leafName !== 'button') file.message(`Unknown directive "${leafName}".`)

      appendParagraphLine(paragraphLines, lineChildren)
      continue
    }

    flushParagraph()
    out.push(button as RootContent)
    index = expanded?.endIndex ?? index
  }

  flushParagraph()

  return out.length > 0 ? out : [node]
}

export const remarkButtonDirectives: Plugin<[MarkdownRenderConfig?], Root> = (
  config: MarkdownRenderConfig = {},
) => {
  return (tree, file) => {
    tree.children = tree.children.flatMap((node): RootContent[] => {
      if (!isParagraph(node)) return [node]

      return splitParagraphButtonDirectives(node, file, config)
    })
  }
}
