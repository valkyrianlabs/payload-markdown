import type { MarkdownBlockProps } from './types.d.ts'

import { MarkdownRenderer } from '../../components/MarkdownRenderer/Component.tsx'

export const MarkdownBlockComponent = ({ content } : MarkdownBlockProps) => {
  return (
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
        markdown={content}
        options={{ theme: 'github-dark' }}
        wrapperClassName="w-full"
      />
    </div>
  )
}
