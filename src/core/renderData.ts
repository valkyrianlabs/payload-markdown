import type { HeadingAnchor } from '../directives/headingAnchors.js'

export type MarkdownLinkKind = 'definition' | 'directive' | 'image' | 'link'

/** An authored URL: a link, image, link definition, or a directive `href`/`src`. */
export type MarkdownLink = {
  kind: MarkdownLinkKind
  url: string
}

/** Structured data the pipeline stages record on the VFile. */
export type RenderData = {
  headings?: HeadingAnchor[]
  links?: MarkdownLink[]
  text?: string
}

const RENDER_DATA_KEY = 'payloadMarkdown'

type FileWithData = { data: Record<string, unknown> }

export function setRenderData(file: unknown, data: RenderData) {
  const target = (file as FileWithData).data
  target[RENDER_DATA_KEY] = { ...(target[RENDER_DATA_KEY] as RenderData | undefined), ...data }
}

export function getRenderData(file: unknown): RenderData {
  return ((file as FileWithData).data?.[RENDER_DATA_KEY] as RenderData | undefined) ?? {}
}
