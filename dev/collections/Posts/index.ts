import type { AccessArgs, CollectionConfig } from 'payload'

import { slugField } from 'payload'
import { markdownField } from 'payload-markdown'

import { generatePreviewPath } from '../../utilities/generatePreviewPath.ts'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost.ts'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: ({ req }: AccessArgs) => Boolean(req.user),
    delete: ({ req }: AccessArgs) => Boolean(req.user),
    read: () => true,
    readVersions: ({ req }: AccessArgs) => Boolean(req.user),
    update: ({ req }: AccessArgs) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        console.log("Generating live preview URL with data:", data);
        return generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        })
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
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
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    markdownField({
      name: 'content',
      label: 'Content',
    }),
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
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
