'use client'

/** Floating light/dark switch for checking directive defaults in both themes. */
export function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains('dark')

    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('pmd-dev-theme', dark ? 'dark' : 'light')
    } catch {
      // Storage can be unavailable (private mode); the class still switches.
    }
  }

  return (
    <button
      className="fixed right-4 bottom-4 z-50 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-200"
      data-testid="theme-toggle"
      onClick={toggle}
      type="button"
    >
      Toggle theme
    </button>
  )
}
