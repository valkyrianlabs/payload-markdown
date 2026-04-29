import { layoutDirectiveRegistry } from './registry.js'
import { hasDirectiveTheme } from './themes.js'

export type DirectiveDiagnostic = {
  from: number
  line: number
  message: string
  severity: 'warning'
  to: number
}

type OpenFrame = {
  from: number
  line: number
  name: string
}

function isFenceLine(trimmed: string): boolean {
  return trimmed.startsWith('```') || trimmed.startsWith('~~~')
}

function findNearestFrameIndex(stack: OpenFrame[], predicate: (frame: OpenFrame) => boolean) {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (predicate(frame)) return index
  }

  return -1
}

function updateOpenStack(stack: OpenFrame[], text: string, line: number, from: number) {
  const result = layoutDirectiveRegistry.parseMarkdownLineDetailed(text)
  const token = result.token

  if (!token) return

  if (token.action === 'open') {
    stack.push({ name: token.name, from, line })
    return
  }

  if (token.action === 'close') {
    stack.pop()
    return
  }

  if (token.action === 'closeGrid') {
    const index = findNearestFrameIndex(stack, (frame) =>
      layoutDirectiveRegistry.isGridName(frame.name),
    )

    if (index >= 0) stack.splice(index)
    return
  }

  const index = findNearestFrameIndex(stack, (frame) => frame.name === 'section')
  if (index >= 0) stack.splice(index)
}

function getThemeDiagnostics(text: string): string[] {
  const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(text).token
  if (!token || token.action !== 'open') return []

  const definition = layoutDirectiveRegistry.get(token.name)
  if (!definition?.themeAttributes) return []

  const diagnostics: string[] = []

  for (const [attribute, groupName] of Object.entries(definition.themeAttributes)) {
    if (!groupName) continue

    const value = token.attributes?.[attribute]
    if (typeof value !== 'string' || !value.trim()) continue
    if (hasDirectiveTheme(groupName, value)) continue

    const label = attribute === 'theme' ? 'theme' : attribute
    diagnostics.push(
      `Unknown ${label} "${value}" on "${token.name}". Falling back to "default".`,
    )
  }

  return diagnostics
}

export function lintMarkdownDirectives(markdown: string): DirectiveDiagnostic[] {
  const diagnostics: DirectiveDiagnostic[] = []
  const stack: OpenFrame[] = []
  const lines = markdown.split(/\r?\n/)
  let offset = 0
  let inFence = false

  for (let index = 0; index < lines.length; ++index) {
    const line = lines[index]
    const trimmed = line.trim()
    const lineStart = offset
    const markerStart = line.indexOf(':::')
    const markerFrom = markerStart >= 0 ? lineStart + markerStart : lineStart
    const markerTo = lineStart + line.length

    if (isFenceLine(trimmed)) {
      inFence = !inFence
      offset += line.length + 1
      continue
    }

    if (!inFence && trimmed.startsWith(':::')) {
      const result = layoutDirectiveRegistry.parseMarkdownLineDetailed(trimmed)

      for (const message of result.diagnostics)
        diagnostics.push({
          from: markerFrom,
          line: index + 1,
          message,
          severity: 'warning',
          to: markerTo,
        })

      for (const message of getThemeDiagnostics(trimmed))
        diagnostics.push({
          from: markerFrom,
          line: index + 1,
          message,
          severity: 'warning',
          to: markerTo,
        })

      updateOpenStack(stack, trimmed, index + 1, markerFrom)
    }

    offset += line.length + 1
  }

  for (const frame of stack)
    diagnostics.push({
      from: frame.from,
      line: frame.line,
      message: `Unclosed directive "${frame.name}".`,
      severity: 'warning',
      to: frame.from + frame.name.length + 3,
    })

  return diagnostics
}
