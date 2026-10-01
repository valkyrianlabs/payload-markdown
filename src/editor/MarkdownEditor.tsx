import type { StaticLabel } from 'payload'

import React from 'react'

import type { MarkdownEditorDirectiveConfig } from './directiveConfig.js'

import { MarkdownCodeMirror } from './MarkdownCodeMirror/Component.js'

type MarkdownEditorProps = {
  directiveConfig?: MarkdownEditorDirectiveConfig
  label?: StaticLabel
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  directiveConfig,
  label = 'Markdown',
  onChangeAction,
  placeholder = 'Write markdown...',
  value = '',
}) => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
      <div style={{ margin: '1rem 0' }}>{String(label)}</div>
      <MarkdownCodeMirror
        directiveConfig={directiveConfig}
        onChangeAction={onChangeAction}
        placeholder={placeholder}
        value={value}
      />
    </>
  )
}
