/**
 * Sets the dev app theme before first paint: `?theme=light|dark` wins, then the
 * stored choice, then dark (the dev app's historical look).
 */
const THEME_SCRIPT = `(() => {
  try {
    const param = new URLSearchParams(location.search).get('theme')
    const stored = localStorage.getItem('pmd-dev-theme')
    const theme = param === 'light' || param === 'dark' ? param : stored === 'light' ? 'light' : 'dark'
    if (param) localStorage.setItem('pmd-dev-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  } catch {
    document.documentElement.classList.add('dark')
  }
})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
}
