'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { normalizePaletteColor } from '../palettes/colors.js'

type PaletteRow = {
  accent?: null | string
  background?: null | string
  border?: null | string
  color?: null | string
  dark?: { color?: null | string } | null
  label?: null | string
  name?: null | string
  secondaryColor?: null | string
}

function Swatch({ title, value }: { title: string; value?: null | string }) {
  // Rows hold unsaved input while editing: only validated colours reach style.
  const color = normalizePaletteColor(value)
  if (!color) return null

  return (
    <span
      aria-label={`${title}: ${color}`}
      style={{
        background: color,
        border: '1px solid rgb(128 128 128 / 0.4)',
        borderRadius: 4,
        display: 'inline-block',
        height: 14,
        width: 14,
      }}
      title={`${title}: ${color}`}
    />
  )
}

/** Row label for the appearance global's palettes: name, label and colour swatches. */
export function MarkdownPaletteRowLabel() {
  const { data, rowNumber } = useRowLabel<PaletteRow>()
  const name = data?.name || `Palette ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`

  return (
    <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
      <span style={{ display: 'inline-flex', gap: 3 }}>
        <Swatch title="Color" value={data?.color} />
        <Swatch title="Secondary" value={data?.secondaryColor} />
        <Swatch title="Background" value={data?.background} />
        <Swatch title="Dark color" value={data?.dark?.color} />
      </span>
      <code>{name}</code>
      {data?.label ? <span style={{ opacity: 0.7 }}>{data.label}</span> : null}
    </span>
  )
}
