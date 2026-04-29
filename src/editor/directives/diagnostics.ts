import type { Diagnostic } from '@codemirror/lint'

import { linter } from '@codemirror/lint'

import { lintMarkdownDirectives } from '../../directives/diagnostics.js'

export const directiveDiagnostics = linter((view): Diagnostic[] => {
  return lintMarkdownDirectives(view.state.doc.toString()).map((diagnostic) => ({
    from: diagnostic.from,
    message: diagnostic.message,
    severity: diagnostic.severity,
    to: diagnostic.to,
  }))
})
