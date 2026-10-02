import React, { Fragment } from 'react'

import type { Page } from '../payload-types.ts'

// Import the built package (like payload.config.ts and the frontend pages) so
// the block shares the plugin's runtime settings and Turbopack resolves it.
import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'

import { ArchiveBlock } from './ArchiveBlock/Component.tsx'

const blockComponents = {
  archive: ArchiveBlock,
  vlMdBlock: MarkdownBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][],
  collectionSlug?: string
}> = (props) => {
  const { blocks, collectionSlug } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Spread the block data (content, blockType, ...) as props, as
              // documented in docs/getting-started/fields-and-blocks.md.
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error - block unions are not narrowed per component */}
                  <Block {...block} collectionSlug={collectionSlug} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
