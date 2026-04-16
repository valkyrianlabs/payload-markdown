import type { Data } from 'unist'

export type LayoutName = '2col' | '3col' | 'section'

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
