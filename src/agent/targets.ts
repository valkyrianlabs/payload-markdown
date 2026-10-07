import type { FlattenedBlock, FlattenedField, Payload } from 'payload'

import type { MarkdownBlockParams } from '../blocks/MarkdownBlock/params.js'
import type { MarkdownRenderConfig } from '../types/core.js'

import { resolveMarkdownBlockParams } from '../blocks/MarkdownBlock/params.js'
import {
  PAYLOAD_MARKDOWN_FIELD_COMPONENT,
  PAYLOAD_MARKDOWN_FIELD_CUSTOM_KEY,
} from '../field/MarkdownField/config.js'
import { localApi } from './localApi.js'

/** Slug of the reusable markdown block (`createMarkdownBlock`). */
export const MARKDOWN_BLOCK_SLUG = 'vlMdBlock'

/** Markdown that lives in a document: a markdown field, or the content of a markdown block. */
export type MarkdownTarget = {
  /** Set when the markdown sits inside a blocks row (innermost row). */
  block?: {
    /** Data path of the blocks field that holds the row, e.g. `layout`. */
    field: string
    id: string
    index: number
    name?: string
    type: string
  }
  /** Field label, or the block name for markdown blocks. */
  label: string
  markdown: string
  /** Enabled per-block `md-params`, the renderer's highest-precedence layer. */
  overrides?: MarkdownRenderConfig
  /** Dotted data path, e.g. `content`, `hero.body`, `layout.2.content`. */
  path: string
  /** Stable address for edits: the block id for markdown blocks, the path otherwise. */
  ref: string
  /** Render scope the site uses for this markdown. */
  scope: 'blocks' | 'field'
}

/** A blocks field in a document and its rows, so agents see the whole layout. */
export type MarkdownBlocksOutline = {
  /** Whether new markdown blocks can be inserted into this field. */
  acceptsMarkdownBlocks: boolean
  path: string
  rows: Array<{ id: string; markdownRef?: string; name?: string; type: string }>
}

/** Where markdown can live in a collection or global, described from its config. */
export type MarkdownSchemaLocation = {
  /** `layout[]` style path; `[]` marks an array or blocks row. */
  path: string
  type: 'block' | 'field'
}

type FieldLike = { custom?: Record<string, unknown> } & FlattenedField
type DataRecord = Record<string, unknown>

/** String form of an id-like value; anything else becomes ''. */
const scalar = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : ''

const isRecord = (value: unknown): value is DataRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const MARKDOWN_FIELD_COMPONENT_PATTERN = /^(?:@[\w.-]+\/)?payload-markdown\/server#PayloadMarkdownField$/

function componentPath(component: unknown): string | undefined {
  if (typeof component === 'string') return component
  if (isRecord(component) && typeof component.path === 'string') return component.path

  return undefined
}

/** True for fields created by `markdownField()` (or any text field using its admin component). */
export function isMarkdownField(field: FlattenedField): boolean {
  if (field.type !== 'text') return false
  if ((field as FieldLike).custom?.[PAYLOAD_MARKDOWN_FIELD_CUSTOM_KEY] === true) return true

  const component = componentPath(field.admin?.components?.Field)

  // Either package name (scoped or unscoped) may have created the field.
  return component === PAYLOAD_MARKDOWN_FIELD_COMPONENT || Boolean(component?.match(MARKDOWN_FIELD_COMPONENT_PATTERN))
}

function fieldLabel(field: FlattenedField): string {
  const label = 'label' in field ? field.label : undefined

  if (typeof label === 'string' && label) return label
  if (isRecord(label)) {
    const first = Object.values(label).find((value) => typeof value === 'string')
    if (typeof first === 'string') return first
  }

  return 'name' in field ? field.name : 'Markdown'
}

/** The blocks a blocks field allows, with `blockReferences` resolved against `payload.blocks`. */
export function getFieldBlocks(field: FlattenedField, payload: Payload): FlattenedBlock[] {
  if (field.type !== 'blocks') return []

  const references = field.blockReferences ?? []
  const resolved = references
    .map((entry) => (typeof entry === 'string' ? localApi(payload).blocks?.[entry] : entry))
    .filter((block): block is FlattenedBlock => Boolean(block))

  return [...(field.blocks ?? []), ...resolved]
}

type WalkContext = {
  block?: { params?: unknown } & MarkdownTarget['block']
  outlines: MarkdownBlocksOutline[]
  payload: Payload
  targets: MarkdownTarget[]
}

function walk(fields: FlattenedField[], data: DataRecord | undefined, prefix: string, ctx: WalkContext) {
  for (const field of fields) {
    if (!('name' in field) || !field.name) continue

    const path = prefix ? `${prefix}.${field.name}` : field.name
    const value = data?.[field.name]

    if (isMarkdownField(field)) {
      const inMarkdownBlock =
        ctx.block?.type === MARKDOWN_BLOCK_SLUG && field.name === 'content' && path === `${ctx.block.field}.${ctx.block.index}.content`
      const overrides = inMarkdownBlock
        ? resolveMarkdownBlockParams(ctx.block?.params as MarkdownBlockParams | undefined)
        : undefined

      ctx.targets.push({
        ...(ctx.block ? { block: { id: ctx.block.id, name: ctx.block.name, type: ctx.block.type, field: ctx.block.field, index: ctx.block.index } } : {}),
        label: inMarkdownBlock && ctx.block?.name ? ctx.block.name : fieldLabel(field),
        markdown: typeof value === 'string' ? value : '',
        ...(overrides ? { overrides } : {}),
        path,
        ref: inMarkdownBlock && ctx.block ? ctx.block.id : path,
        scope: inMarkdownBlock ? 'blocks' : 'field',
      })
      continue
    }

    switch (field.type) {
      case 'array': {
        if (!Array.isArray(value)) break
        value.forEach((row, index) => {
          if (isRecord(row)) walk(field.flattenedFields, row, `${path}.${index}`, ctx)
        })
        break
      }
      case 'blocks': {
        const allowed = getFieldBlocks(field, ctx.payload)
        const rows = Array.isArray(value) ? value.filter(isRecord) : []
        const outline: MarkdownBlocksOutline = {
          acceptsMarkdownBlocks: allowed.some((block) => block.slug === MARKDOWN_BLOCK_SLUG),
          path,
          rows: [],
        }
        ctx.outlines.push(outline)

        rows.forEach((row, index) => {
          const type = scalar(row.blockType)
          const id = scalar(row.id)
          const name = typeof row.blockName === 'string' && row.blockName ? row.blockName : undefined
          const block = allowed.find((entry) => entry.slug === type)
          const before = ctx.targets.length

          if (block)
            walk(block.flattenedFields, row, `${path}.${index}`, {
              ...ctx,
              block: { id, name, type, field: path, index, params: row['md-params'] },
            })

          const markdownRef = ctx.targets
            .slice(before)
            .find((target) => target.block?.id === id && target.scope === 'blocks')?.ref

          outline.rows.push({ id, ...(markdownRef ? { markdownRef } : {}), ...(name ? { name } : {}), type })
        })
        break
      }
      case 'group':
      case 'tab': {
        walk(field.flattenedFields, isRecord(value) ? value : undefined, path, ctx)
        break
      }
    }
  }
}

/** Every markdown target and blocks field in a document, in document order. */
export function collectMarkdownTargets(
  fields: FlattenedField[],
  data: DataRecord,
  payload: Payload,
): { outlines: MarkdownBlocksOutline[]; targets: MarkdownTarget[] } {
  const ctx: WalkContext = { outlines: [], payload, targets: [] }

  walk(fields, data, '', ctx)

  return { outlines: ctx.outlines, targets: ctx.targets }
}

/** Where markdown can live in a collection or global, from its config alone. */
export function describeMarkdownLocations(
  fields: FlattenedField[],
  payload: Payload,
  prefix = '',
  seen = new Set<FlattenedField[]>(),
): MarkdownSchemaLocation[] {
  if (seen.has(fields)) return []
  seen.add(fields)

  const locations: MarkdownSchemaLocation[] = []

  for (const field of fields) {
    if (!('name' in field) || !field.name) continue

    const path = prefix ? `${prefix}.${field.name}` : field.name

    if (isMarkdownField(field)) {
      locations.push({ type: 'field', path })
      continue
    }

    if (field.type === 'blocks') {
      for (const block of getFieldBlocks(field, payload)) {
        if (block.slug === MARKDOWN_BLOCK_SLUG) {
          locations.push({ type: 'block', path: `${path}[]` })
          continue
        }

        locations.push(...describeMarkdownLocations(block.flattenedFields, payload, `${path}[${block.slug}]`, seen))
      }
    } else if (field.type === 'array') {
      locations.push(...describeMarkdownLocations(field.flattenedFields, payload, `${path}[]`, seen))
    } else if (field.type === 'group' || field.type === 'tab') {
      locations.push(...describeMarkdownLocations(field.flattenedFields, payload, path, seen))
    }
  }

  return locations
}
