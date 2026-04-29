import { expect, test } from '@playwright/test'

import { devUser } from './helpers/credentials'

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
  await expect(fixture.locator('[data-directive="card"]')).toHaveCount(6)
  await expect(fixture.locator('[data-directive="card"][data-theme="glass"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-theme="muted"]')).toHaveCount(2)
  await expect(fixture.locator('[data-directive="card"][data-theme="cyan"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-theme="violet"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-theme="emerald"]')).toHaveCount(1)
  await expect(spaciousCards.locator('.vl-md-card--theme-cyan')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"] a[href="/docs/markdown-field"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="card"][data-href="/docs/markdown-field"]')).toContainText(
    'Portable Markdown content',
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
  await expect(fixture.locator('[data-directive="steps"]:not([data-variant])')).toContainText(
    'Install the package',
  )
  await expect(fixture.locator('[data-directive="callout"]')).toHaveCount(8)
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

  await expect(details).toHaveCount(2)
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
  await expect(edgeCases.locator('pre code')).toContainText("const marker = ':::section'")
  await expect(edgeCases.locator('[data-vl-layout="2col"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-vl-layout="cell"]')).toHaveCount(2)
})
