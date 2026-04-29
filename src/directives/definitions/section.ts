import type { LayoutDirectiveDefinition } from '../types.js'

import { resolveDirectiveTheme } from '../themes.js'

export const sectionDirective: LayoutDirectiveDefinition = {
  name: 'section',
  allowedAttributes: ['theme'],
  applyHast(node, config, { mergeClassNames }) {
    const theme = resolveDirectiveTheme(
      'section',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
      config.sectionClassName,
    )
  },
  editor: {
    detail: 'Layout directive',
    label: 'Layout section',
    snippet: ':::section\n${Content}\n:::endsection\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : 'default',
    }
  },
  kind: 'section',
  openMarker: ':::section',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  themeAttributes: {
    theme: 'section',
  },
}
