'use client'

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { Compartment, EditorState } from '@codemirror/state'
import { placeholder as cmPlaceholder, EditorView, keymap } from '@codemirror/view'
import React, { useEffect, useRef } from 'react'

import type { MarkdownEditorDirectiveConfig } from '../directiveConfig.js'

import { directiveCloseLabels } from '../directives/closeLabels.js'
import { createDirectiveCompletions } from '../directives/completions.js'
import { createDirectiveDiagnostics } from '../directives/diagnostics.js'
import { payloadMarkdownTheme } from '../themes/payload.js'

type MarkdownCodeMirrorClientProps = {
  directiveConfig?: MarkdownEditorDirectiveConfig
  onChangeAction: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  value?: string
}

function readOnlyExtensions(readOnly: boolean) {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]
}

export const MarkdownCodeMirrorClient: React.FC<MarkdownCodeMirrorClientProps> = ({
  directiveConfig,
  onChangeAction,
  placeholder = 'Write markdown...',
  readOnly = false,
  value = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const readOnlyCompartment = useRef(new Compartment())
  const readOnlyRef = useRef(readOnly)

  readOnlyRef.current = readOnly

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
        readOnlyCompartment.current.of(readOnlyExtensions(readOnlyRef.current)),
        directiveCloseLabels,
        createDirectiveCompletions(directiveConfig),
        createDirectiveDiagnostics(directiveConfig),
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
  }, [directiveConfig, onChangeAction, placeholder])

  // Honour Payload read-only state (no update access, locked documents) by
  // reconfiguring the existing view instead of recreating it.
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.current.reconfigure(readOnlyExtensions(readOnly)),
    })
  }, [readOnly])

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
      aria-readonly={readOnly || undefined}
      data-read-only={readOnly ? 'true' : undefined}
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
