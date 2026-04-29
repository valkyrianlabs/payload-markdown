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
  await expect(fixture.locator('[data-directive="callout"]')).toHaveCount(6)
  await expect(fixture.locator('[data-directive="callout"][data-variant="warning"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"][data-variant="danger"]')).toHaveCount(1)
  await expect(fixture.locator('[data-directive="callout"][data-variant="success"]')).toHaveCount(1)
  await expect(fixture.getByText('Default note callout with')).toBeVisible()

  const details = fixture.locator('[data-directive="details"]')

  await expect(details).toHaveCount(1)
  await expect(details.locator('summary')).toContainText('Advanced install notes')
  await details.locator('summary').click()
  await expect(details).toHaveAttribute('open', '')
  await expect(details.getByText('These steps are only needed when running from source.')).toBeVisible()

  await expect(fixture.locator('[data-vl-layout="section"]')).toHaveCount(1)
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
  await expect(edgeCases.locator('pre code')).toContainText("const marker = ':::section'")
  await expect(edgeCases.locator('[data-vl-layout="2col"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-vl-layout="cell"]')).toHaveCount(2)
})
