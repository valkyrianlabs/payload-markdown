'use client'

import type { TextFieldClientComponent } from 'payload'

import { useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { MarkdownEditor } from '../../editor/MarkdownEditor.tsx'

const SAVE_DEBOUNCE_MS = 800

export const PayloadMarkdownField: TextFieldClientComponent = (props) => {
  const { field, path } = props

  const { setValue, value } = useField<string>({ path })

  const [draftValue, setDraftValue] = useState<string>(value ?? '')

  // Sync in external value changes only when they actually differ.
  useEffect(() => {
    const nextValue = value ?? ''
    if (nextValue === draftValue) return
    setDraftValue(nextValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Debounce writes back into Payload form state / autosave machinery.
  useEffect(() => {
    if (draftValue === (value ?? '')) return

    const timer = window.setTimeout(() => {
      setValue(draftValue)
    }, SAVE_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [draftValue, value, setValue])

  return <MarkdownEditor
      label={field.label}
      onChangeAction={setDraftValue}
      placeholder={
        'placeholder' in field && typeof field.placeholder === 'string'
          ? field.placeholder
          : 'Write markdown...'
      }
      value={draftValue}
    />
}
