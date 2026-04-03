import type { CollectionSlug } from 'payload'

export type PayloadMarkdownCollectionConfig = {
  /**
   * Options for the markdown field.
   */
  field?: Omit<MarkdownFieldOptions, 'name'>

  /**
   * The name of the markdown field to add to the collection. Defaults to 'content'.
   */
  fieldName?: string
}

export type PayloadMarkdownGlobalPluginConfig = {
  /**
   * Label for the generated global.
   * @default 'Markdown Block Global Settings'
   */
  label?: string

  /**
   * Slug for the generated global.
   * @default 'vl-markdown-block-global'
   */
  slug?: string
}

export interface PayloadMarkdownConfig {
  /**
   * Add markdown field to collections.
   * Set to `true` to add a field with default options, or an object to configure the field.
   */
  collections?: Partial<Record<CollectionSlug, PayloadMarkdownCollectionConfig | true>>

  /**
   * Enable or disable plugin
   * @default false
   */
  enabled?: boolean

  /**
   * Auto-register a global for markdown defaults.
   * - true: use defaults
   * - object: customize the generated global
   */
  global?: boolean | PayloadMarkdownGlobalPluginConfig
}
