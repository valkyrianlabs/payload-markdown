'use client'

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { placeholder as cmPlaceholder, EditorView, keymap } from '@codemirror/view'
import React, { useEffect, useRef } from 'react'

import { payloadMarkdownTheme } from '../themes/payload.js'

type MarkdownCodeMirrorClientProps = {
  onChangeAction: (value: string) => void
  placeholder?: string
  value?: string
}

export const MarkdownCodeMirrorClient: React.FC<MarkdownCodeMirrorClientProps> = ({
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
        EditorView.lineWrapping,
        cmPlaceholder(placeholder),
        payloadMarkdownTheme,
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
    <div
      style={{
        border: '1px solid rgba(120, 120, 120, .5)',
        borderRadius: '5px',
        maxHeight: '80vh',
        minHeight: '125px',
        overflowX: 'hidden',
        overflowY: 'scroll',
        padding: '6px 0',
      }}
    >
      <div ref={containerRef} />
    </div>
  )
}
