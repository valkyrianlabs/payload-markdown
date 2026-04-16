/**
 * @import {} from 'mdast-util-directive'
 */

import 'mdast-util-directive'

import type { LayoutToken } from './layoutToken'

declare module 'mdast-util-directive' {
  interface ContainerDirectiveData {
    vlCellHeadingDepth?: number
    vlParentHeadingDepth?: number
  }
}

declare module 'mdast' {
  interface RootContentMap {
    vlLayoutToken: LayoutToken
  }
}
