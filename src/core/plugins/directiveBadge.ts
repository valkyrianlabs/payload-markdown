import type { LeafDirective } from 'mdast-util-directive'

import { parseLeafDirectiveLine } from '../../directives/leafSyntax.js'
import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { resolveShieldsBadge } from '../../directives/shields.js'
import { getSafeHref } from '../../directives/urls.js'

type MessageFile = {
  message: (reason: string) => unknown
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

export function makeBadgeDirective(line: string, file: MessageFile): LeafDirective | undefined {
  const parsed = parseLeafDirectiveLine(line, 'badge')
  if (!parsed) return undefined

  const definition = layoutDirectiveRegistry.get('badge')
  const attributes = parsed.attributes
  const label = parsed.label.trim()
  const href = getSafeHref(getAttribute(attributes, 'href'))
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
