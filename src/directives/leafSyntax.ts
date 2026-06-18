import type { DirectiveAttributes } from './attributes.js'

import { parseDirectiveAttributesDetailed } from './attributes.js'

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
  let label = ''

  if (rest.startsWith('[')) {
    const labelEnd = rest.indexOf(']')
    if (labelEnd < 0) return null

    label = rest.slice(1, labelEnd)
    rest = rest.slice(labelEnd + 1).trimStart()
  }

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
