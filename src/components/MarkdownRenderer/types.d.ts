import type React, { JSX } from 'react'

export type RenderMarkdownOptions = {
  theme?: string
}

export type RenderMarkdownResult = {
  html: string
  warnings: string[]
}

export type BaseMarkdownRendererProps = {
  as?: keyof JSX.IntrinsicElements
  className?: string
  emptyFallback?: React.ReactNode
  errorFallback?: React.ReactNode
  markdown?: null | string
  options?: RenderMarkdownOptions
  wrapperClassName?: string
}

export type MarkdownVariant = 'blog' | 'compact' | 'docs' | 'unstyled'
export type MarkdownSize = 'lg' | 'md' | 'sm'

export type MarkdownRendererProps = {
  centered?: boolean
  className?: string
  enableGutter?: boolean
  fullBleedCode?: boolean
  lead?: ReactNode
  mutedHeadings?: boolean
  size?: MarkdownSize
  variant?: MarkdownVariant
  wrapperClassName?: string
} & Omit<BaseMarkdownRendererProps, 'className' | 'wrapperClassName'>
