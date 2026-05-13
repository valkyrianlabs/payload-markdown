import path from 'node:path'

import type { PayloadMarkdownIconsConfig } from '../types/core.js'

import { hasUnsafeIconPathSegments } from './refs.js'

type IconRegistryEntry = {
  importPath: string
  key: string
}

function toPascalCase(value: string): string {
  const normalized = value
    .replace(/\.svg$/i, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')

  return normalized || 'Icon'
}

export function createPayloadMarkdownIconRegistrySource(entries: IconRegistryEntry[]): string {
  const imports = entries.map((entry, index) => {
    return `import ${toPascalCase(entry.key)}${index} from '${entry.importPath}'`
  })
  const values = entries.map((entry, index) => {
    return `  '${entry.key}': ${toPascalCase(entry.key)}${index},`
  })

  return [
    ...imports,
    '',
    'export const payloadMarkdownIcons = {',
    ...values,
    '} as const',
    '',
    'export type PayloadMarkdownIconName = keyof typeof payloadMarkdownIcons',
    '',
  ].join('\n')
}

export function createPayloadMarkdownIconRegistryEntry(
  config: PayloadMarkdownIconsConfig,
  packAlias: string,
  iconPath: string,
): IconRegistryEntry | undefined {
  const pack = config.packs.find((entry) => entry.alias === packAlias)
  if (!pack) return undefined

  const normalizedIconPath = iconPath.replace(/\.svg$/i, '')
  if (hasUnsafeIconPathSegments(normalizedIconPath)) return undefined

  return {
    importPath: path.posix.join(config.baseDir, pack.path, `${normalizedIconPath}.svg`),
    key: `${packAlias}/${normalizedIconPath}`,
  }
}
