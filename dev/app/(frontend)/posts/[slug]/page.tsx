import configPromise from '@payload-config'
import { MarkdownRenderer } from '@valkyrianlabs/payload-markdown/client'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { LivePreviewListener } from '../../../../components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs
    .map((doc) => doc.slug)
    .filter((slug): slug is string => slug !== null && slug.length > 0)
    .map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  if (!post) return <div>Not Found</div>

  return (
    <main className="min-h-screen bg-background text-foreground">
      {draft && <LivePreviewListener />}

      <article className="mx-auto w-full max-w-5xl px-6 py-12 md:px-8 md:py-16">
        <header className="mx-auto mb-10 max-w-3xl border-b border-border pb-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Post</p>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {post.title}
            </h1>

            {(post.publishedAt || post.createdAt) && (
              <div className="text-sm text-muted-foreground">
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt}>
                    Published{' '}
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                ) : (
                  <time dateTime={post.createdAt}>
                    Created{' '}
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-3xl">
          <MarkdownRenderer
            as="article"
            className={[
              'prose prose-lg max-w-none dark:prose-invert',
              'prose-headings:font-semibold prose-headings:tracking-tight',
              'prose-h1:mb-6 prose-h1:text-4xl',
              'prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-3xl',
              'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-2xl',
              'prose-p:leading-8',
              'prose-a:text-cyan-400 hover:prose-a:text-cyan-300',
              'prose-strong:text-foreground',
              'prose-hr:my-10 prose-hr:border-border',
              'prose-blockquote:border-l-cyan-400 prose-blockquote:text-muted-foreground',
              'prose-ul:my-6 prose-ol:my-6',
              'prose-li:my-1',
              'prose-pre:rounded-2xl prose-pre:border prose-pre:border-border',
              'prose-pre:bg-neutral-950 prose-pre:px-0 prose-pre:py-0',
              'prose-code:text-[0.9em]',
              'prose-img:rounded-2xl prose-img:border prose-img:border-border',
              '[&_pre]:overflow-x-auto',
              '[&_pre]:p-0',
              '[&_pre_shiki]:m-0 [&_pre_shiki]:rounded-2xl',
              '[&_pre_shiki]:border [&_pre_shiki]:border-border',
            ].join(' ')}
            markdown={post.content}
            // options={{ theme: 'github-dark' }}
            wrapperClassName="w-full"
          />
        </div>
      </article>
    </main>
  )
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
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
