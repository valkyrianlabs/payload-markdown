import type { PayloadRequest } from 'payload'

import type { MarkdownPalette, MarkdownRenderConfig } from '../types/core.js'
import type { MarkdownAgentAccessMode } from './access.js'

import { readAppearancePalettes } from '../appearance/runtime.js'
import { describePaletteContrast } from '../palettes/contrast.js'
import { DEFAULT_PALETTES, describePalette, getPaletteRegistry, validatePalette } from '../palettes/index.js'
import { readPayloadMarkdownSettings, resolveMarkdownRenderConfig } from '../runtime/index.js'
import { assertAgentAccess, MarkdownAgentError } from './access.js'
import { localApi } from './localApi.js'

export type MarkdownPaletteSource = 'admin' | 'built-in' | 'config'

export type MarkdownPaletteListing = {
  /** Where palettes can be managed at runtime. */
  appearance:
    | { enabled: false; hint: string }
    | { enabled: true; readable: boolean; slug: string }
  palettes: Array<{ source: MarkdownPaletteSource } & MarkdownPalette>
  usage: string[]
}

type BaseOptions = {
  access?: MarkdownAgentAccessMode
  req: PayloadRequest
}

export const PALETTE_USAGE = [
  'Directive palette (surface, border, accent; its icons follow): :::card[Title]{palette="name"} … also callout, cards, button, details, section, steps, tabs.',
  'One icon: icon="@pack/icon palette=name". Each entry of a list carries its own: icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu".',
  'Default for a directive\'s icons without their own: iconPalette="name" (card, cards, callout, button).',
]

function appearanceSlug(req: PayloadRequest): string | undefined {
  return readPayloadMarkdownSettings(req.payload)?.appearanceSlug
}

function requireAppearance(req: PayloadRequest): string {
  const slug = appearanceSlug(req)

  if (!slug)
    throw new MarkdownAgentError(
      'not_enabled',
      'Runtime palettes are not enabled. Add `appearance: true` to payloadMarkdown() (a developer change), or use the palettes listed by markdownPalettes.',
    )

  return slug
}

async function readRows(req: PayloadRequest, slug: string): Promise<Array<Record<string, unknown>>> {
  try {
    const doc = await localApi(req.payload).findGlobal({ slug, depth: 0, overrideAccess: false, req })
    const rows = (doc as { palettes?: unknown }).palettes

    return Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : []
  } catch (error) {
    if ((error as { status?: number }).status === 403)
      throw new MarkdownAgentError('forbidden', `Not allowed to read global "${slug}".`)
    throw error
  }
}

/**
 * Every palette markdown can use in a scope, with where it comes from. Admin
 * palettes are read as the request's user; without read access the listing
 * still shows the built-in and configured palettes.
 */
export async function listMarkdownPalettes(
  options: { collection?: string } & BaseOptions,
): Promise<MarkdownPaletteListing> {
  const { access = 'user', req } = options
  const slug = appearanceSlug(req)
  let adminPalettes: MarkdownPalette[] = []
  let readable = false

  if (slug)
    try {
      assertAgentAccess(req, slug, 'find', access)
      adminPalettes = readAppearancePalettes({ palettes: await readRows(req, slug) })
      readable = true
    } catch (error) {
      if (!(error instanceof MarkdownAgentError) || error.code !== 'forbidden') throw error
    }

  const config = resolveMarkdownRenderConfig({
    collectionSlug: options.collection,
    runtimePalettes: adminPalettes,
    scope: 'field',
    settings: req.payload,
  }) as MarkdownRenderConfig
  const registry = getPaletteRegistry(config.palettes)
  const adminNames = new Set(adminPalettes.map((palette) => palette.name))
  const builtInNames = new Set(DEFAULT_PALETTES.map((palette) => palette.name))

  return {
    appearance: slug
      ? { slug, enabled: true, readable }
      : { enabled: false, hint: 'Runtime palettes are off; add `appearance: true` to payloadMarkdown() to manage them here.' },
    palettes: registry.names().map((name) => {
      const palette = registry.get(name)!

      return {
        ...describePalette(palette),
        source: adminNames.has(name) ? 'admin' : builtInNames.has(name) && !isConfigured(config, name) ? 'built-in' : 'config',
      }
    }),
    usage: PALETTE_USAGE,
  }
}

function isConfigured(config: MarkdownRenderConfig, name: string): boolean {
  const palettes = config.palettes
  const items = Array.isArray(palettes) ? palettes : (palettes?.items ?? [])

  // Built-ins are added by the registry, never part of the configured layers.
  return items.some((item) => item?.name === name)
}

function toRow(palette: MarkdownPalette, id?: unknown): Record<string, unknown> {
  return {
    ...(id !== undefined ? { id } : {}),
    name: palette.name,
    accent: palette.accent ?? null,
    background: palette.background ?? null,
    border: palette.border ?? null,
    color: palette.color ?? null,
    dark: {
      accent: palette.dark?.accent ?? null,
      background: palette.dark?.background ?? null,
      border: palette.dark?.border ?? null,
      color: palette.dark?.color ?? null,
      secondaryColor: palette.dark?.secondaryColor ?? null,
    },
    label: palette.label ?? null,
    secondaryColor: palette.secondaryColor ?? null,
    secondaryOpacity: palette.secondaryOpacity ?? null,
  }
}

async function writeRows(req: PayloadRequest, slug: string, rows: Array<Record<string, unknown>>) {
  try {
    await localApi(req.payload).updateGlobal({ slug, data: { palettes: rows }, depth: 0, overrideAccess: false, req })
  } catch (error) {
    if ((error as { status?: number }).status === 403)
      throw new MarkdownAgentError('forbidden', `Not allowed to update global "${slug}".`)
    throw error
  }
}

export type SavePaletteResult = {
  /** Advisory contrast notes; the palette was saved regardless. */
  contrast: string[]
  created: boolean
  palette: MarkdownPalette
  usage: string[]
}

/**
 * Creates or replaces a palette in the appearance global, by name. Pass
 * `previousName` to rename one (markdown that uses the old name then reports
 * an unknown palette). Values are validated before anything is saved.
 */
export async function saveMarkdownPalette(
  options: { palette: unknown; previousName?: string } & BaseOptions,
): Promise<SavePaletteResult> {
  const { access = 'user', req } = options
  const slug = requireAppearance(req)
  const { errors, palette } = validatePalette(options.palette)

  if (!palette) throw new MarkdownAgentError('invalid_palette', `The palette is invalid: ${errors.join(' ')}`, { errors })

  assertAgentAccess(req, slug, 'update', access)

  const rows = await readRows(req, slug)
  const target = options.previousName?.trim() || palette.name
  const index = rows.findIndex((row) => row.name === target)

  if (options.previousName && index < 0)
    throw new MarkdownAgentError('not_found', `No palette named "${target}" in "${slug}" to rename.`)
  if (target !== palette.name && rows.some((row) => row.name === palette.name))
    throw new MarkdownAgentError('conflict', `A palette named "${palette.name}" already exists.`)

  const described = describePalette(palette)
  const next = [...rows]

  if (index >= 0) next[index] = toRow(described, rows[index].id)
  else next.push(toRow(described))

  await writeRows(req, slug, next)

  return {
    contrast: describePaletteContrast(palette),
    created: index < 0,
    palette: described,
    usage: PALETTE_USAGE.map((line) => line.replaceAll('"name"', `"${palette.name}"`).replaceAll('=name', `=${palette.name}`)),
  }
}

/** Deletes a palette from the appearance global. Markdown that still uses it then reports an unknown palette. */
export async function deleteMarkdownPalette(
  options: { name: string } & BaseOptions,
): Promise<{ deleted: string }> {
  const { access = 'user', req } = options
  const slug = requireAppearance(req)

  assertAgentAccess(req, slug, 'update', access)

  const rows = await readRows(req, slug)
  const next = rows.filter((row) => row.name !== options.name)

  if (next.length === rows.length)
    throw new MarkdownAgentError('not_found', `No palette named "${options.name}" in "${slug}". Built-in and configured palettes cannot be deleted here.`)

  await writeRows(req, slug, next)

  return { deleted: options.name }
}
