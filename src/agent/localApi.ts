import type { FlattenedBlock, SanitizedCollectionConfig } from 'payload'

type Args = Record<string, unknown>
type Doc = Record<string, unknown>

/**
 * The Local API with plain string slugs. Apps that generate Payload types narrow collection,
 * global and block slugs to literal unions; the agent operations address whatever collection or
 * global an agent names at runtime, so they use this view instead of the generated one.
 */
export type LooseLocalApi = {
  blocks?: Record<string, FlattenedBlock | undefined>
  collections: Record<string, { config: SanitizedCollectionConfig; customIDType?: 'number' | 'text' } | undefined>
  db: { defaultIDType: 'number' | 'text' }
  find(args: Args): Promise<{ docs: Doc[]; totalDocs: number }>
  findByID(args: Args): Promise<Doc>
  findGlobal(args: Args): Promise<Doc>
  update(args: Args): Promise<Doc>
  updateGlobal(args: Args): Promise<Doc>
}

export const localApi = (payload: unknown): LooseLocalApi => payload as LooseLocalApi
