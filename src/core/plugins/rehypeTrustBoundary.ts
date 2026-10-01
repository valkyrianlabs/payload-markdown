import type { Element, Properties, Root } from 'hast'
import type { Plugin } from 'unified'

import { defaultSchema } from 'hast-util-sanitize'
import { visit } from 'unist-util-visit'

/**
 * Property used to tag elements created by the markdown pipeline (mdast to
 * hast) before `rehype-raw` parses author-supplied raw HTML. The value is a
 * per-render random nonce, so raw HTML cannot forge it.
 */
const PIPELINE_MARK_PROPERTY = 'dataPmdPipeline'

/** Same prefix rehype-sanitize uses by default (`defaultSchema.clobberPrefix`). */
export const RAW_HTML_CLOBBER_PREFIX = defaultSchema.clobberPrefix ?? 'user-content-'

const CLOBBER_PROPERTIES = defaultSchema.clobber ?? ['ariaDescribedBy', 'ariaLabelledBy', 'id', 'name']

function getDefaultAllowedProperties(tagName: string): Set<string> {
  const allowed = new Set<string>()
  const attributes = defaultSchema.attributes ?? {}

  for (const definition of [...(attributes['*'] ?? []), ...(attributes[tagName] ?? [])]) {
    const name = typeof definition === 'string' ? definition : definition[0]
    if (typeof name === 'string') allowed.add(name)
  }

  return allowed
}

const defaultAllowedPropertiesCache = new Map<string, Set<string>>()

function isDefaultAllowedProperty(tagName: string, property: string): boolean {
  let allowed = defaultAllowedPropertiesCache.get(tagName)

  if (!allowed) {
    allowed = getDefaultAllowedProperties(tagName)
    defaultAllowedPropertiesCache.set(tagName, allowed)
  }

  return allowed.has(property)
}

/**
 * `data-*` properties on raw-HTML elements are only kept when stock
 * rehype-sanitize would keep them. Everything else in the `data*` namespace is
 * reserved for pipeline markers (`data-vl-layout`, `data-href`,
 * `data-pmd-icon-ref`, tab and step hooks, …) that later stages trust.
 */
function isReservedMarkerProperty(tagName: string, property: string): boolean {
  return /^data[A-Z]/.test(property) && !isDefaultAllowedProperty(tagName, property)
}

function prefixClobberValue(value: Properties[string]): Properties[string] {
  if (typeof value === 'string')
    return value.startsWith(RAW_HTML_CLOBBER_PREFIX) ? value : `${RAW_HTML_CLOBBER_PREFIX}${value}`

  if (Array.isArray(value))
    return value.map((entry) =>
      typeof entry === 'string' && !entry.startsWith(RAW_HTML_CLOBBER_PREFIX)
        ? `${RAW_HTML_CLOBBER_PREFIX}${entry}`
        : entry,
    )

  if (typeof value === 'number') return `${RAW_HTML_CLOBBER_PREFIX}${value}`

  return value
}

function neutralizeRawHtmlElement(node: Element) {
  const properties = node.properties ?? {}

  for (const property of Object.keys(properties)) {
    if (isReservedMarkerProperty(node.tagName, property)) {
      delete properties[property]
      continue
    }

    if (CLOBBER_PROPERTIES.includes(property))
      properties[property] = prefixClobberValue(properties[property])
  }
}

export function createPipelineNonce(): string {
  return globalThis.crypto.randomUUID()
}

/**
 * Runs after remark-rehype and before rehype-raw: tags every element the
 * markdown pipeline produced with the render nonce.
 */
export const rehypeMarkPipelineElements: Plugin<[string], Root> = (nonce: string) => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      node.properties = { ...(node.properties ?? {}), [PIPELINE_MARK_PROPERTY]: nonce }
    })
  }
}

/**
 * Runs right after rehype-raw. Elements without the nonce came from author raw
 * HTML: their reserved marker attributes are removed so they cannot
 * impersonate directives (CORE-3), and their `id`/`name` values get the
 * standard `user-content-` clobber prefix (CORE-5). Pipeline-generated ids
 * (headings, footnotes, tabs) are left byte-identical.
 */
export const rehypeTrustBoundary: Plugin<[string], Root> = (nonce: string) => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const trusted = node.properties?.[PIPELINE_MARK_PROPERTY] === nonce

      if (node.properties) delete node.properties[PIPELINE_MARK_PROPERTY]
      if (!trusted) neutralizeRawHtmlElement(node)
    })
  }
}
