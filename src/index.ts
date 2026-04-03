import type { CollectionConfig, Config, Plugin } from 'payload'

import type { PayloadMarkdownConfig, PayloadMarkdownGlobalPluginConfig } from './types.d.ts'

import { MarkdownBlock } from './blocks/MarkdownBlock/config.ts'
import { markdownField, type MarkdownFieldOptions } from './field/MarkdownField/config.ts'
import { markdownBlockGlobal } from './globals/MarkdownBlock/config.ts'

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

function ensureMarkdownGlobal(
  config: Config,
  globalOptions: boolean | PayloadMarkdownGlobalPluginConfig,
) {
  if (!config.globals) config.globals = []

  const resolvedOptions = globalOptions === true ? {} : globalOptions
  if (!resolvedOptions) return

  const globalConfig = markdownBlockGlobal(resolvedOptions)

  const alreadyExists = config.globals.some((global) => global.slug === globalConfig.slug)

  if (alreadyExists) return

  config.globals.push(globalConfig)
}

export const payloadMarkdown =
  (pluginOptions: PayloadMarkdownConfig = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }
    if (pluginOptions.enabled !== null && !pluginOptions.enabled) return config

    ensureMarkdownBlock(config)

    if (pluginOptions.global) ensureMarkdownGlobal(config, pluginOptions.global)

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
export type { MarkdownFieldOptions, PayloadMarkdownConfig }
