import type { ArrayField, Field, GlobalConfig, Payload, Validate } from 'payload'

import type { PayloadMarkdownAppearanceOptions } from '../types.js'

import { PAYLOAD_MARKDOWN_PACKAGE } from '../package.js'
import { normalizePaletteColor, PALETTE_COLOR_FORMATS } from '../palettes/colors.js'
import { PALETTE_NAME_PATTERN } from '../palettes/index.js'
import { APPEARANCE_PALETTES_FIELD, type ResolvedAppearanceOptions } from './options.js'
import { invalidateAppearancePalettes, registerAppearance } from './runtime.js'

export { DEFAULT_APPEARANCE_SLUG, resolveAppearanceOptions } from './options.js'

const validateColor: Validate<null | string | undefined> = (value) => {
  if (value === null || value === undefined || value === '') return true

  return normalizePaletteColor(value) ? true : `Use ${PALETTE_COLOR_FORMATS}.`
}

function colorField(name: string, label: string, description: string): Field {
  return {
    name,
    type: 'text',
    admin: { description, placeholder: '#e95420', width: '33%' },
    label,
    validate: validateColor,
  }
}

function colorFields(prefix: 'dark' | 'light'): Field[] {
  const scheme = prefix === 'dark' ? ' in the dark scheme (empty: the light value)' : ''

  return [
    {
      type: 'row',
      fields: [
        colorField('color', 'Color', `Icon colour and duotone primary layer${scheme}.`),
        colorField('secondaryColor', 'Secondary color', `Duotone secondary layer${scheme} (empty: the colour).`),
        colorField('accent', 'Accent', `Links and hovered titles inside directives${scheme}.`),
      ],
    },
    {
      type: 'row',
      fields: [
        colorField('background', 'Background', `Surface of directives that use the palette${scheme}.`),
        colorField('border', 'Border', `Border of directives that use the palette${scheme}.`),
      ],
    },
  ]
}

const validatePaletteRows: Validate<null | undefined | unknown[]> = (rows) => {
  if (!Array.isArray(rows)) return true

  const seen = new Set<string>()

  for (const row of rows) {
    const name = row && typeof row === 'object' ? (row as { name?: unknown }).name : undefined
    if (typeof name !== 'string') continue
    if (seen.has(name)) return `Palette names must be unique: "${name}" is used more than once.`
    seen.add(name)
  }

  return true
}

const validateName: Validate<null | string | undefined> = (value) =>
  typeof value === 'string' && PALETTE_NAME_PATTERN.test(value)
    ? true
    : 'Use 1–48 lowercase letters, digits and dashes, starting with a letter (it is what markdown references).'

function palettesField(): ArrayField {
  return {
    name: APPEARANCE_PALETTES_FIELD,
    type: 'array',
    admin: {
      components: { RowLabel: `${PAYLOAD_MARKDOWN_PACKAGE}/client#MarkdownPaletteRowLabel` },
      description:
        'Named colour themes for markdown. Use one with palette="name" on a directive or "@pack/icon palette=name" on an icon. A palette here replaces a built-in or configured one with the same name.',
      initCollapsed: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'name',
            type: 'text',
            admin: { description: 'Referenced from markdown, for example "debian".', width: '50%' },
            required: true,
            validate: validateName,
          },
          {
            name: 'label',
            type: 'text',
            admin: { description: 'Optional display name.', width: '50%' },
          },
        ],
      },
      ...colorFields('light'),
      {
        name: 'secondaryOpacity',
        type: 'number',
        admin: {
          description: 'Opacity of the duotone secondary layer, 0–1 (empty: the icon’s own, 0.4 for Font Awesome).',
          step: 0.05,
        },
        max: 1,
        min: 0,
      },
      {
        name: 'dark',
        type: 'group',
        admin: { description: 'Optional dark-scheme colours.' },
        fields: colorFields('dark'),
        label: 'Dark scheme',
      },
    ],
    labels: { plural: 'Palettes', singular: 'Palette' },
    validate: validatePaletteRows,
  }
}

async function revalidateAfterChange(options: PayloadMarkdownAppearanceOptions, payload: Payload) {
  const revalidate = options.revalidate ?? true
  if (revalidate === false) return

  if (typeof revalidate === 'function') {
    await revalidate({ payload })
    return
  }

  try {
    // Next.js only: statically rendered pages hold the palettes they were
    // built with. Outside a Next.js request (scripts, seeding) this throws
    // and there is nothing to revalidate.
    const { revalidatePath } = await import('next/cache.js')
    revalidatePath('/', 'layout')
  } catch {
    // Not running in a Next.js request context.
  }
}

/**
 * The "Markdown Appearance" global: palettes editors and MCP agents manage at
 * runtime. Saving clears this process's palette cache and revalidates pages.
 */
export function createAppearanceGlobal(resolved: ResolvedAppearanceOptions): GlobalConfig {
  registerAppearance({ slug: resolved.slug, ttl: resolved.cacheTtl })

  return {
    slug: resolved.slug,
    access: {
      read: ({ req }) => Boolean(req.user),
      update: ({ req }) => Boolean(req.user),
      ...(resolved.options.access ?? {}),
    },
    admin: {
      description: 'Colour palettes for payload-markdown content.',
      group: 'Markdown',
      ...(resolved.options.admin ?? {}),
    },
    fields: [palettesField()],
    hooks: {
      afterChange: [
        async ({ req }) => {
          invalidateAppearancePalettes()
          await revalidateAfterChange(resolved.options, req.payload)
        },
      ],
    },
    label: 'Markdown Appearance',
  }
}
