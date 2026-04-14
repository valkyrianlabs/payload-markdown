import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import React, { cache } from 'react'

import { RenderBlocks } from '../../../blocks/RenderBlocks'
import { LivePreviewListener } from '../../../components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return pages.docs
    ?.filter((doc) => doc.slug !== 'home')
    .map(({ slug }) => {
      return { slug }
    })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise

  const page: null | RequiredDataFromCollectionSlug<'pages'> = await queryPageBySlug({ slug })

  if (!page) return <div>Page not found...</div>

  const { layout } = page

  return (
    <article className="pt-16 pb-24">
      {draft && <LivePreviewListener />}

      <RenderBlocks blocks={layout} collectionSlug='pages' />
    </article>
  )
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
