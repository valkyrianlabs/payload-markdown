import type { Diagnostic } from '@codemirror/lint'

import { linter } from '@codemirror/lint'

import { lintMarkdownDirectives } from '../../directives/diagnostics.js'

export const directiveDiagnostics = linter((view): Diagnostic[] => {
  try {
    return lintMarkdownDirectives(view.state.doc.toString()).map((diagnostic) => ({
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
