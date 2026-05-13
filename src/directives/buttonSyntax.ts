import type { DirectiveAttributes } from './attributes.js'

import { parseDirectiveAttributesDetailed } from './attributes.js'

export type ParsedButtonDirectiveLine = {
  attributes: DirectiveAttributes
  label: string
  warnings: string[]
}

const BUTTON_LEAF_MARKER = '::button'

export function parseButtonDirectiveLine(text: string): null | ParsedButtonDirectiveLine {
  const trimmed = text.trim()
  if (!trimmed.startsWith(BUTTON_LEAF_MARKER)) return null

  let rest = trimmed.slice(BUTTON_LEAF_MARKER.length)
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
