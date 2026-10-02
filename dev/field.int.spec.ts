import type { TextField } from 'payload'

import { text } from 'payload/shared'
import { describe, expect, it } from 'vitest'

import { createMarkdownBlock } from '../src/blocks/MarkdownBlock/config'
import { DEFAULT_MARKDOWN_MAX_LENGTH, markdownField } from '../src/field/MarkdownField/config'

function validateLength(field: TextField, length: number) {
  return text('a'.repeat(length), {
    maxLength: field.maxLength,
    req: {
      payload: { config: { defaultMaxTextLength: 40_000 } },
      t: (key: string) => key,
    },
    required: false,
  } as never)
}

describe('CORE-7: long markdown is savable', () => {
  it('sets an explicit maxLength far above Payload defaultMaxTextLength', () => {
    const field = markdownField() as TextField

    expect(field.type).toBe('text')
    expect(field.maxLength).toBe(DEFAULT_MARKDOWN_MAX_LENGTH)
    expect(validateLength(field, 40_001)).toBe(true)
    expect(validateLength(field, 250_000)).toBe(true)
    expect(validateLength(field, DEFAULT_MARKDOWN_MAX_LENGTH + 1)).toBe('validation:shorterThanMax')
  })

  it('lets callers choose a different limit', () => {
    const field = markdownField({ maxLength: 100 }) as TextField

    expect(validateLength(field, 101)).toBe('validation:shorterThanMax')
  })

  it('applies the same limit to the markdown block content field', () => {
    const content = createMarkdownBlock().fields.find(
      (field) => 'name' in field && field.name === 'content',
    ) as TextField

    expect(content.maxLength).toBe(DEFAULT_MARKDOWN_MAX_LENGTH)
    expect(content.required).toBe(true)
  })
})
