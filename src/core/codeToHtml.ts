import { codeToHtml as shikiCodeToHtml } from 'shiki'

export type CodeBlockOptions = {
  lang?: string
  theme?: string
}

export const DEFAULT_CODE_LANG = 'text'
export const DEFAULT_CODE_THEME = 'github-dark'

export function codeToHtml(code: string, options: CodeBlockOptions = {}): Promise<string> {
  const lang = options.lang?.trim() || DEFAULT_CODE_LANG
  const theme = options.theme?.trim() || DEFAULT_CODE_THEME

  try {
    return shikiCodeToHtml(code, {
      lang,
      theme,
    })
  } catch {
    return shikiCodeToHtml(code, {
      lang: DEFAULT_CODE_LANG,
      theme,
    })
  }
}
