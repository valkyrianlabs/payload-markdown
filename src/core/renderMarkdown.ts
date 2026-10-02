import type { Element, Parent, Root, RootContent } from 'hast'
import type { Schema } from 'hast-util-sanitize'

import { fromHtml } from 'hast-util-from-html'
import { toString } from 'hast-util-to-string'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import type { HeadingAnchor } from '../directives/headingAnchors.js'
import type { MarkdownRenderConfig, RenderMarkdownOptions, RenderMarkdownResult } from '../types/core.js'
import type { DiagnosticFile, DiagnosticPlace, RenderDiagnostic } from './diagnostics.js'
import type { MarkdownLink } from './renderData.js'

import { resolveRenderMarkdownOptions } from './codeConfig.js'
import { highlightCode } from './codeToHtml.js'
import { reportDiagnostic, toRenderDiagnostic } from './diagnostics.js'
import { rehypeApplyLayoutClasses } from './plugins/rehypeApplyLayoutClasses.js'
import { rehypeResolveIcons } from './plugins/rehypeResolveIcons.js'
import { rehypeStripAuthoredInlineStyles } from './plugins/rehypeStripAuthoredInlineStyles.js'
import {
  createPipelineNonce,
  rehypeMarkPipelineElements,
  rehypeTrustBoundary,
} from './plugins/rehypeTrustBoundary.js'
import { remarkCollectRenderData } from './plugins/remarkCollectRenderData.js'
import { remarkCompileLayouts } from './plugins/remarkCompileLayouts.js'
import { remarkDirectiveLines } from './plugins/remarkDirectiveLines.js'
import { remarkHeadingAnchorsAndToc } from './plugins/remarkHeadingAnchorsAndToc.js'
import { remarkLayoutDirectives } from './plugins/remarkLayoutDirectives.js'
import { remarkValidateDirectiveThemes } from './plugins/remarkValidateDirectiveThemes.js'
import { getRenderData } from './renderData.js'

function extractCodeLanguage(
  className?: Array<number | string> | boolean | null | number | string  ,
): string | undefined {
  const classes =
    typeof className === 'string'
      ? className.split(/\s+/)
      : Array.isArray(className)
        ? className
        : []

  return classes
    .find((c): c is string => typeof c === 'string' && c.startsWith('language-'))
    ?.slice(9)
}

function isElement(node: RootContent): node is Element {
  return node.type === 'element'
}

function isPreElement(node: RootContent): node is Element {
  return isElement(node) && node.tagName === 'pre'
}

function hasChildren(node: unknown): node is Parent {
  return Boolean(node && typeof node === 'object' && 'children' in node)
}

function findCodeChild(node: Element): Element | undefined {
  return node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code',
  )
}

function parseHtmlFragment(html: string): RootContent[] {
  const fragment = fromHtml(html, { fragment: true })
  return fragment.children
}

type CodeDiagnostic = {
  place?: DiagnosticPlace
  reason: string
  severity: 'info' | 'warning'
}

function rehypeShikiCodeBlocks(options: RenderMarkdownOptions = {}) {
  return async function transformer(tree: Root, file: DiagnosticFile): Promise<void> {
    const work: Array<Promise<CodeDiagnostic[]>> = []

    visit(tree, 'element', (node, index, parent) => {
      if (typeof index !== 'number' || !hasChildren(parent) || !isPreElement(node)) return

      const codeNode = findCodeChild(node)
      if (!codeNode) return

      const code = toString(codeNode)
      const lang = extractCodeLanguage(codeNode.properties?.className)
      const start = node.position?.start
      const place = start ? { column: start.column, line: start.line } : undefined

      work.push(
        (async () => {
          const highlighted = await highlightCode(code, {
            ...options,
            lang
          })

          const replacementNodes = parseHtmlFragment(highlighted.html)
          parent.children.splice(index, 1, ...replacementNodes)

          const info = new Set(highlighted.info ?? [])

          return highlighted.warnings.map((reason) => ({
            place,
            reason,
            severity: info.has(reason) ? ('info' as const) : ('warning' as const),
          }))
        })(),
      )
    })

    // Report each distinct diagnostic once per render, in document order (the
    // first occurrence's position is kept).
    const seen = new Set<string>()

    for (const diagnostic of (await Promise.all(work)).flat()) {
      if (seen.has(diagnostic.reason)) continue
      seen.add(diagnostic.reason)

      reportDiagnostic(file, diagnostic.reason, {
        place: diagnostic.place,
        severity: diagnostic.severity,
        source: 'code',
      })
    }
  }
}

type SanitizeAttributeValue = boolean | null | number | RegExp | string | undefined
type SanitizeAttributeDefinition = [string, ...SanitizeAttributeValue[]] | string

function getAttributeDefinitions(
  value: Schema['attributes'] extends infer A
    ? A extends Record<string, infer V>
      ? V
      : never
    : never,
): SanitizeAttributeDefinition[] {
  return (value as SanitizeAttributeDefinition[] | undefined) ?? []
}

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    a: [
      ...getAttributeDefinitions(defaultSchema.attributes?.a ?? []),
      'ariaLabel',
      'className',
      'dataButton',
      'dataDirective',
      'dataDirectiveLink',
      'dataIconPosition',
      'dataSize',
      'dataVariant',
      'dataVlLayout',
      'href',
      'target',
      'rel',
      'title',
    ],
    article: [
      ...getAttributeDefinitions(defaultSchema.attributes?.article ?? []),
      'className',
      'dataDirective',
      'dataEyebrow',
      'dataHref',
      'dataIcon',
      'dataLinkScope',
      'dataNewTab',
      'dataStepCard',
      'dataTabPanel',
      'dataTabValue',
      'dataTheme',
      'dataTitle',
      'dataVlLayout',
      'hidden',
      'id',
      'role',
      'tabIndex',
    ],
    button: [
      ...getAttributeDefinitions(defaultSchema.attributes?.button ?? []),
      'ariaControls',
      'ariaSelected',
      'className',
      'dataTabTrigger',
      'dataTabValue',
      'disabled',
      'id',
      'role',
      'tabIndex',
      'type',
    ],
    code: [...getAttributeDefinitions(defaultSchema.attributes?.code ?? []), 'className'],
    details: [
      ...getAttributeDefinitions(defaultSchema.attributes?.details ?? []),
      'dataDirective',
      'dataTheme',
      'dataTitle',
      'dataVlLayout',
      'open',
    ],
    div: [
      ...getAttributeDefinitions(defaultSchema.attributes?.div ?? []),
      'dataAlign',
      'dataDirective',
      'dataDirectiveBody',
      'dataDirectiveTitle',
      'dataEyebrow',
      'dataHref',
      'dataGap',
      'dataCellTheme',
      'dataIcon',
      'dataTabsList',
      'dataTabPanel',
      'dataTabTrigger',
      'dataTabValue',
      'dataTheme',
      'dataTitle',
      'dataStack',
      'dataVariant',
      'dataVlLayout',
      'dataWrap',
      'dataVlCellHeadingDepth',
      'hidden',
      'id',
      'role',
      'tabIndex',
    ],
    h1: [
      ...getAttributeDefinitions(defaultSchema.attributes?.h1 ?? []),
      'dataDirectiveTitle',
      'dataHeadingAnchor',
      'id',
    ],
    h2: [
      ...getAttributeDefinitions(defaultSchema.attributes?.h2 ?? []),
      'dataDirectiveTitle',
      'dataHeadingAnchor',
      'id',
    ],
    h3: [
      ...getAttributeDefinitions(defaultSchema.attributes?.h3 ?? []),
      'dataDirectiveTitle',
      'dataHeadingAnchor',
      'id',
    ],
    h4: [...getAttributeDefinitions(defaultSchema.attributes?.h4 ?? []), 'dataHeadingAnchor', 'id'],
    h5: [...getAttributeDefinitions(defaultSchema.attributes?.h5 ?? []), 'dataHeadingAnchor', 'id'],
    h6: [...getAttributeDefinitions(defaultSchema.attributes?.h6 ?? []), 'dataHeadingAnchor', 'id'],
    img: [
      ...getAttributeDefinitions(defaultSchema.attributes?.img ?? []),
      'alt',
      'className',
      'dataDirective',
      'src',
      'title',
      'width',
      'height',
    ],
    li: [...getAttributeDefinitions(defaultSchema.attributes?.li ?? []), 'dataStep'],
    nav: [
      ...getAttributeDefinitions(defaultSchema.attributes?.nav ?? []),
      'ariaLabel',
      'dataDirective',
      'dataTheme',
      'dataTitle',
      'dataVlLayout',
    ],
    p: [
      ...getAttributeDefinitions(defaultSchema.attributes?.p ?? []),
      'className',
      'dataDirectiveEyebrow',
    ],
    pre: [
      ...getAttributeDefinitions(defaultSchema.attributes?.pre ?? []),
      'className',
      'tabindex',
    ],
    section: [
      ...getAttributeDefinitions(defaultSchema.attributes?.section ?? []),
      'dataColumns',
      'dataCardTheme',
      'dataCellTheme',
      'dataDefault',
      'dataDisabled',
      'dataDirective',
      'dataHref',
      'dataLabel',
      'dataLinkScope',
      'dataLayout',
      'dataNewTab',
      'dataStack',
      'dataNumbered',
      'dataStepTheme',
      'dataTabTheme',
      'dataTabValue',
      'dataTheme',
      'dataVariant',
      'dataValue',
      'dataVlLayout',
      'dataVlCellHeadingDepth',
      'role',
    ],
    span: [
      ...getAttributeDefinitions(defaultSchema.attributes?.span ?? []),
      'className',
      'dataPmdIcon',
      'dataPmdIconRef',
      'dataStepNumber',
      'focusable',
      'style',
    ],
    summary: [...getAttributeDefinitions(defaultSchema.attributes?.summary ?? []), 'className'],
  },
  // Clobber protection for author raw HTML is applied by rehypeTrustBoundary
  // (raw-HTML ids/names get the default `user-content-` prefix there), so the
  // pipeline's own heading, footnote and tab ids stay unprefixed.
  clobberPrefix: '',
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'a',
    'article',
    'br',
    'button',
    'details',
    'img',
    'nav',
    'section',
    'span',
    'summary',
  ],
}

const FAILED_RENDER_HTML = '<p>Failed to render markdown.</p>'

/**
 * Structured result of `renderMarkdown`.
 */
export type RenderedMarkdown = {
  /** Every diagnostic, in report order, with a source and (when known) a position. */
  diagnostics: RenderDiagnostic[]
  /** Fatal compilation errors; when non-empty, `html` is the failure placeholder. */
  errors: string[]
  /** Heading anchors in document order; `id` is the exact id emitted in `html`. */
  headings: HeadingAnchor[]
  html: string
  /** Authored URLs in document order. */
  links: MarkdownLink[]
  /** Plain text of the document without directive markup or raw HTML. */
  text: string
  /** `diagnostics` messages (kept for compatibility; includes errors). */
  warnings: string[]
}

/**
 * Headless renderer: compiles markdown to sanitized HTML and returns the
 * structured data the pipeline collects. Pure server code (no CSS, no React);
 * `MarkdownRenderer` is a thin wrapper around it.
 */
export async function renderMarkdownDocument(
  markdown: string,
  config: MarkdownRenderConfig = {},
): Promise<RenderedMarkdown> {
  const pipelineNonce = createPipelineNonce()

  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirectiveLines, config)
      .use(remarkCompileLayouts)
      .use(remarkLayoutDirectives)
      .use(remarkValidateDirectiveThemes, config)
      .use(remarkCollectRenderData)
      .use(remarkHeadingAnchorsAndToc)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeMarkPipelineElements, pipelineNonce)
      .use(rehypeRaw)
      .use(rehypeTrustBoundary, pipelineNonce)
      .use(rehypeStripAuthoredInlineStyles)
      .use(rehypeShikiCodeBlocks, resolveRenderMarkdownOptions(config))
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeApplyLayoutClasses, config)
      .use(rehypeResolveIcons, config)
      .use(rehypeStringify)
      .process(markdown)

    const data = getRenderData(file)
    const diagnostics = file.messages.map(toRenderDiagnostic)

    return {
      diagnostics,
      errors: [],
      headings: data.headings ?? [],
      html: String(file),
      links: data.links ?? [],
      text: data.text ?? '',
      warnings: diagnostics.map((diagnostic) => diagnostic.message),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to render markdown.'

    // Real compile failures were previously swallowed; log them server-side.
    // eslint-disable-next-line no-console
    console.error('[payload-markdown] Failed to render markdown:', error)

    return {
      diagnostics: [{ code: 'render-failed', message, severity: 'error', source: 'render' }],
      errors: [message],
      headings: [],
      html: FAILED_RENDER_HTML,
      links: [],
      text: '',
      warnings: [message],
    }
  }
}

/**
 * Compiles markdown to sanitized HTML. Same pipeline as `renderMarkdownDocument`,
 * returning only `{ html, warnings, errors }`.
 */
export async function compileMarkdown(
  markdown: string,
  config: MarkdownRenderConfig = {},
): Promise<RenderMarkdownResult> {
  const { errors, html, warnings } = await renderMarkdownDocument(markdown, config)

  return { errors, html, warnings }
}
