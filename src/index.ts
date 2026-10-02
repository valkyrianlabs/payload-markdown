import type { Block, CollectionConfig, Config, Field, Plugin } from 'payload'

import type { MarkdownEditorDirectiveConfig } from './editor/directiveConfig.js'
import type { MarkdownFieldOptions, PayloadMarkdownCollectionConfig, PayloadMarkdownConfig } from './types.js'

import { createMarkdownBlock, MarkdownBlock } from './blocks/MarkdownBlock/config.js'
import { DEFAULT_CODE_LANGS } from './core/codeToHtml.js'
import {
  DEFAULT_CALLOUT_THEMES,
  DEFAULT_CARD_THEMES,
  DEFAULT_CARDS_THEMES,
  DEFAULT_CELL_THEMES,
  DEFAULT_COLUMNS_THEMES,
  DEFAULT_DETAILS_THEMES,
  DEFAULT_SECTION_THEMES,
  DEFAULT_STEPS_THEMES,
  DEFAULT_TAB_THEMES,
  DEFAULT_TABS_THEMES,
  DEFAULT_TOC_THEMES,
} from './directives/themes.js'
import {
  createEditorDirectiveConfig,
  PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY,
} from './editor/directiveConfig.js'
import { DEFAULT_MARKDOWN_MAX_LENGTH, markdownField } from './field/MarkdownField/config.js'
import {
  clearPayloadMarkdownSettings,
  resolveMarkdownBlockDefaults,
  resolveMarkdownFieldDefaults,
  setPayloadMarkdownSettings,
} from './runtime/index.js'

function ensureMarkdownBlock(config: Config, block: Block) {
  const blocks = config.blocks ?? []
  const alreadyExists = blocks.some((entry) => entry.slug === block.slug)
  if (alreadyExists) return

  // Copy-on-write: never mutate the caller's config arrays (CORE-18).
  config.blocks = [...blocks, block]
}

function withEditorConfig(
  fieldOptions: Omit<MarkdownFieldOptions, 'name'> | undefined,
  editorConfig: MarkdownEditorDirectiveConfig,
): Omit<MarkdownFieldOptions, 'name'> {
  return {
    ...(fieldOptions ?? {}),
    admin: {
      ...(fieldOptions?.admin ?? {}),
      custom: {
        ...(fieldOptions?.admin?.custom ?? {}),
        [PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY]: editorConfig,
      },
    },
  }
}

function withMarkdownField(
  collection: CollectionConfig,
  fieldName: string,
  fieldOptions?: Omit<MarkdownFieldOptions, 'name'>,
): CollectionConfig {
  const alreadyExists = collection.fields.some(
    (field) => 'name' in field && field.name === fieldName,
  )

  if (alreadyExists) return collection

  return {
    ...collection,
    fields: [
      ...collection.fields,
      markdownField({
        name: fieldName,
        label: 'Markdown',
        ...(fieldOptions || {}),
      }),
    ],
  }
}

/**
 * Returns `fields` with `block` added to every reachable blocks field. Field
 * objects and arrays on the modified paths are copied; the caller's objects
 * are never mutated (CORE-18).
 */
function withBlockInstalled(fields: Field[], block: Block): Field[] {
  let changed = false

  const next = fields.map((field): Field => {
    let updated: Field = field

    if (field.type === 'blocks') {
      const blocks = field.blocks ?? []

      if (!blocks.some((entry) => entry.slug === block.slug)) {
        updated = { ...field, blocks: [...blocks, block] }
      }
    }

    if ('fields' in updated && Array.isArray(updated.fields)) {
      const nestedFields = withBlockInstalled(updated.fields, block)
      if (nestedFields !== updated.fields) updated = { ...updated, fields: nestedFields } as Field
    }

    if (updated.type === 'tabs' && Array.isArray(updated.tabs)) {
      let tabsChanged = false
      const tabs = updated.tabs.map((tab) => {
        if (!('fields' in tab) || !Array.isArray(tab.fields)) return tab

        const tabFields = withBlockInstalled(tab.fields, block)
        if (tabFields === tab.fields) return tab

        tabsChanged = true
        return { ...tab, fields: tabFields }
      })

      if (tabsChanged) updated = { ...updated, tabs }
    }

    if (updated !== field) changed = true

    return updated
  })

  return changed ? next : fields
}

function withMarkdownBlockInCollectionBlocks(
  collection: CollectionConfig,
  block: Block,
): CollectionConfig {
  const fields = withBlockInstalled(collection.fields, block)

  return fields === collection.fields ? collection : { ...collection, fields }
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

    if (pluginOptions.enabled === false) {
      // A disabled plugin must not leave a previous configuration's render
      // defaults active (CORE-18).
      clearPayloadMarkdownSettings()
      return config
    }

    setPayloadMarkdownSettings(pluginOptions)

    // The admin editor gets the resolved theme names and icon pack aliases
    // for its scope through field.admin.custom (CORE-8).
    ensureMarkdownBlock(
      config,
      createMarkdownBlock(createEditorDirectiveConfig(resolveMarkdownBlockDefaults())),
    )

    if (!pluginOptions.collections || !config.collections) return config

    const collectionOptionsBySlug = pluginOptions.collections

    config.collections = config.collections.map((collection) => {
      const collectionOptions = collectionOptionsBySlug[collection.slug]
      if (!collectionOptions) return collection

      const resolved = resolveCollectionInstallBehavior(collection, collectionOptions)
      let next = collection

      if (resolved.installIntoBlocks)
        next = withMarkdownBlockInCollectionBlocks(
          next,
          createMarkdownBlock(
            createEditorDirectiveConfig(resolveMarkdownBlockDefaults(collection.slug)),
          ),
        )

      if (resolved.installField)
        next = withMarkdownField(
          next,
          resolved.fieldName,
          withEditorConfig(
            resolved.fieldOptions,
            createEditorDirectiveConfig(resolveMarkdownFieldDefaults(collection.slug)),
          ),
        )

      return next
    })

    return config
  }

export {
  DEFAULT_CALLOUT_THEMES,
  DEFAULT_CARD_THEMES,
  DEFAULT_CARDS_THEMES,
  DEFAULT_CELL_THEMES,
  DEFAULT_CODE_LANGS,
  DEFAULT_COLUMNS_THEMES,
  DEFAULT_DETAILS_THEMES,
  DEFAULT_MARKDOWN_MAX_LENGTH,
  DEFAULT_SECTION_THEMES,
  DEFAULT_STEPS_THEMES,
  DEFAULT_TAB_THEMES,
  DEFAULT_TABS_THEMES,
  DEFAULT_TOC_THEMES,
  MarkdownBlock,
  markdownField,
}
export type { MarkdownFieldOptions, PayloadMarkdownConfig }
export type {
  MarkdownCodeConfig,
  MarkdownDirectiveTheme,
  MarkdownDirectiveThemeGroup,
  MarkdownDirectiveThemes,
  PayloadMarkdownIconPack,
  PayloadMarkdownIconsConfig,
} from './types/core.js'
