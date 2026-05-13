import { normalizePayloadMarkdownIconRef } from '../icons/refs.js'

export function makeDirectiveIconPlaceholder(icon: string, className: string[]) {
  const normalized = normalizePayloadMarkdownIconRef(icon)
  const iconKey = normalized.icon?.key ?? icon

  return {
    type: 'element' as const,
    children: [],
    properties: {
      ariaHidden: 'true',
      className,
      dataPmdIcon: iconKey,
      dataPmdIconRef: icon,
      focusable: 'false',
    },
    tagName: 'span',
  }
}
