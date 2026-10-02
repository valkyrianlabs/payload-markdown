import type { Element, RootContent } from 'hast'

import fs from 'node:fs'
import path from 'node:path'

import type { PayloadMarkdownIconsConfig } from '../types/core.js'

import {
  hasUnsafeIconPathSegments,
  normalizePayloadMarkdownIconRef,
} from './refs.js'
import { instantiateSanitizedSvg, parseAndSanitizeSvg } from './sanitizeSvg.js'

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

type CachedIcon = {
  mtimeMs: number
  size: number
  svg: Element | undefined
}

const MAX_CACHED_ICONS = 2000
const iconCache = new Map<string, CachedIcon>()

function loadSanitizedIcon(iconFile: string, stats: fs.Stats): Element | undefined {
  const cached = iconCache.get(iconFile)

  if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) return cached.svg

  const svg = parseAndSanitizeSvg(fs.readFileSync(iconFile, 'utf8'))

  if (iconCache.size >= MAX_CACHED_ICONS) {
    const oldest = iconCache.keys().next().value
    if (oldest !== undefined) iconCache.delete(oldest)
  }

  iconCache.set(iconFile, { mtimeMs: stats.mtimeMs, size: stats.size, svg })

  return svg
}

function statFile(file: string): fs.Stats | undefined {
  try {
    const stats = fs.statSync(file)

    return stats.isFile() ? stats : undefined
  } catch {
    return undefined
  }
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

  const stats = statFile(iconFile)

  if (!stats)
    return {
      iconKey: normalized.icon.key,
      nodes: [],
      warnings: [`Unknown icon "${normalized.icon.key}".`],
    }

  const svg = loadSanitizedIcon(iconFile, stats)

  if (!svg)
    return {
      iconKey: normalized.icon.key,
      nodes: [],
      warnings: [`Icon "${normalized.icon.key}" does not contain an <svg> element.`],
    }

  return {
    iconKey: normalized.icon.key,
    nodes: [instantiateSanitizedSvg(svg, className)],
    warnings: [],
  }
}
