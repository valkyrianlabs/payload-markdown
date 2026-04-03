import type { Block, CollectionConfig, Config, Field, Plugin } from 'payload'

import type { PayloadMarkdownCollectionConfig, PayloadMarkdownConfig } from './types.d.ts'

import { MarkdownBlock } from './blocks/MarkdownBlock/config.ts'
import { markdownField, type MarkdownFieldOptions } from './field/MarkdownField/config.ts'
import { setPayloadMarkdownSettings } from './runtime/index.ts'

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

function ensureBlockInBlocksField(field: Field, block: Block) {
  if (field.type !== 'blocks') return

  if (!field.blocks) field.blocks = []

  const alreadyExists = field.blocks.some((entry) => entry.slug === block.slug)
  if (alreadyExists) return

  field.blocks.push(block)
}

function walkFieldsAndInstallBlock(fields: Field[], block: Block) {
  for (const field of fields) {
    ensureBlockInBlocksField(field, block)

    if ('fields' in field && Array.isArray(field.fields))
      walkFieldsAndInstallBlock(field.fields, block)

    if (field.type === 'tabs' && Array.isArray(field.tabs)) {
      for (const tab of field.tabs)
        if ('fields' in tab && Array.isArray(tab.fields))
          walkFieldsAndInstallBlock(tab.fields, block)
    }
  }
}

function ensureMarkdownBlockInCollectionBlocks(collection: CollectionConfig) {
  walkFieldsAndInstallBlock(collection.fields, MarkdownBlock)
}

function collectionHasBlocksField(fields: Field[]): boolean {
  for (const field of fields) {
    if (field.type === 'blocks') return true

    if ('fields' in field && Array.isArray(field.fields))
      if (collectionHasBlocksField(field.fields)) return true

    if (field.type === 'tabs' && Array.isArray(field.tabs))
      for (const tab of field.tabs)
        if ('fields' in tab && Array.isArray(tab.fields))
          if (collectionHasBlocksField(tab.fields)) return true
  }

  return false
}

function resolveCollectionInstallBehavior(
  collection: CollectionConfig,
  collectionOptions: PayloadMarkdownCollectionConfig | true,
) {
  const hasBlocksField = collectionHasBlocksField(collection.fields)

  if (collectionOptions === true) {
    return {
      fieldName: 'content',
      fieldOptions: undefined,
      installField: !hasBlocksField,
      installIntoBlocks: hasBlocksField,
    }
  }

  return {
    fieldName: collectionOptions.fieldName || 'content',
    fieldOptions: collectionOptions.field,
    installField: collectionOptions.installField ?? !hasBlocksField,
    installIntoBlocks: collectionOptions.installIntoBlocks ?? hasBlocksField,
  }
}

export const payloadMarkdown =
  (pluginOptions: PayloadMarkdownConfig = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    if (pluginOptions.enabled === false) return config

    setPayloadMarkdownSettings(pluginOptions)

    ensureMarkdownBlock(config)

    if (!pluginOptions.collections || !config.collections) return config

    for (const [collectionSlug, collectionOptions] of Object.entries(pluginOptions.collections)) {
      if (!collectionOptions) continue

      const collection = config.collections.find((entry) => entry.slug === collectionSlug)
      if (!collection) continue

      const resolved = resolveCollectionInstallBehavior(collection, collectionOptions)

      if (resolved.installIntoBlocks) ensureMarkdownBlockInCollectionBlocks(collection)

      if (resolved.installField)
        ensureMarkdownField(collection, resolved.fieldName, resolved.fieldOptions)
    }

    return config
  }

export { MarkdownBlock, markdownField }
export type { MarkdownFieldOptions, PayloadMarkdownConfig }
