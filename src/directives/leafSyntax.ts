import type { DirectiveAttributes } from './attributes.js'

import { parseDirectiveAttributesDetailed, readDirectiveLabel } from './attributes.js'

export type ParsedLeafDirectiveLine = {
  attributes: DirectiveAttributes
  label: string
  warnings: string[]
}

export function parseLeafDirectiveLine(
  text: string,
  name: string,
): null | ParsedLeafDirectiveLine {
  const trimmed = text.trim()
  const marker = `::${name}`

  if (!trimmed.startsWith(marker)) return null

  let rest = trimmed.slice(marker.length)
  if (rest && !/^[\s[{]/.test(rest)) return null

  rest = rest.trimStart()

  const labelResult = readDirectiveLabel(rest)
  if (!labelResult) return null

  const label = labelResult.label ?? ''
  rest = labelResult.rest.trimStart()

  const rawAttributes = rest
  if (rawAttributes && (!rawAttributes.startsWith('{') || !rawAttributes.endsWith('}')))
    return null

  const parsedAttributes = parseDirectiveAttributesDetailed(rawAttributes)

  return {
    attributes: parsedAttributes.attributes,
    label,
    warnings: parsedAttributes.warnings,
  }
}

/** Name of the leaf directive a `::name…` line starts with, if any. */
export function getLeafDirectiveName(text: string): string | undefined {
  const trimmed = text.trim()
  if (trimmed.startsWith(':::')) return undefined

  return trimmed.match(/^::([\w-]+)(?:$|[\s[{])/)?.[1]
}

/**
 * Diagnostic for a `::name` line that names a known leaf directive but cannot
 * be parsed (unclosed label, or text after the label that is not a `{…}`
 * attribute block). Returns `undefined` when the line parses.
 */
export function getLeafDirectiveProblem(text: string, name: string): string | undefined {
  if (parseLeafDirectiveLine(text, name)) return undefined

  return `Malformed "::${name}" directive. Expected ::${name}[Label]{…}; the line is rendered as text.`
}
