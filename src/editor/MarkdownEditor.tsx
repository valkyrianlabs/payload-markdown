'use client'

import type { StaticLabel } from 'payload'

import React from 'react'

import { MarkdownCodeMirror } from './MarkdownCodeMirror.js'

type MarkdownEditorProps = {
  label?: StaticLabel
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  label = 'Markdown',
  onChangeAction,
  placeholder = 'Write markdown...',
  value = '',
}) => {
  return (
    <div style={{}}>
      <div style={{ margin: '1rem 0' }}>{String(label)}</div>

      <MarkdownCodeMirror onChangeAction={onChangeAction} placeholder={placeholder} value={value} />
    </div>
  )
}
