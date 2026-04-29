import type { Element, ElementContent } from 'hast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Data } from 'unist'

import type { MarkdownConfig } from '../types/core.js'

export type LayoutDirectiveName = '2col' | '3col' | 'cell' | 'section'
export type StaticDirectiveName = 'callout' | 'details' | 'steps' | 'toc'
export type MarkdownDirectiveName = LayoutDirectiveName | StaticDirectiveName
export type GridDirectiveName = '2col' | '3col'
export type LayoutName = MarkdownDirectiveName

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
      attributes?: Record<string, boolean | string>
      data?: Data
      name: LayoutName
      type: 'vlLayoutToken'
    }

export type DirectiveChild = ContainerDirective['children'][number]

export type LayoutDirectiveKind = 'callout' | 'cell' | 'details' | 'grid' | 'section' | 'steps' | 'toc'

export type LayoutDirectiveRenderTagName = 'details' | 'div' | 'nav' | 'section'

export type LayoutDirectiveTransformContext = {
  isSupportedDirectiveName: (name: string) => name is MarkdownDirectiveName
}

export type LayoutDirectiveClassHelpers = {
  groupChildrenIntoCells: (
    children: ElementContent[],
    columnClassName?: string,
  ) => ElementContent[]
  mergeClassNames: (...values: Array<string | undefined>) => string[]
}

export type LayoutDirectiveEditorMetadata = {
  detail?: string
  label: string
  snippet: string
}

export type DirectiveValidationContext = {
  attributes: Record<string, boolean | string>
  name: MarkdownDirectiveName
}

export type LayoutDirectiveDefinition = {
  allowedAttributes?: readonly string[]
  applyHast?: (
    node: Element,
    config: MarkdownConfig,
    helpers: LayoutDirectiveClassHelpers,
  ) => void
  defaultAttributes?: Record<string, string>
  description?: string
  editor: LayoutDirectiveEditorMetadata
  getMdastRenderProperties?: (node: ContainerDirective) => Record<string, unknown>
  kind: LayoutDirectiveKind
  name: MarkdownDirectiveName
  openMarker?: `:::${string}`
  public?: boolean
  supportsAttributes?: boolean
  tagName: LayoutDirectiveRenderTagName
  transformMdast?: (
    node: ContainerDirective,
    context: LayoutDirectiveTransformContext,
  ) => void
  validateAttributes?: (context: DirectiveValidationContext) => string[]
}
