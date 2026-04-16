import type { Field, GroupField } from 'payload'

import { vlMdCodeBlockConfig } from '../CodeBlockConfig/config.js'
import { vlMdTailwindField } from '../Tailwind/config.js'

export type BlocksParamsOptions = {
  admin?: Partial<GroupField['admin']>
  label?: string
  name?: string
}

export function vlMdConfig(options: BlocksParamsOptions = {}): Field {
  const { name = 'md-params', admin, label = 'Markdown Blocks Params' } = options

  return {
    name,
    type: 'group',
    admin,
    fields: [
      {
        name: 'enable',
        type: 'checkbox',
        admin: {
          description:
            'Whether to enable custom parameters for markdown blocks. ' +
            'This is required to use any of the other block parameter fields, but can be left disabled ' +
            'if you only need the default styles and behavior.',
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
