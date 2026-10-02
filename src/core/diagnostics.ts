/**
 * Structured render diagnostics.
 *
 * Pipeline stages report through `reportDiagnostic`, which records the
 * message on the unified VFile with a source category, an optional stable
 * code and, when the stage knows it, a 1-based source position. The render
 * API turns the VFile messages into `RenderDiagnostic` objects; the legacy
 * `warnings: string[]` is the list of their messages, in the same order.
 */

export type RenderDiagnosticSeverity = 'error' | 'info' | 'warning'

export type RenderDiagnosticSource = 'code' | 'directive' | 'icon' | 'render' | 'theme'

export type RenderDiagnostic = {
  /** Stable machine-readable identifier, present for a subset of diagnostics. */
  code?: string
  /** 1-based column of the reported position, when known. */
  column?: number
  /** 1-based line in the markdown source, when known. */
  line?: number
  message: string
  severity: RenderDiagnosticSeverity
  source: RenderDiagnosticSource
}

export type DiagnosticPlace = {
  column: number
  line: number
}

type MessageOptions = {
  place?: DiagnosticPlace
  ruleId?: string
  source?: string
}

/** The subset of a VFile the pipeline reports through. */
export type DiagnosticFile = {
  info: (reason: string, options?: MessageOptions) => unknown
  message: (reason: string, options?: MessageOptions) => unknown
}

export type ReportDiagnosticOptions = {
  code?: string
  place?: DiagnosticPlace
  severity?: Exclude<RenderDiagnosticSeverity, 'error'>
  source: RenderDiagnosticSource
}

const SOURCES = new Set<RenderDiagnosticSource>(['code', 'directive', 'icon', 'render', 'theme'])

export function reportDiagnostic(
  file: DiagnosticFile,
  reason: string,
  { code, place, severity = 'warning', source }: ReportDiagnosticOptions,
) {
  const options: MessageOptions = {
    source,
    ...(place ? { place } : {}),
    ...(code ? { ruleId: code } : {}),
  }

  if (severity === 'info') file.info(reason, options)
  else file.message(reason, options)
}

type VFileMessageLike = {
  column?: null | number
  fatal?: boolean | null
  line?: null | number
  reason: string
  ruleId?: null | string
  source?: null | string
}

function isSource(value: unknown): value is RenderDiagnosticSource {
  return typeof value === 'string' && SOURCES.has(value as RenderDiagnosticSource)
}

export function toRenderDiagnostic(message: VFileMessageLike): RenderDiagnostic {
  return {
    message: message.reason,
    severity: message.fatal === true ? 'error' : message.fatal === false ? 'warning' : 'info',
    source: isSource(message.source) ? message.source : 'render',
    ...(typeof message.line === 'number' ? { line: message.line } : {}),
    ...(typeof message.column === 'number' ? { column: message.column } : {}),
    ...(message.ruleId ? { code: message.ruleId } : {}),
  }
}

/** 1-based place of a source offset, given the line's start offset. */
export function placeAt(line: number, lineStart: number, offset: number): DiagnosticPlace {
  return { column: Math.max(0, offset - lineStart) + 1, line }
}
