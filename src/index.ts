import type { CollectionConfig, CollectionSlug, Config, Plugin } from 'payload'

import { MarkdownBlock } from './blocks/MarkdownBlock/config.ts'
import { markdownField, type MarkdownFieldOptions } from './field/MarkdownField/config.ts'

export type PayloadMarkdownCollectionConfig = {
  field?: Omit<MarkdownFieldOptions, 'name'>
  fieldName?: string
}

export type PayloadMarkdownConfig = {
  collections?: Partial<Record<CollectionSlug, PayloadMarkdownCollectionConfig | true>>
  disabled?: boolean
}

function ensureMarkdownBlock(config: Config) {
  if (!config.blocks) config.blocks = []

  const alreadyExists = config.blocks.some((block) => block.slug === MarkdownBlock.slug)
  if (alreadyExists) return

  config.blocks.push(MarkdownBlock)
}

function ensureMarkdownField(
  collection: CollectionConfig,
  fieldName: string,
  fieldOptions?: Omit<MarkdownFieldOptions, 'name'>,
) {
  const alreadyExists = collection.fields.some(
    (field) => 'name' in field && field.name === fieldName,
  )

  if (alreadyExists) return

  collection.fields.push(
    markdownField({
      name: fieldName,
      label: 'Markdown',
      ...(fieldOptions || {}),
    }),
  )
}

export const payloadMarkdown =
  (pluginOptions: PayloadMarkdownConfig = {}): Plugin =>
  (config: Config): Config => {
    if (pluginOptions.disabled) return config

    ensureMarkdownBlock(config)

    if (!pluginOptions.collections || !config.collections) return config

    for (const [collectionSlug, collectionOptions] of Object.entries(pluginOptions.collections)) {
      if (!collectionOptions) continue

      const collection = config.collections.find((entry) => entry.slug === collectionSlug)
      if (!collection) continue

      if (collectionOptions === true) {
        ensureMarkdownField(collection, 'content')
        continue
      }

      ensureMarkdownField(
        collection,
        collectionOptions.fieldName || 'content',
        collectionOptions.field,
      )
    }

    return config
  }

export { MarkdownBlock, markdownField }
export type { MarkdownFieldOptions }
