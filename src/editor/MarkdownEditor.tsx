'use client'

import type { StaticLabel } from 'payload'

import React from 'react'

import { MarkdownCodeMirror } from './MarkdownCodeMirror.tsx'

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
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{String(label)}</div>

      <MarkdownCodeMirror onChangeAction={onChangeAction} placeholder={placeholder} value={value} />
    </div>
  )
}
