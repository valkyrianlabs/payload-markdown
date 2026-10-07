import type { Config } from 'payload'

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as RuntimeModule from '../src/runtime/index'

import packageJson from '../package.json' with { type: 'json' }
import { MarkdownRenderer } from '../src/components/MarkdownRenderer/Component'
import { readEditorDirectiveConfig } from '../src/editor/directiveConfig'
import { payloadMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render/renderMarkdown'
import {
  clearPayloadMarkdownSettings,
  getPayloadMarkdownSettings,
  maybeGetPayloadMarkdownSettings,
  PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY,
  readPayloadMarkdownSettings,
} from '../src/runtime'
import { PAYLOAD_MARKDOWN_VERSION } from '../src/version'

type RegistryHost = Record<symbol, unknown>

function resetRegistry() {
  delete (globalThis as RegistryHost)[PAYLOAD_MARKDOWN_SETTINGS_REGISTRY_KEY]
}

function makeConfig(): Config {
  return {
    admin: {},
    collections: [{ slug: 'posts', fields: [{ name: 'title', type: 'text' }] }],
    custom: { other: 'kept' },
  } as unknown as Config
}

const brandThemes = {
  callout: [{ name: 'brand', classes: 'brand-callout' }],
}

const BRAND_CALLOUT = ':::callout{theme="brand"}\nHello\n:::'

function isDeepFrozen(value: unknown): boolean {
  if (!value || typeof value !== 'object') return true
  if (!Object.isFrozen(value)) return false

  return Object.values(value).every(isDeepFrozen)
}

function rendererHtml(element: unknown): string {
  const match = JSON.stringify(element).match(/"__html":("(?:[^"\\]|\\.)*")/)

  return match ? (JSON.parse(match[1]) as string) : ''
}

beforeEach(() => {
  clearPayloadMarkdownSettings()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('../src/version')
})

describe('settings ownership (CORE-18a, X-3)', () => {
  it('keeps src/version.ts in sync with package.json (run `pnpm sync:version`)', () => {
    expect(PAYLOAD_MARKDOWN_VERSION).toBe(packageJson.version)
  })

  it('stores a frozen, serialisable render-settings snapshot on config.custom', async () => {
    const themes = { callout: [{ name: 'brand', classes: 'brand-callout' }] }
    const result = await payloadMarkdown({
      collections: {
        posts: { config: { className: 'posts' }, field: { label: 'Body' }, fieldName: 'body' },
      },
      themes,
    })(makeConfig())

    const settings = readPayloadMarkdownSettings(result)

    expect(result.custom?.other).toBe('kept')
    expect(settings).toBe(result.custom?.payloadMarkdown)
    expect(settings).toBe(maybeGetPayloadMarkdownSettings())
    expect(isDeepFrozen(settings)).toBe(true)
    expect(Object.isFrozen(themes)).toBe(false)
    expect(Object.isFrozen(themes.callout[0])).toBe(false)
    expect(JSON.parse(JSON.stringify(settings))).toEqual(settings)
    expect(settings).toEqual({
      collections: { posts: { config: { className: 'posts' } } },
      enabled: true,
      themes,
      version: PAYLOAD_MARKDOWN_VERSION,
    })
    // Payload instances expose the sanitized config as `payload.config`.
    expect(readPayloadMarkdownSettings({ config: result as { custom?: Record<string, unknown> } })).toBe(
      settings,
    )
  })

  it('shares one registry between module instances of the package', async () => {
    vi.resetModules()
    const first = await import('../src/runtime/index')
    vi.resetModules()
    const second = await import('../src/runtime/index')

    expect(first).not.toBe(second)

    const settings = first.setPayloadMarkdownSettings({ config: { className: 'shared' } })

    expect(second.getPayloadMarkdownSettings()).toBe(settings)

    second.clearPayloadMarkdownSettings()

    expect(first.maybeGetPayloadMarkdownSettings()).toBeNull()
  })

  const distRuntime = path.resolve('dist/runtime/index.js')

  it.skipIf(!fs.existsSync(distRuntime))('shares settings between the built and the source copy', async () => {
    const dist = (await import(pathToFileURL(distRuntime).href)) as typeof RuntimeModule
    const settings = dist.setPayloadMarkdownSettings({ themes: brandThemes })

    expect(getPayloadMarkdownSettings()).toBe(settings)

    const result = await renderMarkdown(BRAND_CALLOUT)

    expect(result.warnings).toEqual([])
    expect(result.html).toContain('brand-callout')
  })

  it('warns once when different package versions use the registry', async () => {
    resetRegistry()

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    vi.resetModules()
    const current = await import('../src/runtime/index')
    current.setPayloadMarkdownSettings({})

    vi.resetModules()
    vi.doMock('../src/version', () => ({ PAYLOAD_MARKDOWN_VERSION: '0.0.0-other' }))
    const other = await import('../src/runtime/index')

    expect(warn).not.toHaveBeenCalled()

    other.maybeGetPayloadMarkdownSettings()
    other.setPayloadMarkdownSettings({})
    current.maybeGetPayloadMarkdownSettings()

    vi.resetModules()
    vi.doMock('../src/version', () => ({ PAYLOAD_MARKDOWN_VERSION: '0.0.0-third' }))
    const third = await import('../src/runtime/index')
    third.maybeGetPayloadMarkdownSettings()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('Duplicate copies of payload-markdown')
    expect(String(warn.mock.calls[0][0])).toContain(`versions ${PAYLOAD_MARKDOWN_VERSION}, 0.0.0-other`)
    expect(String(warn.mock.calls[0][0])).toContain(`registered by ${PAYLOAD_MARKDOWN_VERSION}`)

    resetRegistry()
  })

  it('lets an explicit settings source win over the registry', async () => {
    const tenantA = await payloadMarkdown({ config: { className: 'tenant-a' }, themes: brandThemes })(
      makeConfig(),
    )
    const tenantB = await payloadMarkdown({ config: { className: 'tenant-b' } })(makeConfig())

    // Last built config wins the process registry.
    expect(maybeGetPayloadMarkdownSettings()?.config).toEqual({ className: 'tenant-b' })
    // Every config keeps its own settings.
    expect(readPayloadMarkdownSettings(tenantA)?.config).toEqual({ className: 'tenant-a' })
    expect(readPayloadMarkdownSettings(tenantB)?.config).toEqual({ className: 'tenant-b' })

    const fromRegistry = await renderMarkdown(BRAND_CALLOUT)
    const fromConfig = await renderMarkdown(BRAND_CALLOUT, { settings: tenantA })
    const fromPayload = await renderMarkdown(BRAND_CALLOUT, {
      settings: { config: tenantA as { custom?: Record<string, unknown> } },
    })
    const withoutSettings = await renderMarkdown(BRAND_CALLOUT, { settings: false })

    expect(fromRegistry.warnings).toEqual(['Unknown theme "brand" on "callout". Falling back to "soft".'])
    expect(fromConfig.warnings).toEqual([])
    expect(fromConfig.html).toContain('brand-callout')
    expect(fromPayload.html).toBe(fromConfig.html)
    expect(withoutSettings.warnings).toEqual(fromRegistry.warnings)

    const element = await MarkdownRenderer({ markdown: BRAND_CALLOUT, settings: tenantA })
    const serialized = JSON.stringify(element)

    expect(serialized).toContain('tenant-a')
    expect(serialized).not.toContain('tenant-b')
    expect(rendererHtml(element)).toBe(fromConfig.html)
    expect(JSON.stringify(await MarkdownRenderer({ markdown: BRAND_CALLOUT }))).toContain('tenant-b')
  })

  it('computes the editor config from the settings each config owns', async () => {
    const tenantA = await payloadMarkdown({ collections: { posts: true }, themes: brandThemes })(
      makeConfig(),
    )
    await payloadMarkdown({ collections: { posts: true } })(makeConfig())

    const posts = tenantA.collections?.find((collection) => collection.slug === 'posts')
    const field = posts?.fields.find((entry) => 'name' in entry && entry.name === 'content') as
      | { admin?: { custom?: unknown } }
      | undefined
    const block = tenantA.blocks?.find((entry) => entry.slug === 'vlMdBlock')
    const blockField = block?.fields.find((entry) => 'name' in entry && entry.name === 'content') as
      | { admin?: { custom?: unknown } }
      | undefined

    const brandOnly = { extendDefaults: true, items: [{ name: 'brand', classes: '' }] }

    expect(readEditorDirectiveConfig(field?.admin?.custom)?.themes?.callout).toEqual(brandOnly)
    expect(readEditorDirectiveConfig(blockField?.admin?.custom)?.themes?.callout).toEqual(brandOnly)
  })

  it('survives Payload config sanitization', async () => {
    const { buildConfig } = await import('payload')
    const { postgresAdapter } = await import('@payloadcms/db-postgres')
    const sanitized = await buildConfig({
      collections: [{ slug: 'posts', fields: [{ name: 'title', type: 'text' }] }],
      db: postgresAdapter({ pool: { connectionString: 'postgres://unused@127.0.0.1:1/none' } }),
      plugins: [payloadMarkdown({ collections: { posts: true }, themes: brandThemes })],
      secret: 'test',
    })
    const settings = readPayloadMarkdownSettings(sanitized)

    expect(settings?.themes).toEqual(brandThemes)
    expect(settings).toBe(maybeGetPayloadMarkdownSettings())
    expect((await renderMarkdown(BRAND_CALLOUT, { settings: sanitized })).warnings).toEqual([])
  })

  it('clears the registry but leaves other configs untouched when disabled', async () => {
    const enabled = await payloadMarkdown({ config: { className: 'on' } })(makeConfig())
    const disabled = await payloadMarkdown({ enabled: false })(makeConfig())

    expect(maybeGetPayloadMarkdownSettings()).toBeNull()
    expect(disabled.custom?.payloadMarkdown).toBeUndefined()
    expect(readPayloadMarkdownSettings(enabled)?.config).toEqual({ className: 'on' })
  })
})
