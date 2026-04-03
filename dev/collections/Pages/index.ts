import type { AccessArgs, CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { Archive } from '../../blocks/ArchiveBlock/config.ts'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: ({ req }: AccessArgs) => Boolean(req.user),
    delete: ({ req }: AccessArgs) => Boolean(req.user),
    read: () => true,
    readVersions: ({ req }: AccessArgs) => Boolean(req.user),
    update: ({ req }: AccessArgs) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ['title', 'slug'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        })
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    slug: true,
    title: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      admin: {
        initCollapsed: true,
      },
      blocks: [Archive],
      required: true,
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
