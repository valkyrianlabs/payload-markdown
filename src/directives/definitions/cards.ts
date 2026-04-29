import type { ContainerDirective } from 'mdast-util-directive'

import type { LayoutDirectiveDefinition } from '../types.js'

export const CARD_GRID_COLUMNS = ['1', '2', '3', '4', 'auto'] as const
export const DEFAULT_CARD_GRID_COLUMNS = '3'

export type CardGridColumns = (typeof CARD_GRID_COLUMNS)[number]

const cardGridColumnClasses: Record<CardGridColumns, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  auto: 'grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]',
}

function isCardGridColumns(value: unknown): value is CardGridColumns {
  return typeof value === 'string' && CARD_GRID_COLUMNS.includes(value as CardGridColumns)
}

export function resolveCardGridColumns(node: ContainerDirective): CardGridColumns {
  const columns = node.attributes?.columns

  return isCardGridColumns(columns) ? columns : DEFAULT_CARD_GRID_COLUMNS
}

export const cardsDirective: LayoutDirectiveDefinition = {
  name: 'cards',
  allowedAttributes: ['columns'],
  applyHast(node, _config, { mergeClassNames }) {
    const columns =
      typeof node.properties.dataColumns === 'string'
        ? node.properties.dataColumns
        : DEFAULT_CARD_GRID_COLUMNS

    node.properties.className = mergeClassNames(
      'not-prose my-8 grid gap-4',
      cardGridColumnClasses[isCardGridColumns(columns) ? columns : DEFAULT_CARD_GRID_COLUMNS],
    )
  },
  defaultAttributes: {
    columns: DEFAULT_CARD_GRID_COLUMNS,
  },
  description: 'Responsive card grid for docs and landing-page content.',
  editor: {
    detail: 'Layout directive',
    label: 'Cards',
    snippet:
      ':::cards {columns="${3}"}\n\n:::card {title="${Title}"}\n${Content}\n:::\n\n:::card {title="${Title}"}\n${Content}\n:::\n\n:::\n${}',
  },
  getMdastRenderProperties(node) {
    return {
      dataColumns: resolveCardGridColumns(node),
      dataDirective: 'cards',
    }
  },
  kind: 'cards',
  openMarker: ':::cards',
  public: true,
  supportsAttributes: true,
  tagName: 'section',
  validateAttributes({ attributes }) {
    const warnings: string[] = []

    if (typeof attributes.columns === 'string' && !isCardGridColumns(attributes.columns))
      warnings.push(
        `Invalid cards columns "${attributes.columns}". Falling back to "${DEFAULT_CARD_GRID_COLUMNS}".`,
      )

    return warnings
  },
}
