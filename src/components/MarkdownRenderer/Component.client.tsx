'use client'

import { useEffect } from 'react'

export type MarkdownRendererClientProps = {
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

function getTabsContainer(element: HTMLElement | null): HTMLElement | null {
  return element?.closest('[data-directive="tabs"]') as HTMLElement | null
}

/** Elements of this tabs block only, not of tabs nested in its panels. */
function getOwnTabElements(tabs: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(tabs.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => getTabsContainer(element) === tabs,
  )
}

function setActiveTab(tabs: HTMLElement, value: string) {
  const triggers = getOwnTabElements(tabs, '[data-tab-trigger]')
  const panels = getOwnTabElements(tabs, '[data-tab-panel]')

  for (const trigger of triggers) {
    const active = trigger.getAttribute('data-tab-value') === value

    trigger.setAttribute('aria-selected', active ? 'true' : 'false')
    trigger.setAttribute('tabindex', active ? '0' : '-1')
    trigger.classList.toggle('vl-md-tabs-trigger--active', active)
  }

  for (const panel of panels) {
    const active = panel.getAttribute('data-tab-value') === value

    panel.toggleAttribute('hidden', !active)
  }
}

function getEnabledTabTriggers(tabs: HTMLElement): HTMLElement[] {
  return getOwnTabElements(tabs, '[data-tab-trigger]').filter(
    (trigger) => !trigger.hasAttribute('disabled'),
  )
}

function focusTabTrigger(triggers: HTMLElement[], index: number) {
  const trigger = triggers[index]
  if (!trigger) return

  trigger.focus()
}

function getNextTabIndex(currentIndex: number, total: number, direction: -1 | 1): number {
  return (currentIndex + direction + total) % total
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

      // Styled by `[data-md-copy-button]` in the renderer stylesheet, which
      // positions it against the pre.
      if (window.getComputedStyle(pre).position === 'static') pre.style.position = 'relative'

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

    const handleTabsClick = (event: Event) => {
      const target = event.target as HTMLElement | null
      const trigger = target?.closest('[data-tab-trigger]') as HTMLElement | null
      if (!trigger || !root.contains(trigger) || trigger.hasAttribute('disabled')) return

      const tabs = getTabsContainer(trigger)
      const value = trigger.getAttribute('data-tab-value')
      if (!tabs || !value) return

      setActiveTab(tabs, value)
      trigger.focus()
    }

    const handleTabsKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const trigger = target?.closest('[data-tab-trigger]') as HTMLElement | null
      if (!trigger || !root.contains(trigger) || trigger.hasAttribute('disabled')) return

      const tabs = getTabsContainer(trigger)
      if (!tabs) return

      const triggers = getEnabledTabTriggers(tabs)
      const currentIndex = triggers.indexOf(trigger)
      if (currentIndex < 0) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        focusTabTrigger(triggers, getNextTabIndex(currentIndex, triggers.length, 1))
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        focusTabTrigger(triggers, getNextTabIndex(currentIndex, triggers.length, -1))
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusTabTrigger(triggers, 0)
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusTabTrigger(triggers, triggers.length - 1)
        return
      }

      if (event.key !== 'Enter' && event.key !== ' ') return

      const value = trigger.getAttribute('data-tab-value')
      if (!value) return

      event.preventDefault()
      setActiveTab(tabs, value)
    }

    root.addEventListener('click', handleClick)
    root.addEventListener('click', handleTabsClick)
    root.addEventListener('keydown', handleTabsKeydown)

    return () => {
      root.removeEventListener('click', handleClick)
      root.removeEventListener('click', handleTabsClick)
      root.removeEventListener('keydown', handleTabsKeydown)

      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })

      timeoutIds.clear()
    }
  }, [containerId])

  return null
}
