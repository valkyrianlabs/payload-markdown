import type { Extension } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'

import { RangeSetBuilder } from '@codemirror/state'
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

const closeLabelPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildCloseLabelDecorations(view)
    }

    update(update: ViewUpdate): void {
      if (!update.docChanged) return

      this.decorations = buildCloseLabelDecorations(update.view)
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
