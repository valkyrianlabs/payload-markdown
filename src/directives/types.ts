import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Data } from 'unist'

import type { MarkdownConfig } from '../types/core.js'

export type LayoutDirectiveName = '2col' | '3col' | 'cell' | 'section'
export type GridDirectiveName = '2col' | '3col'
export type LayoutName = LayoutDirectiveName

export type LayoutToken =
  | {
      action: 'close'
      data?: Data
      type: 'vlLayoutToken'
    }
  | {
      action: 'closeGrid'
      data?: Data
      type: 'vlLayoutToken'
    }
  | {
      action: 'closeSection'
      data?: Data
      type: 'vlLayoutToken'
    }
  | {
      action: 'open'
      data?: Data
      name: LayoutName
      type: 'vlLayoutToken'
    }

export type DirectiveChild = ContainerDirective['children'][number]

export type LayoutDirectiveKind = 'cell' | 'grid' | 'section'

export type LayoutDirectiveRenderTagName = 'div' | 'section'

export type LayoutDirectiveTransformContext = {
  isSupportedDirectiveName: (name: string) => name is LayoutDirectiveName
}

export type LayoutDirectiveClassHelpers = {
  groupChildrenIntoCells: (
    children: ElementContent[],
    columnClassName?: string,
  ) => ElementContent[]
  mergeClassNames: (...values: Array<string | undefined>) => string[]
}

export type LayoutDirectiveEditorMetadata = {
  label: string
  snippet: string
}

export type LayoutDirectiveDefinition = {
  applyHast?: (
    node: Element,
    config: MarkdownConfig,
    helpers: LayoutDirectiveClassHelpers,
  ) => void
  editor: LayoutDirectiveEditorMetadata
  getMdastRenderProperties?: (node: ContainerDirective) => Record<string, unknown>
  kind: LayoutDirectiveKind
  name: LayoutDirectiveName
  openMarker?: `:::${string}`
  tagName: LayoutDirectiveRenderTagName
  transformMdast?: (
    node: ContainerDirective,
    context: LayoutDirectiveTransformContext,
  ) => void
}
