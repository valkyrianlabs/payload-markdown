import { normalizePayloadMarkdownIconRef } from '../icons/refs.js'

/**
 * A placeholder that rehypeResolveIcons replaces with the sanitized SVG.
 * `palette` (optional) paints that icon; without it the icon renders exactly
 * as before palettes existed.
 */
export function makeDirectiveIconPlaceholder(icon: string, className: string[], palette?: string) {
  const normalized = normalizePayloadMarkdownIconRef(icon)
  const iconKey = normalized.icon?.key ?? icon

  return {
    type: 'element' as const,
    children: [],
    properties: {
      ariaHidden: 'true',
      className,
      dataPmdIcon: iconKey,
      ...(palette ? { dataPmdIconPalette: palette } : {}),
      dataPmdIconRef: icon,
      focusable: 'false',
    },
    tagName: 'span',
  }
}
