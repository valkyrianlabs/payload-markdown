/**
 * The `icon` attribute: one icon or a comma-separated list. Each entry is an
 * icon ref, optionally followed by space-separated `key=value` options that
 * belong to that icon alone:
 *
 *   icon="@fa-brands/debian palette=debian, @fa-brands/ubuntu palette=ubuntu"
 *
 * Options travel with their icon, so reordering the list never swaps colours,
 * and the same icon can appear twice with different palettes.
 */

export type IconEntry = {
  /** Palette name for this icon only. */
  palette?: string
  /** The `@pack/name` icon reference. */
  ref: string
}

export type ParsedIconEntries = {
  entries: IconEntry[]
  warnings: string[]
}

const ICON_ENTRY_OPTIONS = ['palette'] as const

export function parseIconEntries(value: string | undefined): ParsedIconEntries {
  const entries: IconEntry[] = []
  const warnings: string[] = []

  for (const raw of value?.split(',') ?? []) {
    const [ref, ...options] = raw.trim().split(/\s+/).filter(Boolean)
    if (!ref) continue

    const entry: IconEntry = { ref }

    for (const option of options) {
      const separator = option.indexOf('=')
      const key = separator > 0 ? option.slice(0, separator) : ''
      const optionValue = separator > 0 ? option.slice(separator + 1).replace(/^["']|["']$/g, '') : ''

      if (!(ICON_ENTRY_OPTIONS as readonly string[]).includes(key) || !optionValue) {
        warnings.push(
          `Unknown icon option "${option}" on "${ref}". Write options as key=value; supported: ${ICON_ENTRY_OPTIONS.join(', ')}.`,
        )
        continue
      }

      entry.palette = optionValue
    }

    entries.push(entry)
  }

  return { entries, warnings }
}

/** Directives that show a single icon: extra entries of an `icon` list are reported. */
const SINGLE_ICON_DIRECTIVES = new Set(['button', 'callout'])

export function getExtraIconWarnings(directive: string, entries: IconEntry[]): string[] {
  if (!SINGLE_ICON_DIRECTIVES.has(directive) || entries.length < 2) return []

  return [
    `"${directive}" shows one icon; ${entries
      .slice(1)
      .map((entry) => `"${entry.ref}"`)
      .join(', ')} ${entries.length > 2 ? 'are' : 'is'} ignored. Only cards show a list of icons.`,
  ]
}
