import type {
  FlattenedField,
  PayloadRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  Where,
} from 'payload'

import type { MarkdownAgentAccessMode } from './access.js'
import type { MarkdownBlocksOutline, MarkdownTarget } from './targets.js'
import type { MarkdownValidationResult } from './validate.js'

import { assertAgentAccess, MarkdownAgentError } from './access.js'
import { localApi } from './localApi.js'
import { collectMarkdownTargets, MARKDOWN_BLOCK_SLUG } from './targets.js'
import { validateMarkdown } from './validate.js'

/** A collection document (`collection` + `id`) or a global (`global`). */
export type MarkdownEntityRef =
  | { collection: string; global?: undefined; id: number | string }
  | { collection?: undefined; global: string; id?: undefined }

type BaseOptions = {
  /** Default `user`. The MCP tools use `mcpApiKey`. */
  access?: MarkdownAgentAccessMode
  locale?: string
  req: PayloadRequest
}

export type MarkdownDocument = {
  /** Admin edit URL. */
  adminUrl: string
  /** Blocks fields and their rows, in order (markdown and non-markdown blocks). */
  blocks: MarkdownBlocksOutline[]
  collection?: string
  /** Whether the collection or global saves drafts (writes stay unpublished until published). */
  drafts: boolean
  global?: string
  id?: number | string
  /** Front-end preview URL from `admin.preview`, when configured. */
  previewUrl?: string
  /** `draft` or `published` for draft-enabled entities. */
  status?: string
  targets: Array<{ chars: number; markdown?: string } & Omit<MarkdownTarget, 'markdown' | 'overrides'>>
  title: string
  /** Pass back as `ifUpdatedAt` to refuse a write when someone else saved in between. */
  updatedAt?: string
}

type Entity =
  | { config: SanitizedCollectionConfig; kind: 'collection'; slug: string }
  | { config: SanitizedGlobalConfig; kind: 'global'; slug: string }

type DataRecord = Record<string, unknown>

function resolveEntity(req: PayloadRequest, ref: { collection?: string; global?: string }): Entity {
  if (ref.collection && ref.global)
    throw new MarkdownAgentError('invalid_edit', 'Pass either "collection" or "global", not both.')

  if (ref.collection) {
    const config = localApi(req.payload).collections[ref.collection]?.config
    if (!config) throw new MarkdownAgentError('not_found', `Unknown collection "${ref.collection}".`)

    return { slug: ref.collection, config, kind: 'collection' }
  }

  if (ref.global) {
    const config = req.payload.config.globals.find((global) => global.slug === ref.global)
    if (!config) throw new MarkdownAgentError('not_found', `Unknown global "${ref.global}".`)

    return { slug: ref.global, config, kind: 'global' }
  }

  throw new MarkdownAgentError('invalid_edit', 'Pass "collection" (with "id") or "global".')
}

const hasDrafts = (entity: Entity): boolean => Boolean(entity.config.versions && entity.config.versions.drafts)

function adminUrl(req: PayloadRequest, entity: Entity, id?: number | string): string {
  const { routes, serverURL } = req.payload.config
  const base = `${serverURL ?? ''}${routes.admin}`

  return entity.kind === 'collection'
    ? `${base}/collections/${entity.slug}/${id}`
    : `${base}/globals/${entity.slug}`
}

async function previewUrl(
  req: PayloadRequest,
  entity: Entity,
  doc: DataRecord,
  locale?: string,
): Promise<string | undefined> {
  const preview = entity.config.admin?.preview
  if (typeof preview !== 'function') return undefined

  try {
    const url = await preview(doc, { locale: locale ?? req.locale ?? '', req, token: null })

    return typeof url === 'string' && url ? url : undefined
  } catch {
    return undefined
  }
}

function documentTitle(entity: Entity, doc: DataRecord): string {
  if (entity.kind === 'global') return String(entity.config.label && typeof entity.config.label === 'string' ? entity.config.label : entity.slug)

  const field = entity.config.admin?.useAsTitle ?? 'id'
  const value = doc[field]

  if (typeof value === 'string' || typeof value === 'number') return String(value)

  return typeof doc.id === 'string' || typeof doc.id === 'number' ? String(doc.id) : ''
}

async function loadDocument(
  req: PayloadRequest,
  entity: Entity,
  id: number | string | undefined,
  locale?: string,
): Promise<DataRecord> {
  try {
    if (entity.kind === 'global')
      return await localApi(req.payload).findGlobal({
        slug: entity.slug,
        depth: 0,
        draft: hasDrafts(entity),
        locale,
        overrideAccess: false,
        req,
      })

    if (id === undefined || id === null || id === '')
      throw new MarkdownAgentError('invalid_edit', `Pass the document "id" for collection "${entity.slug}".`)

    return await localApi(req.payload).findByID({
      id,
      collection: entity.slug,
      depth: 0,
      draft: hasDrafts(entity),
      locale,
      overrideAccess: false,
      req,
    })
  } catch (error) {
    if (error instanceof MarkdownAgentError) throw error
    const status = (error as { status?: number }).status

    if (status === 403) throw new MarkdownAgentError('forbidden', `Not allowed to read ${entity.kind} "${entity.slug}".`)
    if (status === 404)
      throw new MarkdownAgentError('not_found', `No document with id "${id}" in collection "${entity.slug}".`)
    throw error
  }
}

async function toMarkdownDocument(
  req: PayloadRequest,
  entity: Entity,
  doc: DataRecord,
  options: { includeMarkdown: boolean; locale?: string },
): Promise<MarkdownDocument> {
  const { outlines, targets } = collectMarkdownTargets(entity.config.flattenedFields, doc, req.payload)
  const id = entity.kind === 'collection' ? (doc.id as number | string) : undefined
  const url = await previewUrl(req, entity, doc, options.locale)

  return {
    adminUrl: adminUrl(req, entity, id),
    blocks: outlines,
    ...(entity.kind === 'collection' ? { id, collection: entity.slug } : { global: entity.slug }),
    drafts: hasDrafts(entity),
    ...(url ? { previewUrl: url } : {}),
    ...(typeof doc._status === 'string' ? { status: doc._status } : {}),
    targets: targets.map(({ markdown, overrides: _overrides, ...target }) => ({
      ...target,
      chars: markdown.length,
      ...(options.includeMarkdown ? { markdown } : {}),
    })),
    title: documentTitle(entity, doc),
    ...(typeof doc.updatedAt === 'string' ? { updatedAt: doc.updatedAt } : {}),
  }
}

function searchWhere(req: PayloadRequest, entity: Entity, search: string): Where {
  const fields = entity.config.flattenedFields
  const titleField = entity.kind === 'collection' ? entity.config.admin?.useAsTitle : undefined
  const idType = localApi(req.payload).collections[entity.slug]?.customIDType ?? localApi(req.payload).db.defaultIDType
  const or: Where[] = []

  if (titleField && titleField !== 'id') or.push({ [titleField]: { like: search } })
  if (fields.some((field: FlattenedField) => 'name' in field && field.name === 'slug'))
    or.push({ slug: { equals: search } })
  // Only compare ids of the database's id type: "Home" is not a numeric id.
  if (idType === 'number' ? /^\d+$/.test(search) : /^[\w-]+$/.test(search))
    or.push({ id: { equals: idType === 'number' ? Number(search) : search } })

  return { or }
}

export type ReadMarkdownOptions = {
  collection?: string
  global?: string
  id?: number | string
  /** Include each target's markdown (default `true`). */
  includeMarkdown?: boolean
  /** Maximum documents for `search` / `where` (default 5, max 25). */
  limit?: number
  /** Matches the title field (`like`), `slug` (`equals`) or `id`. */
  search?: string
  /** Payload `where` query, combined with `search` when both are given. */
  where?: Where
} & BaseOptions

/**
 * Finds documents and lists every markdown field and markdown block in them,
 * with refs to edit. Reads drafts when the collection has drafts, so agents
 * see the latest saved state.
 */
export async function readMarkdownDocuments(
  options: ReadMarkdownOptions,
): Promise<{ docs: MarkdownDocument[]; totalDocs: number }> {
  const { access = 'user', includeMarkdown = true, locale, req } = options
  const entity = resolveEntity(req, options)

  assertAgentAccess(req, entity.slug, 'find', access)

  if (entity.kind === 'global' || options.id !== undefined) {
    const doc = await loadDocument(req, entity, options.id, locale)

    return { docs: [await toMarkdownDocument(req, entity, doc, { includeMarkdown, locale })], totalDocs: 1 }
  }

  const clauses: Where[] = []
  if (options.where) clauses.push(options.where)
  if (options.search) clauses.push(searchWhere(req, entity, options.search))

  const result = await localApi(req.payload).find({
    collection: entity.slug,
    depth: 0,
    draft: hasDrafts(entity),
    limit: Math.min(Math.max(options.limit ?? 5, 1), 25),
    locale,
    overrideAccess: false,
    req,
    ...(clauses.length ? { where: clauses.length === 1 ? clauses[0] : { and: clauses } } : {}),
  })

  return {
    docs: await Promise.all(
      result.docs.map((doc) => toMarkdownDocument(req, entity, doc, { includeMarkdown, locale })),
    ),
    totalDocs: result.totalDocs,
  }
}

/** One change to a document's markdown. */
export type MarkdownEdit =
  | {
      /** Insert a new markdown block into a blocks field. */
      action: 'insert'
      /** Insert after this row id (any block type). Default: append. */
      after?: string
      /** Insert before this row id (any block type). */
      before?: string
      blockName?: string
      /** Data path of the blocks field, e.g. `layout`. */
      field: string
      markdown: string
    }
  | {
      /** Remove a markdown block. */
      action: 'remove'
      /** Ref (block id) of the markdown block. */
      target: string
    }
  | {
      /** Replace the markdown of a field or block. */
      action: 'replace'
      markdown: string
      /** Ref from `readMarkdownDocuments`: a block id or a markdown field path. */
      target: string
    }

export type MarkdownEditResult = {
  action: MarkdownEdit['action']
  /** Row id of an inserted block (available after a save). */
  blockId?: string
  index: number
  path?: string
  target?: string
  validation?: { headings: string[] } & Omit<MarkdownValidationResult, 'headings'>
}

export type WriteMarkdownOptions = {
  /** Save even when validation reports warnings (errors always block). */
  allowWarnings?: boolean
  /** Validate and plan without saving. */
  dryRun?: boolean
  edits: MarkdownEdit[]
  /** Refuse the write when the document's `updatedAt` differs (someone saved in between). */
  ifUpdatedAt?: string
  /** Allow writing a document another user has open (document locking). Default `false`. */
  overrideLock?: boolean
  /** Publish instead of saving a draft (draft-enabled entities only). */
  publish?: boolean
} & BaseOptions &
  MarkdownEntityRef

export type WriteMarkdownResult = {
  adminUrl: string
  edits: MarkdownEditResult[]
  previewUrl?: string
  saved: boolean
  /** `draft`: saved unpublished; `published`; `live`: the entity has no drafts, so the change is live. */
  status?: 'draft' | 'live' | 'published'
  updatedAt?: string
}

const segments = (path: string) => path.split('.')

function getAt(data: unknown, path: string): unknown {
  let current = data

  for (const key of segments(path)) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

function setAt(data: DataRecord, path: string, value: unknown) {
  const keys = segments(path)
  const last = keys.pop() as string
  const parent = keys.length ? getAt(data, keys.join('.')) : data

  if (!parent || typeof parent !== 'object')
    throw new MarkdownAgentError('invalid_edit', `Cannot write to "${path}".`)

  ;(parent as Record<string, unknown>)[last] = value
}

const summarize = (result: MarkdownValidationResult): MarkdownEditResult['validation'] => ({
  ...result,
  headings: result.headings.map((heading) => `${'#'.repeat(heading.depth)} ${heading.text}`),
})

function findTarget(targets: MarkdownTarget[], ref: string): MarkdownTarget {
  const target = targets.find((entry) => entry.ref === ref) ?? targets.find((entry) => entry.path === ref)

  if (!target)
    throw new MarkdownAgentError(
      'invalid_edit',
      `No markdown target "${ref}". Use a ref from markdownRead: ${targets.map((entry) => entry.ref).join(', ') || '(none)'}.`,
    )

  return target
}

/**
 * Applies markdown edits to one document: validates every new markdown with
 * the site's renderer first and saves nothing when any edit fails. Draft-enabled
 * entities get a draft unless `publish` is set. Only the top-level fields that
 * contain the edits are sent, so other fields are never rewritten.
 */
export async function writeMarkdown(options: WriteMarkdownOptions): Promise<WriteMarkdownResult> {
  const { access = 'user', locale, req } = options
  const entity = resolveEntity(req, options)

  assertAgentAccess(req, entity.slug, 'update', access)

  if (!Array.isArray(options.edits) || options.edits.length === 0)
    throw new MarkdownAgentError('invalid_edit', 'Pass at least one edit.')

  const drafts = hasDrafts(entity)
  if (options.publish && !drafts)
    throw new MarkdownAgentError('no_drafts', `"${entity.slug}" has no drafts; writes are live immediately. Omit "publish".`)

  const doc = await loadDocument(req, entity, options.id, locale)
  const id = entity.kind === 'collection' ? (doc.id as number | string) : undefined

  if (options.ifUpdatedAt && doc.updatedAt !== options.ifUpdatedAt)
    throw new MarkdownAgentError(
      'conflict',
      `The document changed since it was read (updatedAt ${String(doc.updatedAt)}, expected ${options.ifUpdatedAt}). Read it again and reapply the edits.`,
      { updatedAt: doc.updatedAt },
    )

  const { outlines, targets } = collectMarkdownTargets(entity.config.flattenedFields, doc, req.payload)
  const next = structuredClone(doc)
  const touched = new Set<string>()
  const results: MarkdownEditResult[] = []
  const collection = entity.kind === 'collection' ? entity.slug : undefined
  const settingsSource = req.payload

  // Replacements first: their paths refer to the document as read, before rows move.
  const ordered = options.edits
    .map((edit, index) => ({ edit, index }))
    .sort((a, b) => Number(a.edit.action !== 'replace') - Number(b.edit.action !== 'replace'))

  for (const { edit, index } of ordered) {
    if (edit.action === 'replace') {
      if (typeof edit.markdown !== 'string')
        throw new MarkdownAgentError('invalid_edit', `Edit ${index}: "markdown" is required for replace.`)

      const target = findTarget(targets, edit.target)
      const validation = await validateMarkdown(edit.markdown, {
        collection,
        overrides: target.overrides,
        payload: settingsSource,
        scope: target.scope,
      })

      setAt(next, target.path, edit.markdown)
      touched.add(segments(target.path)[0])
      results.push({ action: 'replace', index, path: target.path, target: target.ref, validation: summarize(validation) })
      continue
    }

    if (edit.action === 'remove') {
      const target = findTarget(targets, edit.target)

      if (!target.block || target.scope !== 'blocks')
        throw new MarkdownAgentError('invalid_edit', `Edit ${index}: only markdown blocks can be removed ("${edit.target}" is a field).`)

      const rows = getAt(next, target.block.field) as DataRecord[]
      const position = rows.findIndex((row) => row.id === target.block?.id)
      if (position >= 0) rows.splice(position, 1)

      touched.add(segments(target.block.field)[0])
      results.push({ action: 'remove', index, path: target.block.field, target: target.ref })
      continue
    }

    if (edit.action === 'insert') {
      const outline = outlines.find((entry) => entry.path === edit.field)

      if (!outline)
        throw new MarkdownAgentError(
          'invalid_edit',
          `Edit ${index}: no blocks field "${edit.field}". Blocks fields: ${outlines.map((entry) => entry.path).join(', ') || '(none)'}.`,
        )
      if (!outline.acceptsMarkdownBlocks)
        throw new MarkdownAgentError('invalid_edit', `Edit ${index}: "${edit.field}" does not allow markdown blocks.`)
      if (typeof edit.markdown !== 'string')
        throw new MarkdownAgentError('invalid_edit', `Edit ${index}: "markdown" is required for insert.`)

      const validation = await validateMarkdown(edit.markdown, { collection, payload: settingsSource, scope: 'blocks' })
      let rows = getAt(next, edit.field) as DataRecord[] | undefined

      if (!Array.isArray(rows)) {
        rows = []
        setAt(next, edit.field, rows)
      }

      const anchor = edit.after ?? edit.before
      let position = rows.length

      if (anchor) {
        const found = rows.findIndex((row) => row.id === anchor)
        if (found === -1)
          throw new MarkdownAgentError('invalid_edit', `Edit ${index}: no row "${anchor}" in "${edit.field}".`)
        position = edit.after ? found + 1 : found
      }

      rows.splice(position, 0, {
        blockType: MARKDOWN_BLOCK_SLUG,
        content: edit.markdown,
        ...(edit.blockName ? { blockName: edit.blockName } : {}),
      })
      touched.add(segments(edit.field)[0])
      results.push({ action: 'insert', index, path: edit.field, validation: summarize(validation) })
      continue
    }

    throw new MarkdownAgentError('invalid_edit', `Edit ${index}: unknown action "${(edit as { action?: string }).action}".`)
  }

  results.sort((a, b) => a.index - b.index)

  const blocking = results.filter(
    (result) =>
      result.validation &&
      (result.validation.errors.length > 0 ||
        result.validation.counts.error > 0 ||
        (!options.allowWarnings && result.validation.counts.warning > 0)),
  )
  const base = { adminUrl: adminUrl(req, entity, id), edits: results }

  if (blocking.length > 0) {
    if (options.dryRun) return { ...base, saved: false }

    throw new MarkdownAgentError(
      'validation_failed',
      `Nothing was saved: ${blocking.length} edit(s) did not validate. Fix the diagnostics${options.allowWarnings ? '' : ' (warnings included; pass allowWarnings only if the user accepts them)'} and retry.`,
      { edits: results },
    )
  }

  if (options.dryRun) return { ...base, saved: false }

  const data: DataRecord = Object.fromEntries([...touched].map((key) => [key, next[key]]))
  const draft = drafts && !options.publish
  if (drafts && options.publish) data._status = 'published'

  let saved: DataRecord

  try {
    saved =
      entity.kind === 'global'
        ? await localApi(req.payload).updateGlobal({
            slug: entity.slug,
            data,
            depth: 0,
            draft,
            locale,
            overrideAccess: false,
            overrideLock: options.overrideLock ?? false,
            req,
          })
        : await localApi(req.payload).update({
            id: id as number | string,
            collection: entity.slug,
            data,
            depth: 0,
            draft,
            locale,
            overrideAccess: false,
            overrideLock: options.overrideLock ?? false,
            req,
          })
  } catch (error) {
    throw toAgentError(error, entity)
  }

  // Report the ids Payload assigned to inserted rows.
  const after = collectMarkdownTargets(entity.config.flattenedFields, saved, req.payload)
  const before = new Set(outlines.flatMap((outline) => outline.rows.map((row) => row.id)))
  for (const result of results.filter((entry) => entry.action === 'insert')) {
    const outline = after.outlines.find((entry) => entry.path === result.path)
    const fresh = outline?.rows.find((row) => !before.has(row.id) && row.type === MARKDOWN_BLOCK_SLUG)
    if (fresh) {
      before.add(fresh.id)
      result.blockId = fresh.id
    }
  }

  const url = await previewUrl(req, entity, saved, locale)

  return {
    ...base,
    ...(url ? { previewUrl: url } : {}),
    saved: true,
    status: !drafts ? 'live' : draft ? 'draft' : 'published',
    ...(typeof saved.updatedAt === 'string' ? { updatedAt: saved.updatedAt } : {}),
  }
}

function toAgentError(error: unknown, entity: Entity): unknown {
  if (error instanceof MarkdownAgentError) return error

  const status = (error as { status?: number }).status
  const name = (error as { name?: string }).name
  const message = error instanceof Error ? error.message : String(error)

  if (status === 423 || name === 'Locked')
    return new MarkdownAgentError(
      'locked',
      `${message} Someone has this document open. Ask the user before retrying with overrideLock: true.`,
    )
  if (status === 403) return new MarkdownAgentError('forbidden', `Not allowed to update ${entity.kind} "${entity.slug}".`)

  return error
}

export type PublishMarkdownOptions = {
  /** Publish even when the draft's markdown has validation warnings (errors always block). */
  allowWarnings?: boolean
  overrideLock?: boolean
} & BaseOptions &
  MarkdownEntityRef

/**
 * Publishes the latest draft. Every markdown target in the draft is validated
 * first, so a draft that would render with errors (or warnings) is not published.
 */
export async function publishMarkdown(options: PublishMarkdownOptions): Promise<WriteMarkdownResult> {
  const { access = 'user', locale, req } = options
  const entity = resolveEntity(req, options)

  assertAgentAccess(req, entity.slug, 'update', access)

  if (!hasDrafts(entity))
    throw new MarkdownAgentError('no_drafts', `"${entity.slug}" has no drafts; its saved content is already live.`)

  const doc = await loadDocument(req, entity, options.id, locale)
  const id = entity.kind === 'collection' ? (doc.id as number | string) : undefined
  const { targets } = collectMarkdownTargets(entity.config.flattenedFields, doc, req.payload)
  const collection = entity.kind === 'collection' ? entity.slug : undefined

  const results: MarkdownEditResult[] = []
  for (const [index, target] of targets.entries()) {
    const validation = await validateMarkdown(target.markdown, {
      collection,
      overrides: target.overrides,
      payload: req.payload,
      scope: target.scope,
    })
    if (!validation.ok)
      results.push({ action: 'replace', index, path: target.path, target: target.ref, validation: summarize(validation) })
  }

  const blocking = results.filter(
    (result) =>
      result.validation &&
      (result.validation.errors.length > 0 ||
        result.validation.counts.error > 0 ||
        (!options.allowWarnings && result.validation.counts.warning > 0)),
  )

  if (blocking.length > 0)
    throw new MarkdownAgentError(
      'validation_failed',
      `Not published: ${blocking.length} markdown target(s) in the draft do not validate. Fix them with markdownWrite first.`,
      { targets: results },
    )

  let saved: DataRecord

  try {
    saved =
      entity.kind === 'global'
        ? await localApi(req.payload).updateGlobal({
            slug: entity.slug,
            data: { _status: 'published' },
            depth: 0,
            draft: false,
            locale,
            overrideAccess: false,
            overrideLock: options.overrideLock ?? false,
            req,
          })
        : await localApi(req.payload).update({
            id: id as number | string,
            collection: entity.slug,
            data: { _status: 'published' },
            depth: 0,
            draft: false,
            locale,
            overrideAccess: false,
            overrideLock: options.overrideLock ?? false,
            req,
          })
  } catch (error) {
    throw toAgentError(error, entity)
  }

  const url = await previewUrl(req, entity, saved, locale)

  return {
    adminUrl: adminUrl(req, entity, id),
    edits: results,
    ...(url ? { previewUrl: url } : {}),
    saved: true,
    status: 'published',
    ...(typeof saved.updatedAt === 'string' ? { updatedAt: saved.updatedAt } : {}),
  }
}
