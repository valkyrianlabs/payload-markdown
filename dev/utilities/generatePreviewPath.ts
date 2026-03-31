import type { CollectionSlug, PayloadRequest } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  req: PayloadRequest
  slug: string
}

export const generatePreviewPath = ({ slug, collection }: Props) => {
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${slug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/preview?${encodedParams.toString()}`
}
