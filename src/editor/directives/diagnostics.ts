import type { Diagnostic } from '@codemirror/lint'

import { linter } from '@codemirror/lint'

import type { MarkdownEditorDirectiveConfig } from '../directiveConfig.js'

import { lintMarkdownDirectives } from '../../directives/diagnostics.js'
import { getEditorPaletteNames } from '../directiveConfig.js'

/**
 * Directive lint source that knows the field's configured themes, icon packs
 * and palettes (CORE-8), so custom ones are not reported as unknown.
 */
export const createDirectiveDiagnostics = (config: MarkdownEditorDirectiveConfig = {}) =>
  linter((view): Diagnostic[] => {
  try {
    // Palettes managed in the admin load after the editor mounts; until then
    // no palette is reported as unknown.
    const options = { ...config, palettes: getEditorPaletteNames(config) }

    return lintMarkdownDirectives(view.state.doc.toString(), options).map((diagnostic) => ({
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
