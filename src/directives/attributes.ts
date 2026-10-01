import { decodeDirectiveAttributeValue, directiveLabelToText } from './inlineText.js'

export type DirectiveAttributeValue = boolean | string

export type DirectiveAttributes = Record<string, DirectiveAttributeValue>

export type ParsedDirectiveLine = {
  attributes: DirectiveAttributes
  label?: string
  name: string
  rawAttributes?: string
  /**
   * Text after the marker that is neither a `{…}` attribute block nor
   * `key=value` / `#id` / `.class` tokens, such as prose that happens to start
   * with `:::name`. Such lines must not open a directive.
   */
  unexpectedText?: string
  warnings: string[]
}

type TokenizeAttributesResult = {
  tokens: string[]
  warnings: string[]
}

type BraceState = {
  depth: number
  hasBrace: boolean
}

function stripEnclosingBraces(value: string): { value: string; warnings: string[] } {
  const trimmed = value.trim()

  if (!trimmed) return { value: '', warnings: [] }

  if (trimmed.startsWith('{') && trimmed.endsWith('}'))
    return { value: trimmed.slice(1, -1).trim(), warnings: [] }

  if (trimmed.startsWith('{') || trimmed.endsWith('}'))
    return {
      value: trimmed.replace(/^\{/, '').replace(/\}$/, '').trim(),
      warnings: ['Malformed directive attributes: braces must be balanced.'],
    }

  return { value: trimmed, warnings: [] }
}

function stripQuotes(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  )
    return decodeDirectiveAttributeValue(value.slice(1, -1), value[0] as "'" | '"')

  return decodeDirectiveAttributeValue(value, null)
}

function tokenizeAttributes(value: string): TokenizeAttributesResult {
  const tokens: string[] = []
  const warnings: string[] = []
  let current = ''
  let escaped = false
  let quote: "'" | '"' | null = null

  for (const char of value) {
    if (escaped) {
      escaped = false
      current += char
      continue
    }

    if (char === '\\' && quote) {
      escaped = true
      current += char
      continue
    }

    if ((char === '"' || char === "'") && quote === null) {
      quote = char
      current += char
      continue
    }

    if (char === quote) {
      quote = null
      current += char
      continue
    }

    if (/\s/.test(char) && quote === null) {
      if (current) tokens.push(current)
      current = ''
      continue
    }

    current += char
  }

  if (current) tokens.push(current)
  if (quote) warnings.push('Malformed directive attributes: quoted value is not closed.')

  return { tokens, warnings }
}

/**
 * Assigns an own property even for keys such as `__proto__`, so authored
 * attribute names can never change the object's prototype and always show up
 * in `Object.keys` (and therefore in unknown-attribute diagnostics).
 */
function setAttribute(attributes: DirectiveAttributes, key: string, value: DirectiveAttributeValue) {
  Object.defineProperty(attributes, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  })
}

function appendClassName(attributes: DirectiveAttributes, className: string) {
  const existing = typeof attributes.class === 'string' ? attributes.class : ''
  attributes.class = [existing, className].filter(Boolean).join(' ')
}

export function getDirectiveAttributeBraceState(value: string): BraceState {
  let depth = 0
  let escaped = false
  let hasBrace = false
  let quote: "'" | '"' | null = null

  for (const char of value) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\' && quote) {
      escaped = true
      continue
    }

    if ((char === '"' || char === "'") && quote === null) {
      quote = char
      continue
    }

    if (char === quote) {
      quote = null
      continue
    }

    if (quote) continue

    if (char === '{') {
      hasBrace = true
      depth += 1
      continue
    }

    if (char === '}') {
      hasBrace = true
      depth = Math.max(0, depth - 1)
    }
  }

  return {
    depth,
    hasBrace,
  }
}

export function hasUnclosedDirectiveAttributeBlock(value: string): boolean {
  const state = getDirectiveAttributeBraceState(value)

  return state.hasBrace && state.depth > 0
}

export function parseDirectiveAttributesDetailed(value = ''): {
  attributes: DirectiveAttributes
  warnings: string[]
} {
  const stripped = stripEnclosingBraces(value)
  const warnings = [...stripped.warnings]

  if (!stripped.value)
    return {
      attributes: {},
      warnings,
    }

  const attributes: DirectiveAttributes = {}
  const tokenized = tokenizeAttributes(stripped.value)
  warnings.push(...tokenized.warnings)

  for (const token of tokenized.tokens) {
    if (token.startsWith('#') && token.length > 1) {
      attributes.id = token.slice(1)
      continue
    }

    if (token.startsWith('.') && token.length > 1) {
      appendClassName(attributes, token.slice(1))
      continue
    }

    const equalIndex = token.indexOf('=')

    if (equalIndex < 0) {
      setAttribute(attributes, token, true)
      continue
    }

    const key = token.slice(0, equalIndex)
    const rawValue = token.slice(equalIndex + 1)

    if (!key) continue

    if (key === 'class') appendClassName(attributes, stripQuotes(rawValue))
    else setAttribute(attributes, key, stripQuotes(rawValue))
  }

  return {
    attributes,
    warnings,
  }
}

export function parseDirectiveAttributes(value = ''): DirectiveAttributes {
  return parseDirectiveAttributesDetailed(value).attributes
}

/**
 * Finds the `]` that closes the `[` at index 0, allowing nested balanced
 * brackets and backslash escapes. Returns -1 when the label is not closed.
 */
export function findDirectiveLabelEnd(value: string): number {
  let depth = 0

  for (let index = 0; index < value.length; ++index) {
    const char = value[index]

    if (char === '\\') {
      index += 1
      continue
    }

    if (char === '[') depth += 1
    else if (char === ']') {
      depth -= 1
      if (depth === 0) return index
    }
  }

  return -1
}

/**
 * Splits `[label]rest` into the label's plain text and the remaining text.
 * Returns `undefined` for the label when `value` does not start with `[`, and
 * `null` when the label is not closed.
 */
export function readDirectiveLabel(
  value: string,
): { label: string | undefined; rest: string } | null {
  if (!value.startsWith('[')) return { label: undefined, rest: value }

  const labelEnd = findDirectiveLabelEnd(value)
  if (labelEnd < 0) return null

  return {
    label: directiveLabelToText(value.slice(1, labelEnd)),
    rest: value.slice(labelEnd + 1),
  }
}

function isAttributeShorthandToken(token: string): boolean {
  if (/^[#.]\S/.test(token)) return true

  const equalIndex = token.indexOf('=')

  return equalIndex > 0
}

function getUnexpectedText(rawAttributes: string | undefined): string | undefined {
  if (!rawAttributes) return undefined

  const trimmed = rawAttributes.trim()
  if (!trimmed || trimmed.startsWith('{')) return undefined

  const { tokens } = tokenizeAttributes(trimmed)

  return tokens.every(isAttributeShorthandToken) ? undefined : trimmed
}

export function parseDirectiveLine(text: string): null | ParsedDirectiveLine {
  const trimmed = text.trim()

  if (!trimmed.startsWith(':::')) return null

  let body = trimmed.slice(3)
  if (!body) return null

  const nameMatch = body.match(/^([\w-]+)/)
  const name = nameMatch?.[1]

  if (!name) return null

  body = body.slice(name.length).trimStart()

  const labelResult = readDirectiveLabel(body)
  if (!labelResult) return null

  const label = labelResult.label
  body = labelResult.rest.trimStart()

  const rawAttributes = body ? body : undefined
  const unexpectedText = getUnexpectedText(rawAttributes)

  if (unexpectedText)
    return {
      name,
      attributes: {},
      label,
      rawAttributes,
      unexpectedText,
      warnings: [],
    }

  const attributes = parseDirectiveAttributesDetailed(rawAttributes)

  return {
    name,
    attributes: attributes.attributes,
    label,
    rawAttributes,
    warnings: attributes.warnings,
  }
}
