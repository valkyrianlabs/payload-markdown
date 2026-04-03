import type { MarkdownConfig } from '../core/types.d.ts'

export function resolveMarkdownConfig(
  ...layers: Array<MarkdownConfig | undefined>
): MarkdownConfig {
  const merged = Object.assign({}, ...layers.filter(Boolean))

  return {
    ...merged,
    options: Object.assign({}, ...layers.map((layer) => layer?.options).filter(Boolean)),
  }
}
