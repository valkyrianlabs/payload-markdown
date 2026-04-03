import { MarkdownBlockComponent } from '@valkyrianlabs/payload-markdown/server'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types.ts'

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

            const blockProps = { block, collectionSlug }

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error - Need to verify block types more robustly */}
                  <Block {...blockProps} />
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
