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
