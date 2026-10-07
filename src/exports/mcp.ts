/**
 * `payload-markdown/mcp`: tools that let AI agents read,
 * validate, edit and publish payload-markdown content through
 * `@payloadcms/plugin-mcp`, plus the same operations as plain functions for
 * custom agents. Server-only.
 */
export {
  MARKDOWN_AGENT_ACCESS_CONTEXT_KEY,
  type MarkdownAgentAccessMode,
  MarkdownAgentError,
  type MarkdownAgentErrorCode,
} from '../agent/access.js'
export {
  type MarkdownDocument,
  type MarkdownEdit,
  type MarkdownEditResult,
  type MarkdownEntityRef,
  publishMarkdown,
  type PublishMarkdownOptions,
  readMarkdownDocuments,
  type ReadMarkdownOptions,
  writeMarkdown,
  type WriteMarkdownOptions,
  type WriteMarkdownResult,
} from '../agent/documents.js'
export { getMarkdownGuide, MARKDOWN_GUIDE_EXAMPLES, type MarkdownGuideOptions } from '../agent/guide.js'
export {
  collectMarkdownTargets,
  describeMarkdownLocations,
  isMarkdownField,
  MARKDOWN_BLOCK_SLUG,
  type MarkdownBlocksOutline,
  type MarkdownSchemaLocation,
  type MarkdownTarget,
} from '../agent/targets.js'
export {
  type MarkdownValidationOptions,
  type MarkdownValidationResult,
  validateMarkdown,
} from '../agent/validate.js'
export {
  type PayloadMarkdownMcpOptions,
  type PayloadMarkdownMcpPrompt,
  payloadMarkdownMcpPrompts,
  type PayloadMarkdownMcpTool,
  type PayloadMarkdownMcpToolName,
  payloadMarkdownMcpTools,
  withPayloadMarkdownMcp,
} from '../mcp/index.js'
