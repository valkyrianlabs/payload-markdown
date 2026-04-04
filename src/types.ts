import type { CollectionSlug, TextField } from 'payload'

import type { MarkdownConfig } from './core/types.js'

export type DualMarkdownFieldConfig = {
  blocks?: MarkdownConfig
  field?: MarkdownConfig
}

export type ConfigOptions = DualMarkdownFieldConfig | MarkdownConfig

export type MarkdownFieldOptions = {
  admin?: Partial<TextField['admin']>
  defaultValue?: string
  label?: string
  localized?: boolean
  name?: string
  required?: boolean
}

export type PayloadMarkdownCollectionConfig = {
  /**
   * Styling options for markdown fields added to the collection, and/or markdown fields added within blocks to the collection.
   */
  config?: ConfigOptions

  /**
   * Options for the markdown field.
   */
  field?: Omit<MarkdownFieldOptions, 'name'>

  /**
   * The name of the markdown field to add to the collection. Defaults to 'content'.
   */
  fieldName?: string

  /**
   * Whether to add a standalone markdown field to the collection.
   *
   * If not specified, this is inferred automatically:
   * - `true` when the collection does not contain any `blocks` fields
   * - `false` when the collection does contain `blocks` fields
   */
  installField?: boolean

  /**
   * Whether to install the markdown block into any `blocks` fields in the collection.
   *
   * If not specified, this is inferred automatically:
   * - `true` when the collection contains one or more `blocks` fields
   * - `false` when the collection does not contain any `blocks` fields
   *
   * Note: You must still add the MarkdownBlockComponent to your RenderBlocks.tsx
   * or equivalent for the block to render properly.
   */
  installIntoBlocks?: boolean
}

export interface PayloadMarkdownConfig {
  /**
   * Add markdown field to collections.
   * Set to `true` to add a field with default options, or an object to configure the field.
   */
  collections?: Partial<Record<CollectionSlug, PayloadMarkdownCollectionConfig | true>>

  /**
   * Add a global for markdown block settings, which can be used to provide default configuration values for all markdown in the project.
   */
  config?: ConfigOptions

  /**
   * Enable or disable plugin
   * @default false
   */
  enabled?: boolean
}
