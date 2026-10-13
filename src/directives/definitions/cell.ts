import type { ContainerDirective } from 'mdast-util-directive'

import type { DirectiveChild, LayoutDirectiveDefinition } from '../types.js'

import { setDirectiveRenderData } from '../renderData.js'
import { resolveDirectiveTheme } from '../themes.js'

export const cellDirective: LayoutDirectiveDefinition = {
  name: 'cell',
  allowedAttributes: ['theme'],
  applyHast(node, config, { mergeClassNames }) {
    const theme = resolveDirectiveTheme(
      'cell',
      typeof node.properties.dataTheme === 'string' ? node.properties.dataTheme : undefined,
      config.themes,
    )

    node.properties.dataTheme = theme.name
    node.properties.className = mergeClassNames(
      '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
      theme.hookClassName,
      theme.modifierClassName,
      theme.classes,
      config.columnClassName,
    )
  },
  editor: {
    detail: 'Layout directive',
    label: 'Layout cell',
    snippet: ':::cell\n${Content}\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    // Leave an unthemed cell unset so its 2col/3col parent can apply cellTheme;
    // applyHast falls back to the default theme.
    return {
      dataTheme: typeof node.attributes?.theme === 'string' ? node.attributes.theme : undefined,
    }
  },
  kind: 'cell',
  openMarker: ':::cell',
  public: true,
  supportsAttributes: true,
  tagName: 'div',
  themeAttributes: {
    theme: 'cell',
  },
}

export function makeCellDirective(children: DirectiveChild[]): ContainerDirective {
  const node: ContainerDirective = {
    name: 'cell',
    type: 'containerDirective',
    attributes: {},
    children,
    data: {},
  }

  setDirectiveRenderData(node, cellDirective)

  return node
}
