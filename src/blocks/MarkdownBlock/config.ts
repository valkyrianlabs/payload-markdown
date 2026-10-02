import type { Block } from 'payload'

import type { MarkdownEditorDirectiveConfig } from '../../editor/directiveConfig.js'
import type { MarkdownBlockParamsConfig } from '../../types/core.js'

import { PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY } from '../../editor/directiveConfig.js'
import { vlMdConfig } from '../../field/Config/config.js'
import { markdownField } from '../../field/MarkdownField/config.js'

/**
 * Creates a markdown block definition. When `editorConfig` is given, the
 * block's markdown field carries it in `admin.custom` so the admin editor
 * lints and completes with the configured themes and icon packs. When
 * `effectiveDefaults` is given, enabling the block's params pre-fills them with
 * what the block renders with by default.
 */
export function createMarkdownBlock(
  editorConfig?: MarkdownEditorDirectiveConfig,
  effectiveDefaults?: MarkdownBlockParamsConfig,
): Block {
  return {
    slug: 'vlMdBlock',
    fields: [
      vlMdConfig(effectiveDefaults ? { effectiveDefaults } : {}),
      markdownField({
        name: 'content',
        ...(editorConfig
          ? { admin: { custom: { [PAYLOAD_MARKDOWN_ADMIN_CUSTOM_KEY]: editorConfig } } }
          : {}),
        label: 'Markdown Content',
        required: true,
      }),
    ],
    interfaceName: 'MarkdownBlock',
    labels: {
      plural: 'Markdown Blocks',
      singular: 'Markdown Block',
    },
  }
}

export const MarkdownBlock: Block = createMarkdownBlock()
