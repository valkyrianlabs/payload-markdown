import type { Field, GroupField } from 'payload'

import type { MarkdownBlockParamsConfig } from '../../types/core.js'

import {
  MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY,
  MARKDOWN_BLOCK_PARAMS_ENABLE_FIELD_COMPONENT,
} from '../../blocks/MarkdownBlock/constants.js'
import { vlMdCodeBlockConfig } from '../CodeBlockConfig/config.js'
import { vlMdTailwindField } from '../Tailwind/config.js'

export type BlocksParamsOptions = {
  admin?: Partial<GroupField['admin']>
  /**
   * What the block renders with when params are disabled (see
   * `resolveEffectiveMarkdownBlockParams`). When given, checking "Enable
   * Blocks Params" in the admin pre-fills the fields with these values and
   * unchecking clears them. The markdown block installed by the plugin passes
   * its collection's effective defaults.
   */
  effectiveDefaults?: MarkdownBlockParamsConfig
  label?: string
  name?: string
}

export function vlMdConfig(options: BlocksParamsOptions = {}): Field {
  const { name = 'md-params', admin, effectiveDefaults, label = 'Markdown Blocks Params' } = options

  return {
    name,
    type: 'group',
    admin,
    fields: [
      {
        name: 'enable',
        type: 'checkbox',
        admin: {
          ...(effectiveDefaults
            ? {
                components: { Field: MARKDOWN_BLOCK_PARAMS_ENABLE_FIELD_COMPONENT },
                custom: { [MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY]: effectiveDefaults },
              }
            : {}),
          description:
            'Override this block\'s rendering. When checked, the fields start from what the block ' +
            'currently renders with (global and collection settings), so you can change just the ' +
            'values you need.',
        },
        label: 'Enable Blocks Params',
      },
      {
        name: 'config',
        type: 'group',
        admin: {
          condition: (_, siblingData) => !!siblingData?.enable,
        },
        fields: [
          vlMdTailwindField({
            name: 'wrapperClassName',
            admin: {
              description: 'Additional Tailwind classes to apply to the block wrapper element.',
            },
            label: 'Tailwind Wrapper Classes',
          }),
          vlMdTailwindField({
            name: 'className',
            admin: {
              description: 'Additional Tailwind classes to apply to the block element itself.',
            },
            label: 'Tailwind Markdown Element Classes',
          }),
          vlMdTailwindField({
            name: 'sectionClassName',
            admin: {
              description: 'Additional Tailwind classes to apply to the block section element.',
            },
            label: 'Tailwind Markdown Section Classes',
          }),
          vlMdTailwindField({
            name: 'columnClassName',
            admin: {
              description: 'Additional Tailwind classes to apply to the block column element.',
            },
            label: 'Tailwind Markdown Column Classes',
          }),
          {
            type: 'row',
            fields: [
              {
                name: 'variant',
                type: 'select',
                admin: {
                  description: 'The visual style variant to apply to the block.',
                },
                dbName: 'vl_md_variant',
                defaultValue: 'blog',
                label: 'Variant',
                options: [
                  { label: 'Blog', value: 'blog' },
                  { label: 'Compact', value: 'compact' },
                  { label: 'Docs', value: 'docs' },
                  { label: 'Unstyled', value: 'unstyled' },
                ],
              },
              {
                name: 'size',
                type: 'select',
                admin: {
                  description: 'The typography size to apply to the block.',
                },
                dbName: 'vl_md_size',
                defaultValue: 'md',
                label: 'Size',
                options: [
                  { label: 'Large', value: 'lg' },
                  { label: 'Medium', value: 'md' },
                  { label: 'Small', value: 'sm' },
                ],
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'enableGutter',
                type: 'checkbox',
                admin: {
                  description: 'Whether to apply horizontal gutter padding to the block wrapper.',
                },
                label: 'Enable Gutter',
              },
              {
                name: 'fullBleedCode',
                type: 'checkbox',
                admin: {
                  description:
                    'Whether fenced code blocks should extend beyond the normal content width on larger screens.',
                },
                label: 'Full Bleed Code',
              },
              {
                name: 'mutedHeadings',
                type: 'checkbox',
                admin: {
                  description: 'Whether heading colors should be slightly muted.',
                },
                label: 'Muted Headings',
              },
            ],
          },
          vlMdCodeBlockConfig({ name: 'options' }),
        ],
      },
    ],
    label,
  }
}
