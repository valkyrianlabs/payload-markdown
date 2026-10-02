/**
 * @import {} from 'mdast-util-directive'
 */

import 'mdast-util-directive'

import type { LayoutToken } from './layoutToken'

declare module 'mdast-util-directive' {
  interface ContainerDirectiveData {
    vlCellHeadingDepth?: number
    vlDirectiveLabel?: string
    vlParentHeadingDepth?: number
    /** 1-based source position of the directive's opening marker. */
    vlPlace?: { column: number; line: number }
    /** Position of a `tab` among its parent `tabs` block's tab children. */
    vlTabIndex?: number
  }

  interface LeafDirectiveData {
    hChildren?: unknown[]
    hName?: string
    hProperties?: Record<string, unknown>
  }
}

declare module 'mdast' {
  interface RootContentMap {
    vlLayoutToken: LayoutToken
  }
}
