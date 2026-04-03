import type { Field, TextField } from 'payload'

export type TailwindFieldOptions = {
  admin?: Partial<TextField['admin']>
  defaultValue?: string
  label?: string
  name?: string
  required?: boolean
}

export function tailwindField(options: TailwindFieldOptions = {}): Field {
  const {
    name = 'vlTailwindsField',
    admin,
    defaultValue,
    label = 'Tailwinds',
    required = false
  } = options

  return {
    name,
    type: 'text',
    admin,
    defaultValue,
    label,
    required,
  }
}
