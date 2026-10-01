import { defaultSchema } from 'hast-util-sanitize'

/**
 * Protocols allowed in `href` values. This is the exact list `rehype-sanitize`
 * enforces on authored markdown links, so directive links follow the same
 * policy as ordinary links.
 */
export const SAFE_HREF_PROTOCOLS: readonly string[] = defaultSchema.protocols?.href ?? [
  'http',
  'https',
  'irc',
  'ircs',
  'mailto',
  'xmpp',
]

/**
 * Mirrors `hast-util-sanitize`'s protocol check: relative URLs (no colon, or a
 * colon after the first `/`, `?` or `#`) are allowed; absolute URLs must use a
 * protocol from `protocols`, compared case-sensitively. Anything else
 * (`javascript:`, `data:`, `JavaScript:`, `java\tscript:` …) is rejected.
 */
export function isSafeUrl(value: string, protocols: readonly string[] = SAFE_HREF_PROTOCOLS): boolean {
  const url = String(value)
  const colon = url.indexOf(':')
  const questionMark = url.indexOf('?')
  const numberSign = url.indexOf('#')
  const slash = url.indexOf('/')

  if (
    colon < 0 ||
    (slash > -1 && colon > slash) ||
    (questionMark > -1 && colon > questionMark) ||
    (numberSign > -1 && colon > numberSign)
  )
    return true

  return protocols.some(
    (protocol) => colon === protocol.length && url.slice(0, protocol.length) === protocol,
  )
}

export function isSafeHref(value: string): boolean {
  return isSafeUrl(value, SAFE_HREF_PROTOCOLS)
}

/** Returns the trimmed href when it is safe, otherwise `undefined`. */
export function getSafeHref(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  return isSafeHref(trimmed) ? trimmed : undefined
}

export function getUnsafeHrefWarnings(
  directiveName: string,
  attributes: Record<string, boolean | string>,
): string[] {
  const href = attributes.href

  if (typeof href !== 'string' || !href.trim()) return []
  if (isSafeHref(href.trim())) return []

  return [
    `Unsafe href on "${directiveName}": only relative URLs and ${SAFE_HREF_PROTOCOLS.join(', ')} links are allowed. The link was removed.`,
  ]
}
