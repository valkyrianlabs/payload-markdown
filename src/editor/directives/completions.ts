import type { Completion, CompletionContext } from '@codemirror/autocomplete'

import { autocompletion, snippetCompletion } from '@codemirror/autocomplete'

import { layoutDirectiveRegistry } from '../../directives/registry.js'
import { getDirectiveThemeNames } from '../../directives/themes.js'

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

export function getDirectiveAttributeCompletionOptions(name: string): Completion[] {
  const definition = layoutDirectiveRegistry.get(name)
  const attributes = definition?.allowedAttributes ?? []

  return attributes.map((attribute) =>
    snippetCompletion(`${attribute}="\${${attribute}}"`, {
      type: 'property',
      detail: `:::${name} attribute`,
      label: attribute,
    }),
  )
}

export function getDirectiveThemeValueCompletionOptions(
  name: string,
  attribute: string,
): Completion[] {
  const definition = layoutDirectiveRegistry.get(name)
  const groupName = definition?.themeAttributes?.[attribute]

  if (!groupName) return []

  return getDirectiveThemeNames(groupName).map((themeName) => ({
    type: 'constant',
    detail: `${groupName} theme`,
    label: themeName,
  }))
}

function attributeCompletionSource(context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos)
  const beforeCursor = line.text.slice(0, context.pos - line.from)
  const directiveMatch = beforeCursor.match(/^\s*:::(\w+)\s+\{([^}]*)$/)

  if (!directiveMatch) return null

  const [, name, attributesBeforeCursor] = directiveMatch
  const valueMatch = attributesBeforeCursor.match(/(?:^|\s)(theme|cardTheme|cellTheme|stepTheme)="([^"]*)$/)

  if (valueMatch) {
    const [, attribute, typedValue] = valueMatch
    const options = getDirectiveThemeValueCompletionOptions(name, attribute)

    if (options.length === 0) return null

    return {
      from: context.pos - typedValue.length,
      options,
    }
  }

  const attributeMatch = attributesBeforeCursor.match(/(?:^|\s)([\w-]*)$/)
  const typedAttribute = attributeMatch?.[1] ?? ''
  const options = getDirectiveAttributeCompletionOptions(name)

  if (options.length === 0) return null
  if (!context.explicit && typedAttribute.length === 0) return null

  return {
    from: context.pos - typedAttribute.length,
    options,
  }
}

function directiveCompletionSource(context: CompletionContext) {
  const attributeResult = attributeCompletionSource(context)
  if (attributeResult) return attributeResult

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
