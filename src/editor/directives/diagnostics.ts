import type { Diagnostic } from '@codemirror/lint'

import { linter } from '@codemirror/lint'

import type { MarkdownEditorDirectiveConfig } from '../directiveConfig.js'

import { lintMarkdownDirectives } from '../../directives/diagnostics.js'

/**
 * Directive lint source that knows the field's configured themes and icon
 * packs (CORE-8), so custom themes are not reported as unknown.
 */
export const createDirectiveDiagnostics = (config: MarkdownEditorDirectiveConfig = {}) =>
  linter((view): Diagnostic[] => {
  try {
    return lintMarkdownDirectives(view.state.doc.toString(), config).map((diagnostic) => ({
      from: diagnostic.from,
      message: diagnostic.message,
      severity: diagnostic.severity,
      to: diagnostic.to,
    }))
  } catch (error) {
    // A linter bug must never take the editor down or hide unrelated
    // diagnostics permanently; report it once at the top of the document.
    return [
      {
        from: 0,
        message: `Directive diagnostics failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'info',
        to: 0,
      },
    ]
  }
})

export const directiveDiagnostics = createDirectiveDiagnostics()
