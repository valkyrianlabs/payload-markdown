export type NormalizedIconRef = {
  iconPath: string
  key: string
  packAlias: string
}

export function hasUnsafeIconPathSegments(value: string): boolean {
  if (!value.trim()) return true
  if (value.includes('\\')) return true
  if (/^[a-z]:/i.test(value)) return true
  if (value.startsWith('/')) return true

  return value.split('/').some((segment) => !segment || segment === '..')
}

function getExtension(value: string): string {
  const basename = value.split('/').pop() ?? ''
  const dotIndex = basename.lastIndexOf('.')

  return dotIndex >= 0 ? basename.slice(dotIndex) : ''
}

export function normalizePayloadMarkdownIconRef(ref: string): {
  icon?: NormalizedIconRef
  warning?: string
} {
  const trimmed = ref.trim()

  if (!trimmed.startsWith('@'))
    return { warning: `Malformed icon ref "${ref}". Expected "@pack/name".` }

  const body = trimmed.slice(1)
  const slashIndex = body.indexOf('/')

  if (slashIndex <= 0 || slashIndex === body.length - 1)
    return { warning: `Malformed icon ref "${ref}". Expected "@pack/name".` }

  const packAlias = body.slice(0, slashIndex)
  const rawIconPath = body.slice(slashIndex + 1)
  const extension = getExtension(rawIconPath)

  if (extension && extension !== '.svg')
    return { warning: `Icon ref "${ref}" must target an SVG file.` }

  const iconPath = extension === '.svg' ? rawIconPath.slice(0, -4) : rawIconPath

  if (hasUnsafeIconPathSegments(iconPath))
    return { warning: `Malformed icon ref "${ref}". Icon paths must be relative SVG paths.` }

  return {
    icon: {
      iconPath,
      key: `${packAlias}/${iconPath}`,
      packAlias,
    },
  }
}
