'use client'

import type { CheckboxFieldClientComponent } from 'payload'

import { CheckboxField, useForm } from '@payloadcms/ui'
import React, { useCallback } from 'react'

import type { MarkdownBlockParamsConfig } from '../../types/core.js'

import { MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY } from './constants.js'

type FieldValue = boolean | null | string

/** Flattens the effective defaults into `config`-relative field paths. */
function toFieldEntries(defaults: MarkdownBlockParamsConfig): Array<[string, FieldValue]> {
  const entries: Array<[string, FieldValue]> = []

  for (const [key, value] of Object.entries(defaults)) {
    if (key === 'options') {
      for (const [optionKey, optionValue] of Object.entries(value ?? {}))
        entries.push([`options.${optionKey}`, (optionValue ?? null) as FieldValue])
      continue
    }

    entries.push([key, (value ?? null) as FieldValue])
  }

  return entries
}

/**
 * "Enable Blocks Params" checkbox of the markdown block. Checking it fills the
 * block's params with what the block currently renders with (global and
 * collection defaults, then the renderer's built-ins), so enabling changes
 * nothing until a field is edited; unchecking clears them again.
 */
export const MarkdownBlockParamsEnableField: CheckboxFieldClientComponent = (props) => {
  const { field, path } = props
  const { dispatchFields } = useForm()

  const custom = field.admin?.custom as Record<string, unknown> | undefined
  const defaults = custom?.[MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY] as
    | MarkdownBlockParamsConfig
    | undefined

  const handleChange = useCallback(
    (enabled: boolean) => {
      if (!defaults) return

      // `<block path>.md-params.enable` -> `<block path>.md-params.config`
      const groupPath = path.endsWith('.enable') ? path.slice(0, -'.enable'.length) : ''
      const configPath = groupPath ? `${groupPath}.config` : 'config'

      for (const [key, value] of toFieldEntries(defaults)) {
        dispatchFields({ type: 'UPDATE', path: `${configPath}.${key}`, value: enabled ? value : null })
      }
    },
    [defaults, dispatchFields, path],
  )

  return <CheckboxField {...props} onChange={handleChange} />
}
