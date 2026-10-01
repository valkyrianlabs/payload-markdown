import React from 'react'

import type { MarkdownEditorDirectiveConfig } from '../directiveConfig.js'

import { MarkdownCodeMirrorClient } from './Component.client.js'

type MarkdownCodeMirrorProps = {
  className?: string
  directiveConfig?: MarkdownEditorDirectiveConfig
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownCodeMirror: React.FC<MarkdownCodeMirrorProps> = (props) => {
  return <MarkdownCodeMirrorClient {...props} />
}
