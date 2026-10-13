import type { Payload } from 'payload'

import type { MarkdownPalette } from '../types/core.js'

import { PAYLOAD_MARKDOWN_APPEARANCE_RUNTIME_KEY } from '../runtime/index.js'

/**
 * Runtime state of the "Markdown Appearance" global, shared process-wide (like
 * the settings registry) so every copy of the package reads one cache.
 *
 * Renders read palettes from here, never per icon: the global is loaded at
 * most once per `ttl` per process (concurrent renders share one load), and a
 * save clears the cache of the process that saved it.
 */
type AppearanceRuntime = {
  cache?: { expires: number; palettes: MarkdownPalette[] }
  /** Set at `onInit`; renders without their own Payload instance use it. */
  payload?: Payload
  pending?: Promise<MarkdownPalette[]>
  slug?: string
  ttl: number
  warned?: boolean
}



type RuntimeHost = { [PAYLOAD_MARKDOWN_APPEARANCE_RUNTIME_KEY]?: AppearanceRuntime }

function getRuntime(): AppearanceRuntime {
  const host = globalThis as RuntimeHost

  if (!host[PAYLOAD_MARKDOWN_APPEARANCE_RUNTIME_KEY])
    Object.defineProperty(globalThis, PAYLOAD_MARKDOWN_APPEARANCE_RUNTIME_KEY, {
      configurable: true,
      enumerable: false,
      value: { ttl: 30_000 },
      writable: false,
    })

  return host[PAYLOAD_MARKDOWN_APPEARANCE_RUNTIME_KEY]!
}

/** Called while the Payload config is built when `appearance` is enabled. */
export function registerAppearance({ slug, ttl }: { slug: string; ttl: number }) {
  const runtime = getRuntime()

  if (runtime.slug !== slug) runtime.cache = undefined
  runtime.slug = slug
  runtime.ttl = ttl
}

/** Called from `onInit` so renders without an explicit Payload instance can load palettes. */
export function attachAppearancePayload(payload: Payload) {
  getRuntime().payload = payload
}

/** Disables runtime palettes (the plugin was rebuilt without `appearance`). */
export function clearAppearance() {
  const runtime = getRuntime()

  runtime.slug = undefined
  runtime.cache = undefined
  runtime.pending = undefined
}

export function invalidateAppearancePalettes() {
  const runtime = getRuntime()

  runtime.cache = undefined
  runtime.pending = undefined
}

/** Slug of the appearance global, or `undefined` when it is not enabled. */
export function getAppearanceSlug(): string | undefined {
  return getRuntime().slug
}

/** Converts stored rows into palettes (validation happens where palettes are resolved). */
export function readAppearancePalettes(doc: unknown): MarkdownPalette[] {
  const rows = doc && typeof doc === 'object' ? (doc as { palettes?: unknown }).palettes : undefined
  if (!Array.isArray(rows)) return []

  return rows.flatMap((row): MarkdownPalette[] => {
    if (!row || typeof row !== 'object') return []

    const { id: _id, dark, ...rest } = row as Record<string, unknown>
    const palette = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null && value !== ''))
    const darkColors =
      dark && typeof dark === 'object'
        ? Object.fromEntries(
            Object.entries(dark as Record<string, unknown>).filter(
              ([key, value]) => key !== 'id' && value !== null && value !== '',
            ),
          )
        : {}

    return typeof palette.name === 'string'
      ? [{ ...(palette as MarkdownPalette), ...(Object.keys(darkColors).length > 0 ? { dark: darkColors } : {}) }]
      : []
  })
}

type PaletteSource = Pick<Payload, 'findGlobal'>

function isPaletteSource(value: unknown): value is PaletteSource {
  return Boolean(value) && typeof (value as PaletteSource).findGlobal === 'function'
}

/**
 * Palettes managed in the appearance global, cached per process. Returns `[]`
 * when the global is not enabled, no Payload instance is available, or it
 * cannot be read (for example before its migration ran); the render then uses
 * the configured palettes only.
 */
export async function loadAppearancePalettes(source?: unknown): Promise<MarkdownPalette[]> {
  const runtime = getRuntime()
  const slug = runtime.slug
  if (!slug) return []

  const now = Date.now()
  if (runtime.cache && runtime.cache.expires > now) return runtime.cache.palettes
  if (runtime.pending) return runtime.pending

  const payload = isPaletteSource(source) ? source : runtime.payload
  if (!payload) return []

  const pending = payload
    .findGlobal({ slug: slug as never, depth: 0, overrideAccess: true })
    .then((doc) => readAppearancePalettes(doc))
    .catch((error: unknown) => {
      if (!runtime.warned) {
        runtime.warned = true
        // eslint-disable-next-line no-console
        console.warn(
          `[payload-markdown] Could not load palettes from the "${slug}" global; rendering with configured palettes only. ` +
            `If you just enabled appearance on a SQL database, create and run a migration. (${error instanceof Error ? error.message : String(error)})`,
        )
      }

      return []
    })
    .then((palettes) => {
      if (runtime.pending === pending) {
        runtime.cache = { expires: Date.now() + runtime.ttl, palettes }
        runtime.pending = undefined
      }

      return palettes
    })

  runtime.pending = pending

  return pending
}
