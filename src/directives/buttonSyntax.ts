import type { DirectiveAttributes } from './attributes.js'

import { parseDirectiveAttributesDetailed } from './attributes.js'

export type ParsedButtonDirectiveLine = {
  attributes: DirectiveAttributes
  label: string
  warnings: string[]
}

export function parseButtonDirectiveLine(text: string): null | ParsedButtonDirectiveLine {
  const trimmed = text.trim()
  if (!trimmed.startsWith(':button')) return null

  let rest = trimmed.slice(':button'.length).trimStart()
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
