'use client'

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { placeholder as cmPlaceholder, EditorView, keymap } from '@codemirror/view'
import React, { useEffect, useRef } from 'react'

type MarkdownCodeMirrorProps = {
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownCodeMirror: React.FC<MarkdownCodeMirrorProps> = ({
  onChangeAction,
  placeholder = 'Write markdown...',
  value = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        cmPlaceholder(placeholder),
        EditorView.theme({
          '&': {
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            minHeight: '500px',
          },
          '.cm-content': {
            minHeight: '500px',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-scroller': {
            fontFamily: 'monospace',
            minHeight: '500px',
            padding: '0.75rem',
          },
        }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          onChangeAction(update.state.doc.toString())
        }),
      ],
    })

    viewRef.current = new EditorView({
      parent: containerRef.current,
      state,
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChangeAction, placeholder])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const current = view.state.doc.toString()
    if (current === value) return

    view.dispatch({
      changes: {
        from: 0,
        insert: value,
        to: current.length,
      },
    })
  }, [value])

  return (
    <div className="min-h-125 overflow-hidden rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-950">
      <div ref={containerRef} />
    </div>
  )
}
