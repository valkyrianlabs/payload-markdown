import type { LayoutDirectiveDefinition } from '../types.js'

export const sectionDirective: LayoutDirectiveDefinition = {
  name: 'section',
  applyHast(node, config, { mergeClassNames }) {
    node.properties.className = mergeClassNames(
      'bg-black/10 dark:bg-white/10',
      'w-full mx-0 my-12 p-6',
      'backdrop-blur-2xl',
      'rounded-xl',
      '[&>h1]:my-2 [&>h1]:text-4xl [&>h1]:font-semibold',
      '[&>h2]:my-2 [&>h2]:text-4xl [&>h2]:font-semibold',
      'border-none',
      config.sectionClassName,
    )
  },
  editor: {
    label: 'Layout section',
    snippet: ':::section\n\n:::endsection\n',
  },
  kind: 'section',
  openMarker: ':::section',
  tagName: 'section',
}
