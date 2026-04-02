'use client'

import { useEffect } from 'react'

type MarkdownRendererClientProps = {
  containerId: string
}

function extractCodeText(pre: HTMLElement): string {
  const code = pre.querySelector('code')
  if (!code) return ''

  const lines = Array.from(code.querySelectorAll<HTMLElement>('.line'))
  if (lines.length === 0) return code.textContent ?? ''

  return lines
  .map((line) => {
    const clone = line.cloneNode(true) as HTMLElement

    clone.querySelectorAll('.md-line-number').forEach((node) => node.remove())
    clone.querySelectorAll('.md-empty-line').forEach((node) => node.remove())

    return clone.textContent ?? ''
  })
   .join('\n')
}

export function MarkdownRendererClient({ containerId }: MarkdownRendererClientProps) {
  useEffect(() => {
    const root = document.getElementById(containerId)
    if (!root) return

    const timeoutIds = new Set<number>()

    const pres = root.querySelectorAll('pre')

    pres.forEach((pre) => {
      if (pre.querySelector('[data-md-copy-button]')) return

      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('data-md-copy-button', 'true')
      button.setAttribute('data-md-copy-label', 'Copy')
      button.setAttribute('aria-label', 'Copy code block')
      button.textContent = 'Copy'

      button.style.position = 'absolute'
      button.style.top = '0.75rem'
      button.style.right = '0.75rem'
      button.style.zIndex = '1'
      button.style.border = '1px solid rgba(255,255,255,0.12)'
      button.style.borderRadius = '0.5rem'
      button.style.background = 'rgba(24,24,27,0.9)'
      button.style.color = '#e5e7eb'
      button.style.fontSize = '0.75rem'
      button.style.fontWeight = '500'
      button.style.lineHeight = '1'
      button.style.padding = '0.45rem 0.65rem'
      button.style.cursor = 'pointer'
      button.style.userSelect = 'none'

      const preStyle = window.getComputedStyle(pre)
      if (preStyle.position === 'static') pre.style.position = 'relative'

      pre.appendChild(button)
    })

    const resetButtonLabel = (button: HTMLElement, originalLabel: string) => {
      const timeoutId = window.setTimeout(() => {
        button.textContent = originalLabel
        timeoutIds.delete(timeoutId)
      }, 2000)

      timeoutIds.add(timeoutId)
    }

    const handleClick = async (event: Event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('[data-md-copy-button]') as HTMLElement | null
      if (!button || !root.contains(button)) return

      const pre = button.closest('pre')
      if (!pre) return

      const text = extractCodeText(pre)
      if (!text) return

      const originalLabel =
        button.getAttribute('data-md-copy-label') || button.textContent || 'Copy'

      try {
        await navigator.clipboard.writeText(text)
        button.textContent = 'Copied'
        resetButtonLabel(button, originalLabel)
      } catch {
        button.textContent = 'Failed'
        resetButtonLabel(button, originalLabel)
      }
    }

    root.addEventListener('click', handleClick)

    return () => {
      root.removeEventListener('click', handleClick)

      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })

      timeoutIds.clear()
    }
  }, [containerId])

  return null
}
