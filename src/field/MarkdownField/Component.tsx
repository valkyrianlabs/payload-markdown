'use client'

import type { TextFieldClientComponent, Validate } from 'payload'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useConfig,
  useField,
} from '@payloadcms/ui'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { readEditorDirectiveConfig } from '../../editor/directiveConfig.js'
import { MarkdownCodeMirror } from '../../editor/MarkdownCodeMirror/Component.js'

const SAVE_DEBOUNCE_MS = 800
const fieldBaseClass = 'field-type'

export const PayloadMarkdownField: TextFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly: readOnlyFromProps, validate } = props
  const { admin, label, localized, maxLength, minLength, required } = field

  // Same client-side validation contract as Payload's own text field, so
  // length and required errors show before the server rejects a save.
  const memoizedValidate = useCallback<Validate>(
    (value, options) => {
      if (typeof validate !== 'function') return true

      return validate(value as string, {
        ...options,
        maxLength,
        minLength,
        required,
      } as Parameters<typeof validate>[1])
    },
    [validate, maxLength, minLength, required],
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField<string>({
    potentiallyStalePath: pathFromProps,
    validate: memoizedValidate,
  })

  const readOnly = Boolean(readOnlyFromProps || disabled || admin?.readOnly)
  const [draftValue, setDraftValue] = useState<string>(value ?? '')

  // Configured themes and icon packs, injected by the plugin (CORE-8). Keyed
  // by content so a new-but-equal config object does not rebuild the editor.
  const directiveConfigKey = JSON.stringify(admin?.custom ?? null)
  const staticDirectiveConfig = useMemo(
    () => readEditorDirectiveConfig(JSON.parse(directiveConfigKey)),
    [directiveConfigKey],
  )

  // Palettes managed in the admin are data, not config: load their names so
  // completions and lint know palettes created after the app was built. The
  // editor reads them through a getter, so their arrival does not rebuild it.
  const {
    config: { routes, serverURL },
  } = useConfig()
  const paletteNamesRef = useRef<readonly string[] | undefined>(undefined)
  const appearanceSlug = staticDirectiveConfig?.appearanceSlug
  const staticPalettes = staticDirectiveConfig?.palettes

  useEffect(() => {
    if (!appearanceSlug) return

    const controller = new AbortController()

    fetch(`${serverURL ?? ''}${routes.api}/globals/${encodeURIComponent(appearanceSlug)}?depth=0`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((doc: { palettes?: Array<{ name?: unknown }> } | undefined) => {
        // Without read access the names stay unknown and no palette is linted.
        if (!doc) return

        const names = (doc.palettes ?? []).flatMap((row) => (typeof row?.name === 'string' ? [row.name] : []))
        paletteNamesRef.current = [...new Set([...(staticPalettes ?? []), ...names])]
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [appearanceSlug, routes.api, serverURL, staticPalettes])

  const directiveConfig = useMemo(
    () =>
      staticDirectiveConfig && {
        ...staticDirectiveConfig,
        getPaletteNames: () => paletteNamesRef.current,
      },
    [staticDirectiveConfig],
  )

  // Sync in external value changes only when they actually differ.
  useEffect(() => {
    const nextValue = value ?? ''
    if (nextValue === draftValue) return
    setDraftValue(nextValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Debounce writes back into Payload form state / autosave machinery.
  useEffect(() => {
    if (readOnly) return
    if (draftValue === (value ?? '')) return

    const timer = window.setTimeout(() => {
      setValue(draftValue)
    }, SAVE_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [draftValue, readOnly, value, setValue])

  const placeholder =
    'placeholder' in field && typeof field.placeholder === 'string'
      ? field.placeholder
      : typeof admin?.placeholder === 'string'
        ? admin.placeholder
        : 'Write markdown...'

  return (
    <div
      className={[
        fieldBaseClass,
        'text',
        'payload-markdown-field',
        admin?.className,
        showError && 'error',
        readOnly && 'read-only',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={<FieldLabel label={label} localized={localized} path={path} required={required} />}
      />
      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        {BeforeInput}
        <MarkdownCodeMirror
          directiveConfig={directiveConfig}
          onChangeAction={setDraftValue}
          placeholder={placeholder}
          readOnly={readOnly}
          value={draftValue}
        />
        {AfterInput}
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={admin?.description} path={path} />}
        />
      </div>
    </div>
  )
}
