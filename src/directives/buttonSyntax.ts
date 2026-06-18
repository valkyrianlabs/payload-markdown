import type { DirectiveAttributes } from './attributes.js'

import { parseLeafDirectiveLine } from './leafSyntax.js'

export type ParsedButtonDirectiveLine = {
  attributes: DirectiveAttributes
  label: string
  warnings: string[]
}

export function parseButtonDirectiveLine(text: string): null | ParsedButtonDirectiveLine {
  return parseLeafDirectiveLine(text, 'button')
}
