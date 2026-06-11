// e2e/communication.spec.ts
import { test, expect, Page } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

test.describe('Communication / Messagerie', () => {

  test('page communication s\'affiche', async ({ page }) => {
    await page.goto('/communication')
    await expect(page.locator('text=Communication')).toBeVisible()
  })

  test('liste des conversations visible', async ({ page }) => {
    await page.goto('/communication')
    await page.waitForLoadState('networkidle')
    // Soit des conversations, soit "Aucune conversation"
    const hasConvs  = await page.locator('[class*="conversation"], button:has-text("min")').count() > 0
    const hasEmpty  = await page.locator('text=Aucune conversation').count() > 0
    expect(hasConvs || hasEmpty).toBeTruthy()
  })

  test('ouvrir une conversation', async ({ page }) => {
    await page.goto('/communication')
    await page.waitForLoadState('networkidle')
    const conv = page.locator('[class*="conversation"]').first()
    if (await conv.count() > 0) {
      await conv.click()
      // Zone de saisie doit apparaître
      await expect(page.locator('textarea, input[placeholder*="message"]')).toBeVisible()
    }
  })

  test('envoyer un message', async ({ page }) => {
    await page.goto('/communication')
    await page.waitForLoadState('networkidle')

    const conv = page.locator('button').filter({ hasText: /min|instant/ }).first()
    if (await conv.count() > 0) {
      await conv.click()
      const input = page.locator('textarea').first()
      await input.fill('Test message Playwright ' + Date.now())
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      // Vérifier que le message apparaît
      await expect(page.locator('text=Test message Playwright').first()).toBeVisible()
    }
  })

  test('bouton message collectif visible', async ({ page }) => {
    await page.goto('/communication')
    await expect(page.locator('text=Message collectif')).toBeVisible()
  })

  test('formulaire message collectif', async ({ page }) => {
    await page.goto('/communication')
    await page.click('text=Message collectif')
    await expect(page.locator('text=Envoyer à tous les parents')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
  })
})
