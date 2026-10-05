import type { PayloadRequest } from 'payload'

/** `req.context` key where `withPayloadMarkdownMcp` stores the resolved MCP API key settings. */
export const MARKDOWN_AGENT_ACCESS_CONTEXT_KEY = 'payloadMarkdownMcpAccess'

/**
 * How the agent operations authorize a collection or global:
 *
 * - `user`: Payload access control for `req.user` only (the operations always
 *   run with `overrideAccess: false`).
 * - `mcpApiKey`: additionally require the MCP API key's per-collection/global
 *   `find` (read) or `update` (write, publish) checkbox, exactly like the
 *   built-in MCP tools. Fails closed when no key settings are on the request.
 */
export type MarkdownAgentAccessMode = 'mcpApiKey' | 'user'

export type MarkdownAgentErrorCode =
  | 'conflict'
  | 'forbidden'
  | 'invalid_edit'
  | 'locked'
  | 'no_drafts'
  | 'not_found'
  | 'validation_failed'

export class MarkdownAgentError extends Error {
  code: MarkdownAgentErrorCode
  details?: unknown

  constructor(code: MarkdownAgentErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'MarkdownAgentError'
    this.code = code
    this.details = details
  }
}

/** Same camel-casing @payloadcms/plugin-mcp uses for API key permission groups. */
export function toMcpPermissionKey(slug: string): string {
  return slug
    .replace(/[-_\s]+(.)?/g, (_, char?: string) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (_, char: string) => char.toLowerCase())
}

function readKeySettings(req: PayloadRequest): Record<string, unknown> | undefined {
  const value = req.context?.[MARKDOWN_AGENT_ACCESS_CONTEXT_KEY]

  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

/** Throws `forbidden` unless the request may run `operation` on `slug`. */
export function assertAgentAccess(
  req: PayloadRequest,
  slug: string,
  operation: 'find' | 'update',
  mode: MarkdownAgentAccessMode,
) {
  if (!req.user)
    throw new MarkdownAgentError('forbidden', 'Not authenticated. The request has no Payload user.')

  if (mode !== 'mcpApiKey') return

  const settings = readKeySettings(req)

  if (!settings)
    throw new MarkdownAgentError(
      'forbidden',
      'MCP API key permissions are not available on this request. Register the tools with withPayloadMarkdownMcp(), or pass access: "user".',
    )

  const permissions = settings[toMcpPermissionKey(slug)] as Record<string, unknown> | undefined

  if (permissions?.[operation] !== true)
    throw new MarkdownAgentError(
      'forbidden',
      `This MCP API key does not allow "${operation}" on "${slug}". Enable it on the key (Payload admin → MCP → API Keys) and expose "${slug}" in mcpPlugin({ collections | globals }).`,
    )
}

/** The slugs the request's MCP API key may `find`, or `undefined` when not in `mcpApiKey` mode. */
export function allowedAgentSlugs(
  req: PayloadRequest,
  slugs: string[],
  operation: 'find' | 'update',
  mode: MarkdownAgentAccessMode,
): string[] {
  if (mode !== 'mcpApiKey') return slugs

  const settings = readKeySettings(req)
  if (!settings) return []

  return slugs.filter(
    (slug) => (settings[toMcpPermissionKey(slug)] as Record<string, unknown> | undefined)?.[operation] === true,
  )
}
