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
  await expect(edgeCases.locator('pre code')).toContainText("const marker = ':::section'")
  await expect(edgeCases.locator('[data-vl-layout="2col"]')).toHaveCount(1)
  await expect(edgeCases.locator('[data-vl-layout="cell"]')).toHaveCount(2)
})
