import type { CollectionSlug, GlobalConfig, Payload, TextField } from 'payload'

import type {
  MarkdownCodeConfig,
  MarkdownConfig,
  MarkdownDirectiveThemes,
  MarkdownPalettes,
  PayloadMarkdownIconsConfig,
} from './types/core.js'

export type DualMarkdownFieldConfig = {
  blocks?: MarkdownConfig
  field?: MarkdownConfig
}

export type ConfigOptions = DualMarkdownFieldConfig | MarkdownConfig

/** Options for the "Markdown Appearance" global (`appearance` plugin option). */
export type PayloadMarkdownAppearanceOptions = {
  /**
   * Access control for the global. Default: any authenticated user may read
   * and update it. Rendering reads it on the server regardless.
   */
  access?: GlobalConfig['access']
  /** Admin options for the global (for example `group`). */
  admin?: GlobalConfig['admin']
  /**
   * How long, in milliseconds, a server process reuses the palettes it loaded
   * (default 30000). Saving the global clears the cache of the process that
   * saved it at once; other processes pick the change up within this time.
   */
  cacheTtl?: number
  /**
   * What happens after palettes change, so statically rendered pages pick
   * them up. `true` (default): revalidate every Next.js route
   * (`revalidatePath('/', 'layout')`). `false`: nothing. A function: runs
   * instead (for example to revalidate specific paths or tags).
   */
  revalidate?: ((args: { payload: Payload }) => Promise<void> | void) | boolean
  /** Global slug (default `markdown-appearance`). */
  slug?: string
}

export type MarkdownFieldOptions = {
  admin?: Partial<TextField['admin']>
  defaultValue?: string
  label?: string
  localized?: boolean
  /**
   * Maximum markdown length in characters. Defaults to
   * `DEFAULT_MARKDOWN_MAX_LENGTH` (1,000,000) instead of Payload's
   * `defaultMaxTextLength` (40,000). Validation only; no schema change.
   */
  maxLength?: number
  name?: string
  required?: boolean
}

export type PayloadMarkdownCollectionConfig = {
  /**
   * Code fence / Shiki rendering options for markdown in this collection.
   */
  code?: MarkdownCodeConfig

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

  /**
   * Colour palettes for markdown in this collection (added to the plugin's).
   */
  palettes?: MarkdownPalettes

  /**
   * Directive theme registry extensions for markdown in this collection.
   */
  themes?: MarkdownDirectiveThemes
}

export interface PayloadMarkdownConfig {
  /**
   * Adds the "Markdown Appearance" global, where admins and MCP agents manage
   * colour palettes at runtime, without code changes or a rebuild. Off by
   * default: enabling it adds a global (and, on SQL databases, a migration).
   */
  appearance?: boolean | PayloadMarkdownAppearanceOptions

  /**
   * Code fence / Shiki rendering options.
   */
  code?: MarkdownCodeConfig

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
   * @default true
   */
  enabled?: boolean

  /**
   * Local SVG icon pack configuration for markdown directives.
   */
  icons?: PayloadMarkdownIconsConfig

  /**
   * Named colour palettes, referenced from markdown with `palette="name"` on a
   * directive or `@pack/icon palette=name` on an icon. Added to the built-in
   * hue palettes (`{ extendDefaults: false, items }` drops those). Palettes
   * managed in the admin (see `appearance`) override these by name.
   */
  palettes?: MarkdownPalettes

  /**
   * Directive theme registry extensions.
   */
  themes?: MarkdownDirectiveThemes
}
