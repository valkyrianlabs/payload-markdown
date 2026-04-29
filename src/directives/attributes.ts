export type DirectiveAttributeValue = boolean | string

export type DirectiveAttributes = Record<string, DirectiveAttributeValue>

export type ParsedDirectiveLine = {
  attributes: DirectiveAttributes
  name: string
  rawAttributes?: string
  warnings: string[]
}

type TokenizeAttributesResult = {
  tokens: string[]
  warnings: string[]
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
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  )
    return value.slice(1, -1)

  return value
}

function tokenizeAttributes(value: string): TokenizeAttributesResult {
  const tokens: string[] = []
  const warnings: string[] = []
  let current = ''
  let quote: "'" | '"' | null = null

  for (const char of value) {
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

function appendClassName(attributes: DirectiveAttributes, className: string) {
  const existing = typeof attributes.class === 'string' ? attributes.class : ''
  attributes.class = [existing, className].filter(Boolean).join(' ')
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
      attributes[token] = true
      continue
    }

    const key = token.slice(0, equalIndex)
    const rawValue = token.slice(equalIndex + 1)

    if (!key) continue

    if (key === 'class') appendClassName(attributes, stripQuotes(rawValue))
    else attributes[key] = stripQuotes(rawValue)
  }

  return {
    attributes,
    warnings,
  }
}

export function parseDirectiveAttributes(value = ''): DirectiveAttributes {
  return parseDirectiveAttributesDetailed(value).attributes
}

export function parseDirectiveLine(text: string): null | ParsedDirectiveLine {
  const trimmed = text.trim()

  if (!trimmed.startsWith(':::')) return null

  const body = trimmed.slice(3)
  if (!body) return null

  const firstWhitespaceIndex = body.search(/\s/)
  const name = firstWhitespaceIndex < 0 ? body : body.slice(0, firstWhitespaceIndex)

  if (!/^[\w-]+$/.test(name)) return null

  const rawAttributes =
    firstWhitespaceIndex < 0 ? undefined : body.slice(firstWhitespaceIndex).trim()

  const attributes = parseDirectiveAttributesDetailed(rawAttributes)

  return {
    name,
    attributes: attributes.attributes,
    rawAttributes,
    warnings: attributes.warnings,
  }
}
