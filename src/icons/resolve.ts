import type { Element, RootContent } from 'hast'

import { fromHtml } from 'hast-util-from-html'
import fs from 'node:fs'
import path from 'node:path'

import type { PayloadMarkdownIconsConfig } from '../types/core.js'

import {
  hasUnsafeIconPathSegments,
  normalizePayloadMarkdownIconRef,
} from './refs.js'

export type PayloadMarkdownIconResolution = {
  iconKey?: string
  nodes: RootContent[]
  warnings: string[]
}

function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)

  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export function validatePayloadMarkdownIconsConfig(
  config: PayloadMarkdownIconsConfig | undefined,
): string[] {
  if (!config) return []

  const warnings: string[] = []
  const seenAliases = new Set<string>()

  if (!config.baseDir?.trim()) warnings.push('Icon config baseDir must not be empty.')

  for (const pack of config.packs ?? []) {
    const alias = pack.alias.trim()
    const packPath = pack.path.trim()

    if (!alias) {
      warnings.push('Icon pack aliases must not be empty.')
      continue
    }

    if (seenAliases.has(alias)) warnings.push(`Duplicate icon pack alias "${alias}".`)
    seenAliases.add(alias)

    if (!packPath) warnings.push(`Icon pack "${alias}" path must not be empty.`)
    else if (hasUnsafeIconPathSegments(packPath))
      warnings.push(`Icon pack "${alias}" path must be a safe relative path.`)
  }

  return warnings
}

function sanitizeSvg(value: string): string {
  return value
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, '')
}

function addSvgRuntimeAttributes(svg: string, className: string): string {
  return svg.replace(/<svg\b([^>]*)>/i, (_match, attributes: string) => {
    const nextAttributes = attributes.replace(/\sclass=(["'])(.*?)\1/i, (_classMatch, quote, value) => {
      return ` class=${quote}${value} ${className}${quote}`
    })
    const hasClass = /\sclass=/.test(attributes)

    return `<svg${hasClass ? nextAttributes : `${nextAttributes} class="${className}"`} aria-hidden="true" focusable="false">`
  })
}

function parseSvgFragment(svg: string): RootContent[] {
  const root = fromHtml(svg, { fragment: true })

  return root.children.filter((node): node is Element => node.type === 'element')
}

export function resolvePayloadMarkdownIcon(
  ref: string | undefined,
  config: PayloadMarkdownIconsConfig | undefined,
  className: string,
): PayloadMarkdownIconResolution {
  if (!ref) return { nodes: [], warnings: [] }

  const normalized = normalizePayloadMarkdownIconRef(ref)
  if (normalized.warning) return { nodes: [], warnings: [normalized.warning] }
  if (!normalized.icon) return { nodes: [], warnings: [] }

  const pack = config?.packs?.find((entry) => entry.alias === normalized.icon?.packAlias)
  if (!pack)
    return {
      iconKey: normalized.icon.key,
      nodes: [],
      warnings: [`Unknown icon pack "${normalized.icon.packAlias}".`],
    }

  const baseDir = path.resolve(process.cwd(), config?.baseDir ?? '')
  const packRoot = path.resolve(baseDir, pack.path)
  const iconFile = path.resolve(packRoot, `${normalized.icon.iconPath}.svg`)

  if (!isWithin(packRoot, iconFile))
    return {
      iconKey: normalized.icon.key,
      nodes: [],
      warnings: [`Malformed icon ref "${ref}". Icon paths must stay within their icon pack.`],
    }

  if (!fs.existsSync(iconFile))
    return {
      iconKey: normalized.icon.key,
      nodes: [],
      warnings: [`Unknown icon "${normalized.icon.key}".`],
    }

  const svg = addSvgRuntimeAttributes(sanitizeSvg(fs.readFileSync(iconFile, 'utf8')), className)

  return {
    iconKey: normalized.icon.key,
    nodes: parseSvgFragment(svg),
    warnings: [],
  }
}
