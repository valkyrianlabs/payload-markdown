/**
 * Colour values for palettes.
 *
 * Palette colours end up inside inline `style` attributes, and palettes can be
 * edited by admins and MCP agents at runtime, so a value is only accepted when
 * it matches a strict grammar that cannot load, reference or escape anything:
 *
 * - hex: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
 * - colour functions with numeric arguments only: `rgb()`, `rgba()`, `hsl()`,
 *   `hsla()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`
 * - CSS named colours, `transparent` and `currentColor`
 * - `var(--token)`: a reference to a host design token (no fallback)
 */

const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i
const COLOR_FUNCTION = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(([^()]*)\)$/i
const COLOR_ARGUMENT = /^(?:[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?(?:%|deg|grad|rad|turn)?|none)$/i
const TOKEN_REFERENCE = /^var\(\s*(--[a-z\d][\w-]{0,63})\s*\)$/i
const MAX_COLOR_LENGTH = 96

/** CSS Color 4 named colours. */
const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
    'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
    'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
    'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
    'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
    'yellowgreen transparent currentcolor'
  ).split(' '),
)

/**
 * Returns the colour in a normalized, safe form, or `undefined` when it is not
 * an accepted colour value.
 */
export function normalizePaletteColor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_COLOR_LENGTH) return undefined

  if (HEX_COLOR.test(trimmed)) return trimmed.toLowerCase()

  const lower = trimmed.toLowerCase()
  if (NAMED_COLORS.has(lower)) return lower === 'currentcolor' ? 'currentColor' : lower

  const token = TOKEN_REFERENCE.exec(trimmed)
  if (token) return `var(${token[1]})`

  const fn = COLOR_FUNCTION.exec(trimmed)
  if (!fn) return undefined

  const args = fn[2]
    .trim()
    .split(/\s*[\s,/]\s*/)
    .filter(Boolean)

  if (args.length < 3 || args.length > 4 || !args.every((arg) => COLOR_ARGUMENT.test(arg))) return undefined

  // Keep the author's separators (commas, spaces, slash) but collapse whitespace.
  return `${fn[1].toLowerCase()}(${fn[2].trim().replace(/\s+/g, ' ')})`
}

export function isPaletteColor(value: unknown): boolean {
  return normalizePaletteColor(value) !== undefined
}

/** Human-readable summary of the accepted colour formats, for error messages. */
export const PALETTE_COLOR_FORMATS =
  'a hex colour (#e95420), rgb()/hsl()/oklch()/lab() with numeric arguments, a CSS colour name, currentColor, transparent, or var(--token)'
