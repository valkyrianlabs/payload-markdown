export type DirectiveAttributeValue = boolean | string

export type DirectiveAttributes = Record<string, DirectiveAttributeValue>

export type ParsedDirectiveLine = {
  attributes: DirectiveAttributes
  name: string
  rawAttributes?: string
}

function stripEnclosingBraces(value: string): string {
  const trimmed = value.trim()

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed.slice(1, -1).trim()

  return trimmed
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  )
    return value.slice(1, -1)

  return value
}

function tokenizeAttributes(value: string): string[] {
  const tokens: string[] = []
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

  return tokens
}

function appendClassName(attributes: DirectiveAttributes, className: string) {
  const existing = typeof attributes.class === 'string' ? attributes.class : ''
  attributes.class = [existing, className].filter(Boolean).join(' ')
}

export function parseDirectiveAttributes(value = ''): DirectiveAttributes {
  const body = stripEnclosingBraces(value)
  if (!body) return {}

  const attributes: DirectiveAttributes = {}

  for (const token of tokenizeAttributes(body)) {
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

  return attributes
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

  return {
    name,
    attributes: parseDirectiveAttributes(rawAttributes),
    rawAttributes,
  }
}
