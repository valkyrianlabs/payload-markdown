import React from 'react'

import type { ArchiveBlock as ArchiveBlockProps } from '../../payload-types'

export const ArchiveBlock: React.FC<
  {
    id?: string
  } & ArchiveBlockProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (props) => {
  return (
    <div className="my-16" id={`block-1000`}>
      this is just a dummy block for now
    </div>
  )
}
