import type { DirectiveAttributes } from './attributes.js'

export const SHIELDS_BADGE_ORIGIN = 'https://img.shields.io'

export const SHIELDS_BADGE_QUERY_ATTRIBUTES = [
  'style',
  'logo',
  'logoColor',
  'logoSize',
  'label',
  'labelColor',
  'color',
  'cacheSeconds',
] as const

export type ShieldsBadgeResolution = {
  src?: string
  warnings: string[]
}

type ShieldsBadgeResolver = (attributes: DirectiveAttributes) => ShieldsBadgeResolution

const NPM_DOWNLOAD_INTERVALS = ['dw', 'dm', 'dy', 'dt'] as const

function getStringAttribute(attributes: DirectiveAttributes, name: string): string | undefined {
  const value = attributes[name]

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getRequiredStringAttributes(
  attributes: DirectiveAttributes,
  names: string[],
): null | Record<string, string> {
  const out: Record<string, string> = {}

  for (const name of names) {
    const value = getStringAttribute(attributes, name)
    if (!value) return null

    out[name] = value
  }

  return out
}

function encodeStaticPathPart(value: string): string {
  return encodeURIComponent(value).replace(/-/g, '%2D')
}

function normalizePathValue(value: string): string | undefined {
  const trimmed = value.trim()

  if (!trimmed) return undefined
  if (hasUnsafePathCharacter(trimmed)) return undefined

  const parts = trimmed.split('/')
  if (parts.some((part) => part === '.' || part === '..')) return undefined

  return parts.map((part) => encodeURIComponent(part)).join('/')
}

function hasUnsafePathCharacter(value: string): boolean {
  for (const char of value) {
    const charCode = char.charCodeAt(0)

    if (charCode <= 31 || charCode === 127) return true
    if (char === '\\' || char === '?' || char === '#') return true
  }

  return false
}

function addCommonQueryAttributes(
  url: URL,
  attributes: DirectiveAttributes,
  excludedAttributes: readonly string[] = [],
) {
  const excluded = new Set(excludedAttributes)

  for (const attribute of SHIELDS_BADGE_QUERY_ATTRIBUTES) {
    if (excluded.has(attribute)) continue

    const value = getStringAttribute(attributes, attribute)
    if (value) url.searchParams.set(attribute, value)
  }
}

function buildShieldsUrl(
  path: string,
  attributes: DirectiveAttributes,
  excludedQueryAttributes: readonly string[] = [],
): string {
  const url = new URL(path.replace(/^\/+/, ''), `${SHIELDS_BADGE_ORIGIN}/`)

  addCommonQueryAttributes(url, attributes, excludedQueryAttributes)

  return url.toString()
}

function resolveStaticBadge(attributes: DirectiveAttributes): ShieldsBadgeResolution {
  const required = getRequiredStringAttributes(attributes, ['label', 'message', 'color'])

  if (!required)
    return {
      warnings: ['Directive "badge" requires label, message, and color for type="static".'],
    }

  return {
    src: buildShieldsUrl(
      `/badge/${encodeStaticPathPart(required.label)}-${encodeStaticPathPart(
        required.message,
      )}-${encodeStaticPathPart(required.color)}`,
      attributes,
      ['label', 'color'],
    ),
    warnings: [],
  }
}

function resolveNpmBadge(attributes: DirectiveAttributes): ShieldsBadgeResolution {
  const packageName = getStringAttribute(attributes, 'package')
  const target = getStringAttribute(attributes, 'target')

  if (!packageName)
    return {
      warnings: ['Directive "badge" requires package for type="npm".'],
    }

  const safePackageName = normalizePathValue(packageName)
  if (!safePackageName)
    return {
      warnings: ['Directive "badge" package must be a safe Shields path value.'],
    }

  if (target === 'version')
    return {
      src: buildShieldsUrl(`/npm/v/${safePackageName}`, attributes, ['package']),
      warnings: [],
    }

  if (target === 'downloads') {
    const rawInterval = getStringAttribute(attributes, 'interval') ?? 'dw'
    const interval = NPM_DOWNLOAD_INTERVALS.includes(
      rawInterval as (typeof NPM_DOWNLOAD_INTERVALS)[number],
    )
      ? rawInterval
      : 'dw'

    return {
      src: buildShieldsUrl(`/npm/${interval}/${safePackageName}`, attributes, [
        'package',
        'interval',
      ]),
      warnings:
        interval === rawInterval
          ? []
          : [`Invalid badge interval "${rawInterval}". Falling back to "dw".`],
    }
  }

  if (target === 'license')
    return {
      src: buildShieldsUrl(`/npm/l/${safePackageName}`, attributes, ['package']),
      warnings: [],
    }

  return {
    warnings: [
      target
        ? `Unsupported badge target "${target}" for type="npm".`
        : 'Directive "badge" requires target for type="npm".',
    ],
  }
}

function resolveGithubBadge(attributes: DirectiveAttributes): ShieldsBadgeResolution {
  const repo = getStringAttribute(attributes, 'repo')
  const target = getStringAttribute(attributes, 'target')

  if (!repo)
    return {
      warnings: ['Directive "badge" requires repo for type="github".'],
    }

  const safeRepo = normalizePathValue(repo)
  if (!safeRepo)
    return {
      warnings: ['Directive "badge" repo must be a safe Shields path value.'],
    }

  if (target === 'workflow') {
    const workflow = getStringAttribute(attributes, 'workflow')

    if (!workflow)
      return {
        warnings: ['Directive "badge" requires workflow for type="github" target="workflow".'],
      }

    const safeWorkflow = normalizePathValue(workflow)
    if (!safeWorkflow)
      return {
        warnings: ['Directive "badge" workflow must be a safe Shields path value.'],
      }

    return {
      src: buildShieldsUrl(
        `/github/actions/workflow/status/${safeRepo}/${safeWorkflow}`,
        attributes,
        ['repo', 'workflow'],
      ),
      warnings: [],
    }
  }

  if (target === 'release')
    return {
      src: buildShieldsUrl(`/github/v/release/${safeRepo}`, attributes, ['repo']),
      warnings: [],
    }

  if (target === 'license')
    return {
      src: buildShieldsUrl(`/github/license/${safeRepo}`, attributes, ['repo']),
      warnings: [],
    }

  if (target === 'stars')
    return {
      src: buildShieldsUrl(`/github/stars/${safeRepo}`, attributes, ['repo']),
      warnings: [],
    }

  return {
    warnings: [
      target
        ? `Unsupported badge target "${target}" for type="github".`
        : 'Directive "badge" requires target for type="github".',
    ],
  }
}

function resolveDebianBadge(attributes: DirectiveAttributes): ShieldsBadgeResolution {
  const packageName = getStringAttribute(attributes, 'package')
  const target = getStringAttribute(attributes, 'target')

  if (!target)
    return {
      warnings: ['Directive "badge" requires target for type="debian".'],
    }

  if (target !== 'version')
    return {
      warnings: [`Unsupported badge target "${target}" for type="debian".`],
    }

  if (!packageName)
    return {
      warnings: ['Directive "badge" requires package for type="debian".'],
    }

  const safePackageName = normalizePathValue(packageName)
  if (!safePackageName)
    return {
      warnings: ['Directive "badge" package must be a safe Shields path value.'],
    }

  return {
    src: buildShieldsUrl(`/debian/v/${safePackageName}`, attributes, ['package']),
    warnings: [],
  }
}

export const shieldsBadgeResolvers: Record<string, ShieldsBadgeResolver> = {
  apt: resolveDebianBadge,
  debian: resolveDebianBadge,
  github: resolveGithubBadge,
  npm: resolveNpmBadge,
  static: resolveStaticBadge,
}

function resolveSrcEscapeHatch(attributes: DirectiveAttributes): null | ShieldsBadgeResolution {
  const src = getStringAttribute(attributes, 'src')

  if (!src) return null

  try {
    const url = new URL(src)

    if (
      url.origin !== SHIELDS_BADGE_ORIGIN ||
      url.protocol !== 'https:' ||
      url.username ||
      url.password
    )
      return {
        warnings: ['Directive "badge" src must use https://img.shields.io/.'],
      }

    addCommonQueryAttributes(url, attributes)

    return {
      src: url.toString(),
      warnings: [],
    }
  } catch {
    return {
      warnings: ['Directive "badge" src must be a valid https://img.shields.io/ URL.'],
    }
  }
}

function resolvePathEscapeHatch(attributes: DirectiveAttributes): null | ShieldsBadgeResolution {
  const path = getStringAttribute(attributes, 'path')

  if (!path) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//'))
    return {
      warnings: ['Directive "badge" path must be a Shields path, not a URL.'],
    }

  const normalizedPath = normalizePathValue(path.replace(/^\/+/, ''))
  if (!normalizedPath)
    return {
      warnings: ['Directive "badge" path must be a safe Shields path value.'],
    }

  return {
    src: buildShieldsUrl(normalizedPath, attributes),
    warnings: [],
  }
}

export function resolveShieldsBadge(attributes: DirectiveAttributes): ShieldsBadgeResolution {
  const srcResolved = resolveSrcEscapeHatch(attributes)
  if (srcResolved) return srcResolved

  const pathResolved = resolvePathEscapeHatch(attributes)
  if (pathResolved) return pathResolved

  const type = getStringAttribute(attributes, 'type')

  if (!type)
    return {
      warnings: ['Directive "badge" requires type, path, or src.'],
    }

  const resolver = shieldsBadgeResolvers[type]
  if (!resolver)
    return {
      warnings: [`Unsupported badge type "${type}".`],
    }

  return resolver(attributes)
}
