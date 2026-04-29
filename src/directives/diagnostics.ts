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
  defaultValue?: string
  from: number
  line: number
  name: string
  tabCount?: number
  tabValues?: Map<string, number>
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

function getTabValue(attributes: Record<string, boolean | string> | undefined, index: number): string {
  const value = attributes?.value
  const label = attributes?.label
  const raw =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : typeof label === 'string' && label.trim()
        ? label.trim()
        : `tab-${index + 1}`

  return raw
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `tab-${index + 1}`
}

function finalizeTabsFrame(frame: OpenFrame): string[] {
  if (frame.name !== 'tabs') return []

  const diagnostics: string[] = []
  const tabValues = frame.tabValues ?? new Map<string, number>()

  if (!frame.tabCount) diagnostics.push('Directive "tabs" has no child "tab" directives.')

  for (const [value, count] of tabValues)
    if (count > 1) diagnostics.push(`Duplicate tab value "${value}" in "tabs".`)

  if (frame.defaultValue) {
    const defaultValue = getTabValue({ value: frame.defaultValue }, 0)
    if (!tabValues.has(defaultValue))
      diagnostics.push(`Invalid tabs default "${frame.defaultValue}". Falling back to the first tab.`)
  }

  return diagnostics
}

function findNearestTabsFrame(stack: OpenFrame[]): OpenFrame | undefined {
  for (let index = stack.length - 1; index >= 0; --index) {
    const frame = stack[index]
    if (frame.name === 'tabs') return frame
  }

  return undefined
}

function updateOpenStack(
  stack: OpenFrame[],
  text: string,
  line: number,
  from: number,
): string[] {
  const token = layoutDirectiveRegistry.parseMarkdownLineDetailed(text).token
  const diagnostics: string[] = []

  if (!token) return diagnostics

  if (token.action === 'open') {
    if (token.name === 'tab') {
      const tabsFrame = findNearestTabsFrame(stack)

      if (!tabsFrame) diagnostics.push('Directive "tab" is usually intended inside "tabs".')
      else {
        const nextIndex = tabsFrame.tabCount ?? 0
        const value = getTabValue(token.attributes, nextIndex)

        tabsFrame.tabCount = nextIndex + 1
        tabsFrame.tabValues ??= new Map<string, number>()
        tabsFrame.tabValues.set(value, (tabsFrame.tabValues.get(value) ?? 0) + 1)
      }
    }

    stack.push({
      name: token.name,
      from,
      line,
      ...(token.name === 'tabs'
        ? {
            defaultValue:
              typeof token.attributes?.default === 'string'
                ? token.attributes.default
                : undefined,
            tabCount: 0,
            tabValues: new Map<string, number>(),
          }
        : {}),
    })
    return diagnostics
  }

  if (token.action === 'close') {
    const frame = stack.pop()
    if (frame) diagnostics.push(...finalizeTabsFrame(frame))
    return diagnostics
  }

  if (token.action === 'closeGrid') {
    const index = findNearestFrameIndex(stack, (frame) =>
      layoutDirectiveRegistry.isGridName(frame.name),
    )

    if (index >= 0) {
      const frames = stack.splice(index)
      for (const frame of frames) diagnostics.push(...finalizeTabsFrame(frame))
    }
    return diagnostics
  }

  const index = findNearestFrameIndex(stack, (frame) => frame.name === 'section')
  if (index >= 0) {
    const frames = stack.splice(index)
    for (const frame of frames) diagnostics.push(...finalizeTabsFrame(frame))
  }
  return diagnostics
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

      for (const message of updateOpenStack(stack, trimmed, index + 1, markerFrom))
        diagnostics.push({
          from: markerFrom,
          line: index + 1,
          message,
          severity: 'warning',
          to: markerTo,
        })
    }

    offset += line.length + 1
  }

  for (const frame of stack) {
    for (const message of finalizeTabsFrame(frame))
      diagnostics.push({
        from: frame.from,
        line: frame.line,
        message,
        severity: 'warning',
        to: frame.from + frame.name.length + 3,
      })

    diagnostics.push({
      from: frame.from,
      line: frame.line,
      message: `Unclosed directive "${frame.name}".`,
      severity: 'warning',
      to: frame.from + frame.name.length + 3,
    })
  }

  return diagnostics
}
