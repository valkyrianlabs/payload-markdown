import type { CompletionContext } from '@codemirror/autocomplete'

import { autocompletion, snippetCompletion } from '@codemirror/autocomplete'

import { layoutDirectiveRegistry } from '../../directives/registry.js'

export function getDirectiveCompletionOptions() {
  return layoutDirectiveRegistry.getPublicDefinitions().map((definition) =>
    snippetCompletion(definition.editor.snippet, {
      type: 'keyword',
      detail: definition.editor.detail,
      info: definition.description,
      label: `:::${definition.name}`,
    }),
  )
}

function directiveCompletionSource(context: CompletionContext) {
  const match = context.matchBefore(/:::[\w-]*/)

  if (!match) return null
  if (match.from === match.to && !context.explicit) return null

  return {
    from: match.from,
    options: getDirectiveCompletionOptions(),
  }
}

export const directiveCompletions = autocompletion({
  activateOnTyping: true,
  override: [directiveCompletionSource],
})
