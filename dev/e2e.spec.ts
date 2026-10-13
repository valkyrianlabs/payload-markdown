import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { expect, test } from '@playwright/test'

import { devUser } from './helpers/credentials'
import { gridColumnCount, measureColors } from './helpers/visual'

// The tests share one dev user and a cold Turbopack dev server; running them in
// parallel made logins and first compiles race each other.
test.describe.configure({ mode: 'serial' })

test('admin shell still loads the markdown-enabled dev app', async ({ page }) => {
  await page.goto('/admin')

  await page.fill('#field-email', devUser.email)
  await page.fill('#field-password', devUser.password)
  await page.click('.form-submit button')

  await expect(page).toHaveTitle(/Dashboard/)
  await expect(page.locator('.graphic-icon')).toBeVisible()
})

test('frontend renderer handles layout directives, code fences, and edge cases', async ({ page }) => {
  await page.goto('/directive-regression')

  const fixture = page.getByTestId('directive-fixture')

  await expect(fixture.getByRole('heading', { name: 'Directive Regression' })).toBeVisible()
  await expect(fixture.locator('#install')).toHaveCount(1)
  await expect(fixture.locator('#install-1')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="toc"]')).toHaveCount(2)
  await expect(fixture.locator('[data-directive="toc"]').first()).toContainText('On this page')
  await expect(fixture.locator('[data-directive="toc"][data-theme="compact"]')).toHaveCount(1)
  await expect(fixture.locator('.vl-md-toc--theme-compact')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="toc"] a[href="#install"]')).toHaveCount(2)
  await expect(fixture.locator('[data-directive="cards"]')).toHaveCount(2)
  const spaciousCards = fixture.locator('[data-directive="cards"][data-theme="spacious"]')

  await expect(fixture.locator('[data-directive="cards"][data-columns="3"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="cards"][data-columns="2"]')).toHaveCount(1)
  await expect(spaciousCards).toHaveCount(1)
  await expect(fixture.locator('[data-directive="cards"][data-theme="compact"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"]')).toHaveCount(7)
  await expect(fixture.locator('[data-directive="card"][data-theme="glass"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-theme="muted"]')).toHaveCount(2)
  await expect(fixture.locator('[data-directive="card"][data-theme="cyan"]')).toHaveCount(2)
  await expect(fixture.locator('[data-directive="card"][data-theme="violet"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-theme="emerald"]')).toHaveCount(1)
  await expect(spaciousCards.locator('.vl-md-card--theme-cyan')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"] a[href="/docs/markdown-field"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-href="/docs/markdown-field"]')).toContainText(
    'Portable Markdown content',
  )
  const tabs = fixture.locator('[data-directive="tabs"]').filter({ hasText: 'pnpm' })

  await expect(tabs).toHaveCount(1)
  await expect(tabs).toHaveAttribute('data-theme', 'glass')
  await expect(tabs.locator('[role="tab"]')).toHaveCount(3)
  await expect(tabs.locator('[role="tabpanel"]')).toHaveCount(3)
  await expect(tabs.locator('[data-tab-trigger][data-tab-value="npm"]')).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(tabs.locator('[data-tab-panel][data-tab-value="npm"]')).toBeVisible()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="pnpm"]')).toBeHidden()
  await tabs.locator('[data-tab-trigger][data-tab-value="pnpm"]').click()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="pnpm"]')).toBeVisible()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="npm"]')).toBeHidden()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="pnpm"] pre code')).toContainText(
    'pnpm add @valkyrianlabs/payload-markdown',
  )
  await tabs.locator('[data-tab-trigger][data-tab-value="nested"]').click()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="nested"]')).toBeVisible()
  await expect(tabs.locator('[data-tab-panel][data-tab-value="nested"] [data-directive="callout"]')).toContainText(
    'Inside tabs',
  )
  await expect(tabs.locator('[data-tab-panel][data-tab-value="nested"] [data-directive="details"]')).toContainText(
    'Tab details',
  )
  await expect(tabs.locator('[data-tab-panel][data-tab-value="nested"] [data-directive="card"]')).toContainText(
    'Tab card',
  )
  await expect(fixture.locator('[data-directive="steps"]')).toHaveCount(6)
  await expect(fixture.locator('[data-directive="steps"][data-variant="cards"]')).toHaveCount(4)
  const defaultCardSteps = fixture
    .locator('[data-directive="steps"][data-variant="cards"][data-layout="stack"][data-numbered="true"]')
    .filter({ hasText: 'Create content' })
  const themedStackSteps = fixture
    .locator('[data-directive="steps"][data-variant="cards"][data-layout="stack"][data-numbered="true"]')
    .filter({ hasText: 'Plan the content' })
  const gridSteps = fixture
    .locator('[data-directive="steps"][data-variant="cards"][data-layout="grid"][data-columns="2"][data-numbered="true"]')
    .filter({ hasText: 'Add nested callout' })
  const unnumberedGridSteps = fixture
    .locator('[data-directive="steps"][data-variant="cards"][data-layout="grid"][data-columns="2"][data-numbered="false"]')
    .filter({ hasText: 'Optional first step' })

  await expect(fixture.locator('[data-step]')).toHaveCount(12)
  await expect(fixture.locator('[data-step-card]')).toHaveCount(8)
  await expect(defaultCardSteps).toHaveCount(1)
  await expect(defaultCardSteps.locator('[data-step-number]')).toHaveCount(3)
  await expect(themedStackSteps.locator('[data-step-card][data-theme="cyan"]')).toHaveCount(1)
  await expect(gridSteps).toHaveCount(1)
  await expect(gridSteps.locator('[data-step-number]')).toHaveCount(2)
  await expect(gridSteps.locator('[data-directive="callout"]')).toContainText('Nested step callout')
  await expect(gridSteps.locator('pre code')).toContainText('pnpm build')
  await expect(unnumberedGridSteps).toHaveCount(1)
  await expect(unnumberedGridSteps.locator('[data-step-card]')).toHaveCount(2)
  await expect(unnumberedGridSteps.locator('[data-step-number]')).toHaveCount(0)
  await expect(
    fixture
      .locator('[data-directive="steps"]:not([data-variant])')
      .filter({ hasText: 'Install the package' }),
  ).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"]')).toHaveCount(9)
  await expect(
    fixture
      .locator('[data-directive="callout"][data-theme="soft"]')
      .filter({ hasText: 'Default note callout with' }),
  ).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"][data-variant="warning"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"][data-variant="danger"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"][data-variant="success"]')).toHaveCount(1)
  await expect(fixture.getByText('Default note callout with')).toBeVisible()

  const details = fixture.locator('[data-directive="details"]')

  await expect(details).toHaveCount(3)
  await expect(details.first()).toHaveAttribute('data-theme', 'glass')
  await expect(details.first().locator('summary')).toContainText('Advanced install notes')
  await details.first().locator('summary').click()
  await expect(details.first()).toHaveAttribute('open', '')
  await expect(details.first().getByText('These steps are only needed when running from source.')).toBeVisible()

  await expect(fixture.locator('[data-vl-layout="section"]')).toHaveCount(1)
  await expect(fixture.locator('[data-vl-layout="section"][data-theme="panel"]')).toHaveCount(1)
  await expect(fixture.locator('[data-vl-layout="2col"]')).toHaveCount(1)
  await expect(fixture.locator('[data-vl-layout="3col"]')).toHaveCount(1)
  await expect(fixture.locator('[data-vl-layout="cell"]')).toHaveCount(6)
  await expect(fixture.locator('[data-vl-layout="section"]')).not.toContainText(
    'After section paragraph.',
  )
  await expect(fixture.getByText('After section paragraph.')).toBeVisible()
  await expect(fixture.getByRole('heading', { name: 'Explicit Cell' })).toBeVisible()

  const edgeCases = page.getByTestId('directive-edge-cases')

  await expect(edgeCases.getByText(':::unknown')).toBeVisible()
  await expect(edgeCases.locator('[data-directive="callout"][data-variant="note"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="details"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="toc"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="cards"][data-columns="3"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="cards"][data-theme="default"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="card"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="card"][data-theme="default"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="steps"][data-layout="stack"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-directive="tabs"][data-theme="default"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-tab-panel][data-tab-value="same"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-tab-panel][data-tab-value="same-1"]')).toHaveCount(1)
  await expect(edgeCases.locator('pre code')).toContainText("const marker = ':::section'")
  await expect(edgeCases.locator('[data-vl-layout="2col"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-vl-layout="cell"]')).toHaveCount(2)
})

test('markdown field saves long documents and renders Payload field chrome', async ({ page, request }) => {
  const login = await request.post('/api/users/login', { data: devUser })
  expect(login.ok()).toBe(true)
  const { token } = (await login.json()) as { token: string }

  // Longer than Payload's default 40,000-character text limit (CORE-7).
  const content = `# Long markdown\n\n${'Lorem ipsum dolor sit amet. '.repeat(2000)}`
  const created = await request.post('/api/posts', {
    data: { slug: `long-markdown-${Date.now()}`, content, title: 'Long markdown' },
    headers: { Authorization: `JWT ${token}` },
  })

  expect(content.length).toBeGreaterThan(40_000)
  expect(created.status()).toBe(201)

  const { doc } = (await created.json()) as { doc: { content: string; id: number | string } }
  expect(doc.content).toHaveLength(content.length)

  await page.goto('/admin')
  await page.fill('#field-email', devUser.email)
  await page.fill('#field-password', devUser.password)
  await page.click('.form-submit button')
  await expect(page).toHaveTitle(/Dashboard/)

  await page.goto(`/admin/collections/posts/${doc.id}`)

  const field = page.locator('.payload-markdown-field')
  await expect(field).toHaveCount(1)
  await expect(field.locator('.field-label')).toContainText('Markdown')
  await expect(field.locator('.cm-editor')).toBeVisible()
  await expect(field.locator('.cm-content')).toContainText('# Long markdown')
  await expect(field.locator('.cm-content')).toHaveAttribute('contenteditable', 'true')
})

test('markdown blocks render on pages through RenderBlocks', async ({ page, request }) => {
  const login = await request.post('/api/users/login', { data: devUser })
  const { token } = (await login.json()) as { token: string }
  const slug = `markdown-block-${Date.now()}`

  const created = await request.post('/api/pages', {
    data: {
      slug,
      _status: 'published',
      layout: [{ blockType: 'vlMdBlock', content: '## Block heading\n\nRendered from a markdown block.' }],
      title: 'Markdown block page',
    },
    headers: { Authorization: `JWT ${token}` },
  })

  expect(created.status()).toBe(201)

  await page.goto(`/${slug}`)
  await expect(page.locator('#block-heading')).toHaveText('Block heading')
  await expect(page.getByText('Rendered from a markdown block.')).toBeVisible()
})

test('per-block markdown params start from inherited settings and override only what changes', async ({
  page,
  request,
}) => {
  const login = await request.post('/api/users/login', { data: devUser })
  const { token } = (await login.json()) as { token: string }
  const slug = `block-params-${Date.now()}`
  const created = await request.post('/api/pages', {
    data: {
      slug,
      _status: 'published',
      layout: [{ blockType: 'vlMdBlock', content: '## Params heading\n\n```js\nconst a = 1\n```' }],
      title: 'Block params page',
    },
    headers: { Authorization: `JWT ${token}` },
  })
  expect(created.status()).toBe(201)
  const { doc } = (await created.json()) as { doc: { id: number | string } }

  // Params disabled: the block renders with the `pages` collection's block defaults
  // (dev/payload.config.ts: className dev-pages-block, size sm, muted headings).
  await page.goto(`/${slug}`)
  const article = page.locator('article[id^="payload-markdown-"]').filter({ has: page.locator('#params-heading') })
  await expect(article).toHaveClass(/dev-pages-block/)
  await expect(article).toHaveClass(/prose-sm/)
  await expect(article).toHaveClass(/prose-h1:text-4xl/) // blog variant (renderer default)
  await expect(article.locator('.md-line-number').first()).toBeVisible()

  // Enabling params pre-fills them with exactly those effective values.
  await page.goto('/admin')
  await page.fill('#field-email', devUser.email)
  await page.fill('#field-password', devUser.password)
  await page.click('.form-submit button')
  await expect(page).toHaveTitle(/Dashboard/)
  await page.goto(`/admin/collections/pages/${doc.id}`)
  await page.getByRole('button', { name: 'Show All' }).click()
  await page.getByText('Enable Blocks Params', { exact: true }).click()

  const params = '#field-layout__0__md-params__config'
  await expect(page.locator(`${params}__className`)).toHaveValue('dev-pages-block')
  await expect(page.locator(`${params}__size`)).toContainText('Small')
  await expect(page.locator(`${params}__variant`)).toContainText('Blog')
  await expect(page.locator(`${params}__mutedHeadings`)).toBeChecked()
  await expect(page.locator(`${params}__options__showLineNumbers`)).toBeChecked()
  await expect(page.locator(`${params}__options__theme`)).toContainText('GitHub Dark')

  // Override two fields only, then publish.
  await page.locator(`${params}__variant .rs__control`).click()
  await page.locator('.rs__option', { hasText: 'Compact' }).click()
  await page.locator(`${params}__options__showLineNumbers`).uncheck()
  await page.getByRole('button', { name: 'Publish changes' }).click()
  await expect(page.locator('.payload-toast-container')).toContainText(/success/i)

  // The overrides win; everything else is still what the collection configured.
  await page.goto(`/${slug}`)
  await expect(article).toHaveClass(/prose-p:leading-6/) // compact variant
  await expect(article).not.toHaveClass(/prose-h1:text-4xl/)
  await expect(article).toHaveClass(/dev-pages-block/)
  await expect(article).toHaveClass(/prose-sm/)
  await expect(article.locator('.md-line-number')).toHaveCount(0)
  await expect(article.locator('pre.shiki.github-dark')).toBeVisible()
})

test('an MCP agent edits a markdown block over /api/mcp and publishes it', async ({ baseURL, page, request }) => {
  const login = await request.post('/api/users/login', { data: devUser })
  const { token } = (await login.json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }
  const slug = `mcp-agent-${Date.now()}`

  const created = await request.post('/api/pages', {
    data: {
      slug,
      _status: 'published',
      layout: [{ blockName: 'Intro', blockType: 'vlMdBlock', content: '## Before\n\nOriginal text.' }],
      title: `MCP agent ${slug}`,
    },
    headers,
  })
  expect(created.status()).toBe(201)
  const { doc } = (await created.json()) as { doc: { id: number | string } }

  const apiKey = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const key = await request.post('/api/payload-mcp-api-keys', {
    data: { apiKey, enableAPIKey: true, label: 'e2e agent', pages: { find: true, update: true } },
    headers,
  })
  expect(key.status()).toBe(201)

  const client = new Client({ name: 'payload-markdown-e2e', version: '1.0.0' })
  await client.connect(
    new StreamableHTTPClientTransport(new URL('/api/mcp', baseURL), {
      requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
    }),
  )

  const call = async (name: string, args: Record<string, unknown>) => {
    const result = (await client.callTool({ name, arguments: args })) as { content: Array<{ text: string }>; isError?: boolean }
    expect(result.isError ?? false, result.content[0].text).toBe(false)
    return result.content[0].text
  }

  try {
    expect(await call('markdownGuide', {})).toContain('## Workflow')

    const { docs } = JSON.parse(await call('markdownRead', { id: doc.id, collection: 'pages' })) as {
      docs: Array<{ targets: Array<{ ref: string }>; updatedAt: string }>
    }
    const markdown = '## After\n\n:::callout[Edited by an agent]{variant="tip"}\nWritten over MCP.\n:::'

    expect(JSON.parse(await call('markdownValidate', { collection: 'pages', markdown, scope: 'blocks' })).ok).toBe(true)

    const written = JSON.parse(
      await call('markdownWrite', {
        id: doc.id,
        collection: 'pages',
        edits: [{ action: 'replace', markdown, target: docs[0].targets[0].ref }],
        ifUpdatedAt: docs[0].updatedAt,
      }),
    )
    expect(written).toMatchObject({ saved: true, status: 'draft' })

    // Drafts stay off the live page until the agent publishes.
    await page.goto(`/${slug}`)
    await expect(page.locator('#before')).toHaveText('Before')

    expect(JSON.parse(await call('markdownPublish', { id: doc.id, collection: 'pages' }))).toMatchObject({
      status: 'published',
    })

    await page.goto(`/${slug}`)
    await expect(page.locator('#after')).toHaveText('After')
    await expect(page.locator('[data-directive="callout"]')).toContainText('Written over MCP.')
  } finally {
    await client.close()
  }
})

// Text that must stay legible (WCAG AA, 4.5:1) in every colour scheme, on
// whatever the directive actually paints behind it.
const LEGIBLE_TEXT: Array<[label: string, selector: string]> = [
  ['body paragraph', 'article > p'],
  ['body link', 'article > p a'],
  ['toc title', '[data-directive="toc"] > p'],
  ['toc link', '[data-directive="toc"] a'],
  ['card eyebrow', '[data-directive-eyebrow]'],
  ['card title', '[data-directive="card"] [data-directive-title]'],
  ['card body', '[data-directive="card"] [data-directive-body] p'],
  ['card link', '[data-directive="card"] [data-directive-body] a'],
  ['themed card body', '[data-directive="card"][data-theme="cyan"] [data-directive-body] p'],
  ...['note', 'info', 'tip', 'warning', 'danger', 'success'].flatMap((variant): Array<[string, string]> => [
    [`${variant} callout title`, `[data-directive="callout"][data-variant="${variant}"] [data-directive-title]`],
    [`${variant} callout body`, `[data-directive="callout"][data-variant="${variant}"] [data-directive-body] p`],
  ]),
  ['callout link', '[data-directive="callout"] [data-directive-body] a'],
  ['active tab', '[role="tab"][aria-selected="true"]'],
  ['inactive tab', '[role="tab"][aria-selected="false"]:not([disabled])'],
  ['tab panel', '[role="tabpanel"]:not([hidden]) p'],
  ['details summary', 'summary'],
  ['details body', '[data-directive="details"] [data-directive-body] p'],
  ['step title', '[data-step-card] h3'],
  ['step body', '[data-step-card] p'],
  ['table cell', 'td'],
  ...['primary', 'secondary', 'outline', 'ghost', 'link'].map((variant): [string, string] => [
    `${variant} button`,
    `.pmd-button--${variant}`,
  ]),
]

const SCHEME_CASES = [
  { dark: false, page: 'light', section: 'scheme-auto' },
  { dark: true, page: 'dark', section: 'scheme-auto' },
  // Pinned schemes ignore the page theme.
  { dark: true, page: 'light', section: 'scheme-dark' },
  { dark: false, page: 'dark', section: 'scheme-light' },
] as const

for (const { dark, page: pageTheme, section: sectionId } of SCHEME_CASES) {
  test(`directive defaults are legible: ${sectionId} on a ${pageTheme} page`, async ({ page }, testInfo) => {
    await page.goto(`/ui-fixtures?theme=${pageTheme}`)

    const section = page.getByTestId(sectionId)
    const card = section.locator('[data-directive="card"]').first()

    await expect(card).toBeVisible()

    const failures: string[] = []

    for (const [label, selector] of LEGIBLE_TEXT) {
      const target = section.locator(selector).first()

      await expect(target, label).toHaveCount(1)

      const { contrast } = await measureColors(target)
      if (contrast < 4.5) failures.push(`${label}: ${contrast.toFixed(2)}:1`)
    }

    expect(failures).toEqual([])

    // Surfaces follow the scheme: no dark panels on a light page or the reverse.
    const { luminance } = await measureColors(card)
    if (dark) expect(luminance).toBeLessThan(0.05)
    else expect(luminance).toBeGreaterThan(0.8)

    await testInfo.attach(`${sectionId}-${pageTheme}.png`, {
      body: await section.screenshot(),
      contentType: 'image/png',
    })
  })
}

for (const [pageTheme, surface, accent] of [
  ['light', 'rgb(253, 242, 248)', 'rgb(190, 24, 93)'],
  ['dark', 'rgb(42, 15, 29)', 'rgb(249, 168, 212)'],
] as const) {
  test(`consumer tokens, typography classes and themes override the defaults: ${pageTheme}`, async ({ page }) => {
    await page.goto(`/ui-fixtures?theme=${pageTheme}`)

    const overrides = page.getByTestId('overrides')
    const card = overrides.locator('[data-directive="card"][data-theme="default"]').first()
    const cardLink = card.locator('[data-directive-body] a')

    // Public tokens win over the defaults (and over the host's --color-card).
    await expect(card).toHaveCSS('background-color', surface)
    await expect(cardLink).toHaveCSS('color', accent)
    // A typography override in className reaches directive bodies and replaces
    // the default it conflicts with (prose-a:font-medium).
    await expect(cardLink).toHaveCSS('font-weight', '700')
    // --pmd-code-bg wins over the darker well used inside directives too.
    await expect(overrides.locator('article > pre').first()).toHaveCSS('background-color', 'rgb(11, 16, 33)')
    await expect(overrides.locator('[data-directive-body] pre').first()).toHaveCSS(
      'background-color',
      'rgb(11, 16, 33)',
    )

    // A custom theme replaces the default surface entirely.
    const brand = overrides.locator('[data-directive="card"][data-theme="brand"]')

    await expect(brand).toHaveCSS('border-top-width', '2px')
    await expect(brand).not.toHaveCSS('background-color', surface)

    // Overridden content stays legible.
    const failures: string[] = []

    for (const [label, selector] of LEGIBLE_TEXT) {
      const { contrast } = await measureColors(overrides.locator(selector).first())
      if (contrast < 4.5) failures.push(`${label}: ${contrast.toFixed(2)}:1`)
    }

    expect(failures).toEqual([])
  })
}

test('card grids collapse on container width, keeping the requested maximum', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 })
  await page.goto('/ui-fixtures?theme=light')

  const columns = async (width: number) =>
    gridColumnCount(page.getByTestId(`grid-${width}`).locator('[data-directive="cards"]'))

  expect(await columns(1000)).toBe(4)
  expect(await columns(700)).toBe(2)
  expect(await columns(360)).toBe(1)
})

test('demo pages do not scroll sideways on a phone', async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 })

  for (const demo of ['kitchen-sink', 'typography', 'cards', 'tabs', 'buttons-badges']) {
    for (const theme of ['light', 'dark']) {
      await page.goto(`/posts/demo-${demo}?theme=${theme}`)
      await expect(page.locator('[id^="payload-markdown-"]')).toBeVisible()

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )

      expect(overflow, `${demo} (${theme})`).toBe(0)
    }
  }
})
