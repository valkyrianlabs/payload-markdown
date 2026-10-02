import type { Extension } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'

import { RangeSetBuilder, StateEffect } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view'

import { getDirectiveCloseLabels } from '../../directives/closeLabels.js'

const closeLabelMark = Decoration.mark({
  class: 'vl-md-directive-close-label vl-md-directive-close-label--suffix',
})

class CloseLabelWidget extends WidgetType {
  constructor(private readonly label: string) {
    super()
  }

  eq(widget: CloseLabelWidget): boolean {
    return widget.label === this.label
  }

  ignoreEvent(): boolean {
    return true
  }

  toDOM(): HTMLElement {
    const label = document.createElement('span')

    label.setAttribute('aria-hidden', 'true')
    label.className = 'vl-md-directive-close-label vl-md-directive-close-label--widget'
    label.textContent = this.label

    return label
  }
}

function buildCloseLabelDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const closeLabel of getDirectiveCloseLabels(view.state.doc.toString())) {
    if (closeLabel.kind === 'suffix') {
      builder.add(closeLabel.from, closeLabel.to, closeLabelMark)
      continue
    }

    builder.add(
      closeLabel.to,
      closeLabel.to,
      Decoration.widget({
        side: 1,
        widget: new CloseLabelWidget(closeLabel.label),
      }),
    )
  }

  return builder.finish()
}

/**
 * Close labels come from a full remark parse of the document (the renderer's
 * front end). Small documents are relabelled on every change; larger ones map
 * the existing labels through the edit and relabel once typing pauses.
 */
const SYNC_RELABEL_MAX_LENGTH = 4_000
const RELABEL_DELAY_MS = 120

const relabelEffect = StateEffect.define<null>()

const closeLabelPlugin = ViewPlugin.fromClass(
  class {
    private timer: ReturnType<typeof setTimeout> | undefined
    decorations: DecorationSet

    constructor(private readonly view: EditorView) {
      this.decorations = buildCloseLabelDecorations(view)
    }

    destroy(): void {
      if (this.timer !== undefined) clearTimeout(this.timer)
    }

    update(update: ViewUpdate): void {
      const relabel = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(relabelEffect)),
      )

      if (relabel || (update.docChanged && update.state.doc.length <= SYNC_RELABEL_MAX_LENGTH)) {
        if (this.timer !== undefined) clearTimeout(this.timer)
        this.timer = undefined
        this.decorations = buildCloseLabelDecorations(update.view)
        return
      }

      if (!update.docChanged) return

      this.decorations = this.decorations.map(update.changes)

      if (this.timer !== undefined) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.timer = undefined
        this.view.dispatch({ effects: relabelEffect.of(null) })
      }, RELABEL_DELAY_MS)
    }
  },
  {
    decorations: (plugin): DecorationSet => plugin.decorations,
  },
)

const closeLabelTheme = EditorView.baseTheme({
  '.vl-md-directive-close-label': {
    backgroundColor: 'rgba(125, 135, 153, 0.14)',
    border: '1px solid rgba(125, 135, 153, 0.35)',
    borderRadius: '3px',
    color: '#9aa4b5',
    display: 'inline-block',
    fontSize: '0.78em',
    lineHeight: '1.45',
    marginLeft: '0.35rem',
    padding: '0 0.35rem',
    verticalAlign: 'baseline',
  },

  '.vl-md-directive-close-label--widget': {
    pointerEvents: 'none',
    userSelect: 'none',
  },
})

export const directiveCloseLabels: Extension = [closeLabelPlugin, closeLabelTheme]
