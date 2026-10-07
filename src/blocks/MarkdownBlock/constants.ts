import { PAYLOAD_MARKDOWN_PACKAGE } from '../../package.js'

/**
 * `admin.custom` key on the `md-params.enable` field carrying the block's
 * effective defaults. Kept in its own module so the admin client component can
 * read it without importing the server-side resolver (and Shiki).
 */
export const MARKDOWN_BLOCK_DEFAULTS_ADMIN_CUSTOM_KEY = 'payloadMarkdownBlockDefaults'

/** Import-map specifier of the "Enable Blocks Params" checkbox component (under the installed package name). */
export const MARKDOWN_BLOCK_PARAMS_ENABLE_FIELD_COMPONENT = `${PAYLOAD_MARKDOWN_PACKAGE}/client#MarkdownBlockParamsEnableField`
