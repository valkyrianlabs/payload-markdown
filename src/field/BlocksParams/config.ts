import type { Field, GroupField } from 'payload'

import { codeBlockParams } from '../CodeBlockParams/config.ts'
import { tailwindField } from '../TailwindField/config.ts'

export type BlocksParamsOptions = {
  admin?: Partial<GroupField['admin']>
  label?: string
  name?: string
}

export function blocksParams(options: BlocksParamsOptions = {}): Field {
  const {
    name = 'md-params',
    admin,
    label = 'Markdown Blocks Params',
  } = options

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
        name: 'mdGroup',
        type: 'group',
        admin: {
          condition: (_, siblingData) => !!siblingData?.['vlEnableBlocksParams'],
        },
        fields: [
          tailwindField({
            name: 'tailwind-wrapper',
            admin: {
              description: 'Additional Tailwind classes to apply to the block wrapper element.',
            },
            label: 'Tailwind Wrapper Classes',
          }),
          tailwindField({
            name: 'tailwind-element',
            admin: {
              description: 'Additional Tailwind classes to apply to the block element itself.',
            },
            label: 'Tailwind Markdown Element Classes',
          }),
          tailwindField({
            name: 'tailwind-section',
            admin: {
              description: 'Additional Tailwind classes to apply to the block section element.',
            },
            label: 'Tailwind Markdown Section Classes',
          }),
          tailwindField({
            name: 'tailwind-column',
            admin: {
              description: 'Additional Tailwind classes to apply to the block column element.',
            },
            label: 'Tailwind Markdown Column Classes',
          }),
          {
            type: 'row',
            fields: [
              {
                name: 'md-variant',
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
                name: 'md-size',
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
                name: 'md-centered',
                type: 'checkbox',
                admin: {
                  description: 'Whether to center the block content within its wrapper.',
                },
                label: 'Centered',
              },
              {
                name: 'md-enableGutter',
                type: 'checkbox',
                admin: {
                  description: 'Whether to apply horizontal gutter padding to the block wrapper.',
                },
                label: 'Enable Gutter',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'md-fullBleedCode',
                type: 'checkbox',
                admin: {
                  description:
                    'Whether fenced code blocks should extend beyond the normal content width on larger screens.',
                },
                label: 'Full Bleed Code',
              },
              {
                name: 'md-mutedHeadings',
                type: 'checkbox',
                admin: {
                  description: 'Whether heading colors should be slightly muted.',
                },
                label: 'Muted Headings',
              },
            ],
          },
          codeBlockParams()
        ],
      },
    ],
    label,
  }
}

