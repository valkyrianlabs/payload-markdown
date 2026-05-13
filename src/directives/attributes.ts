export type DirectiveAttributeValue = boolean | string

export type DirectiveAttributes = Record<string, DirectiveAttributeValue>

export type ParsedDirectiveLine = {
  attributes: DirectiveAttributes
  label?: string
  name: string
  rawAttributes?: string
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

  let body = trimmed.slice(3)
  if (!body) return null

  const nameMatch = body.match(/^([\w-]+)/)
  const name = nameMatch?.[1]

  if (!name) return null

  body = body.slice(name.length).trimStart()

  let label: string | undefined

  if (body.startsWith('[')) {
    const labelEnd = body.indexOf(']')
    if (labelEnd < 0) return null

    label = body.slice(1, labelEnd)
    body = body.slice(labelEnd + 1).trimStart()
  }

  const rawAttributes = body ? body : undefined

  const attributes = parseDirectiveAttributesDetailed(rawAttributes)

  return {
    name,
    attributes: attributes.attributes,
    label,
    rawAttributes,
    warnings: attributes.warnings,
  }
}
