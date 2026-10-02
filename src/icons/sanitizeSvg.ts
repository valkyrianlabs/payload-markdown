import type { Element, ElementContent, Properties, Root, RootContent } from 'hast'

import { fromHtml } from 'hast-util-from-html'

/**
 * Structured sanitizer for icon SVG files (CORE-4).
 *
 * Icons are inlined into rendered markdown after rehype-sanitize has run, so
 * this is the only line of defence for icon file content. The file is parsed
 * with a real HTML parser (foreign-content SVG rules), only the first top-level
 * `<svg>` is kept, and its subtree is filtered through a strict allowlist:
 *
 * - elements outside the allowlist are dropped with their content
 *   (`script`, `style`, `foreignObject`, `animate*`, `set`, `image`, `iframe`, …);
 *   `<a>` is unwrapped so its drawing content survives without the link
 * - attributes outside the allowlist are dropped, which includes every `on*`
 *   handler and `data-*` attribute
 * - `href` / `xlink:href` are kept only as same-document `#fragment` refs
 * - `style` attributes are kept only when they cannot load or reference
 *   anything (`url(`, `@import`, `expression(`, `javascript:`, escapes)
 * - `<style>` elements are never emitted (inlined into the page they would apply
 *   to the whole document). Simple class rules that only set paint/opacity —
 *   e.g. Font Awesome duotone's `.fa-secondary{opacity:.4}` — are translated into
 *   presentation attributes on the matching elements of the same icon, so icons
 *   keep their appearance without carrying CSS. Any rule that is not a plain
 *   class selector with allowlisted properties and plain values is ignored.
 */

const ALLOWED_SVG_TAG_NAMES = new Set([
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'g',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'symbol',
  'text',
  'textPath',
  'title',
  'tspan',
  'use',
])

/** Elements whose children are kept while the element itself is removed. */
const UNWRAP_SVG_TAG_NAMES = new Set(['a'])

/** Allowed attributes, written as they appear in SVG source. */
const ALLOWED_SVG_ATTRIBUTES = [
  'alignment-baseline',
  'amplitude',
  'aria-hidden',
  'aria-label',
  'azimuth',
  'baseFrequency',
  'baseline-shift',
  'bias',
  'class',
  'clip-path',
  'clip-rule',
  'clipPathUnits',
  'color',
  'color-interpolation-filters',
  'cx',
  'cy',
  'd',
  'diffuseConstant',
  'display',
  'divisor',
  'dominant-baseline',
  'dx',
  'dy',
  'edgeMode',
  'elevation',
  'exponent',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'filterUnits',
  'flood-color',
  'flood-opacity',
  'focusable',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'fr',
  'fx',
  'fy',
  'gradientTransform',
  'gradientUnits',
  'height',
  'id',
  'in',
  'in2',
  'intercept',
  'k1',
  'k2',
  'k3',
  'k4',
  'kernelMatrix',
  'lengthAdjust',
  'letter-spacing',
  'lighting-color',
  'limitingConeAngle',
  'marker-end',
  'marker-mid',
  'marker-start',
  'markerHeight',
  'markerUnits',
  'markerWidth',
  'mask',
  'maskContentUnits',
  'maskUnits',
  'mode',
  'numOctaves',
  'offset',
  'opacity',
  'operator',
  'order',
  'orient',
  'overflow',
  'paint-order',
  'pathLength',
  'patternContentUnits',
  'patternTransform',
  'patternUnits',
  'points',
  'pointsAtX',
  'pointsAtY',
  'pointsAtZ',
  'preserveAlpha',
  'preserveAspectRatio',
  'primitiveUnits',
  'r',
  'radius',
  'refX',
  'refY',
  'result',
  'role',
  'rx',
  'ry',
  'scale',
  'seed',
  'shape-rendering',
  'slope',
  'specularConstant',
  'specularExponent',
  'spreadMethod',
  'startOffset',
  'stdDeviation',
  'stitchTiles',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'style',
  'surfaceScale',
  'tableValues',
  'targetX',
  'targetY',
  'text-anchor',
  'text-decoration',
  'textLength',
  'transform',
  'type',
  'values',
  'vector-effect',
  'version',
  'viewBox',
  'visibility',
  'width',
  'word-spacing',
  'x',
  'x1',
  'x2',
  'xChannelSelector',
  'xmlns',
  'xmlns:xlink',
  'y',
  'y1',
  'y2',
  'yChannelSelector',
  'z',
]

const FRAGMENT_ONLY_ATTRIBUTES = ['href', 'xlink:href']

function getSvgPropertyNames(attributes: readonly string[]): Set<string> {
  // Let the same parser that reads icon files tell us the hast property name
  // for each attribute, so the allowlist cannot drift from parsing.
  const markup = `<svg ${attributes.map((attribute) => `${attribute}=""`).join(' ')}></svg>`
  const svg = fromHtml(markup, { fragment: true }).children[0] as Element | undefined

  return new Set(Object.keys(svg?.properties ?? {}))
}

const ALLOWED_SVG_PROPERTIES = getSvgPropertyNames(ALLOWED_SVG_ATTRIBUTES)
const FRAGMENT_ONLY_PROPERTIES = getSvgPropertyNames(FRAGMENT_ONLY_ATTRIBUTES)

const UNSAFE_STYLE_PATTERN = /url\s*\(|@import|expression\s*\(|javascript:|\\|<|behavior\s*:|-moz-binding/i

function isSafeStyle(value: Properties[string]): boolean {
  return typeof value === 'string' && !UNSAFE_STYLE_PATTERN.test(value)
}

function sanitizeProperties(properties: Properties | undefined): Properties {
  const output: Properties = {}

  for (const [name, value] of Object.entries(properties ?? {})) {
    if (FRAGMENT_ONLY_PROPERTIES.has(name)) {
      if (typeof value === 'string' && value.trim().startsWith('#')) output[name] = value.trim()
      continue
    }

    if (!ALLOWED_SVG_PROPERTIES.has(name)) continue
    if (name === 'style' && !isSafeStyle(value)) continue

    output[name] = value
  }

  return output
}

/**
 * Presentation properties a `<style>` class rule may set (they are also allowed as SVG attributes).
 * Design-tool exports (Illustrator, Figma, Sketch) put their paint in such rules, for example
 * `.cls-1{fill:#0a84ff;stroke-miterlimit:10}`.
 */
const STYLE_RULE_PROPERTIES = [
  'clip-rule',
  'color',
  'display',
  'fill',
  'fill-opacity',
  'fill-rule',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'lighting-color',
  'opacity',
  'paint-order',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'vector-effect',
  'visibility',
]
const STYLE_RULE_PROPERTY_NAMES = new Map(
  STYLE_RULE_PROPERTIES.map((attribute) => [attribute, [...getSvgPropertyNames([attribute])][0]]),
)
/**
 * A plain value: numbers and lengths (also space/comma-separated lists such as dash arrays), hex
 * colours, keywords, quoted font names, and rgb()/rgba()/hsl()/hsla() with numeric arguments.
 * Anything that can load or reference something (`url(`, other functions, escapes) is rejected.
 */
const SAFE_STYLE_VALUE =
  /^(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?)\([\d\s.,%/-]+\)|[\w\s.,%"'-]+)$/i
const CLASS_SELECTOR = /^\.(-?[_a-z][\w-]*)$/i

type StyleRule = { className: string; declarations: Array<[string, string]> }

function collectText(node: Element): string {
  return node.children.map((child) => (child.type === 'text' ? child.value : child.type === 'element' ? collectText(child) : '')).join('')
}

function collectStyleText(children: readonly (ElementContent | RootContent)[]): string {
  let text = ''

  for (const child of children) {
    if (child.type !== 'element') continue
    if (child.tagName === 'style') text += `${collectText(child)}\n`
    else text += collectStyleText(child.children)
  }

  return text
}

/** Parses only `.class[, .class] { prop: value; … }` rules with allowlisted properties and plain values. */
function parseClassStyleRules(css: string): StyleRule[] {
  const rules: StyleRule[] = []
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((selector) => selector.trim())
    const classNames = selectors.map((selector) => CLASS_SELECTOR.exec(selector)?.[1])
    if (classNames.some((name) => !name)) continue

    const declarations: Array<[string, string]> = []

    // Each declaration stands alone, like CSS: unsupported properties (e.g. `isolation`) and
    // unsafe values are skipped without discarding the rule's other, safe declarations.
    for (const declaration of match[2].split(';')) {
      const separator = declaration.indexOf(':')
      if (separator < 0) continue
      const property = declaration.slice(0, separator).trim().toLowerCase()
      const value = declaration.slice(separator + 1).replace(/\s*!important\s*$/i, '').trim()
      const propertyName = STYLE_RULE_PROPERTY_NAMES.get(property)

      if (!propertyName || !value || !SAFE_STYLE_VALUE.test(value)) continue

      declarations.push([propertyName, value])
    }

    if (declarations.length === 0) continue
    for (const className of classNames) rules.push({ className: className!, declarations })
  }

  return rules
}

function applyClassStyleRules(node: Element, rules: readonly StyleRule[]): void {
  const classes = toClassList(node.properties.className)

  // Later rules win, like the stylesheet they replace; class rules outrank presentation attributes.
  for (const rule of rules) {
    if (!classes.includes(rule.className)) continue
    for (const [name, value] of rule.declarations) node.properties[name] = value
  }

  for (const child of node.children) if (child.type === 'element') applyClassStyleRules(child, rules)
}

function sanitizeChildren(children: readonly (ElementContent | RootContent)[]): ElementContent[] {
  const output: ElementContent[] = []

  for (const child of children) {
    if (child.type === 'text') {
      output.push({ type: 'text', value: child.value })
      continue
    }

    if (child.type !== 'element') continue

    if (UNWRAP_SVG_TAG_NAMES.has(child.tagName)) {
      output.push(...sanitizeChildren(child.children))
      continue
    }

    if (!ALLOWED_SVG_TAG_NAMES.has(child.tagName)) continue

    output.push({
      type: 'element',
      children: sanitizeChildren(child.children),
      properties: sanitizeProperties(child.properties),
      tagName: child.tagName,
    })
  }

  return output
}

/**
 * Parses SVG file content and returns the sanitized first top-level `<svg>`
 * element, or `undefined` when the file has none.
 */
export function parseAndSanitizeSvg(content: string): Element | undefined {
  const root: Root = fromHtml(content, { fragment: true })
  const svg = root.children.find(
    (node): node is Element => node.type === 'element' && node.tagName === 'svg',
  )

  if (!svg) return undefined

  const sanitized: Element = {
    type: 'element',
    children: sanitizeChildren(svg.children),
    properties: sanitizeProperties(svg.properties),
    tagName: 'svg',
  }
  const styleRules = parseClassStyleRules(collectStyleText(svg.children))

  if (styleRules.length > 0) applyClassStyleRules(sanitized, styleRules)

  return sanitized
}

function toClassList(value: Properties[string]): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean)

  return []
}

/**
 * Returns a deep copy of a sanitized icon with the runtime class names and
 * accessibility attributes the renderer adds to every inline icon.
 */
export function instantiateSanitizedSvg(svg: Element, className: string): Element {
  const copy = structuredClone(svg)
  const properties: Properties = {}
  const runtimeClasses = className.split(/\s+/).filter(Boolean)
  let hasClass = false

  for (const [name, value] of Object.entries(copy.properties)) {
    if (name === 'ariaHidden' || name === 'focusable') continue

    if (name === 'className') {
      hasClass = true
      properties.className = [...toClassList(value), ...runtimeClasses]
      continue
    }

    properties[name] = value
  }

  if (!hasClass) properties.className = runtimeClasses

  properties.ariaHidden = 'true'
  properties.focusable = 'false'
  copy.properties = properties

  return copy
}
