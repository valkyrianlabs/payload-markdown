import React from 'react'

import { MarkdownCodeMirrorClient } from './Component.client.js'

type MarkdownCodeMirrorProps = {
  className?: string
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownCodeMirror: React.FC<MarkdownCodeMirrorProps> = (props) => {
  return <MarkdownCodeMirrorClient {...props} />
}
