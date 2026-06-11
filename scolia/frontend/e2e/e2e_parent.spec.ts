// e2e/parent.spec.ts
import { test, expect, Browser } from '@playwright/test'

// Auth parent séparée
test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const page = await browser.newPage()
  await page.goto('/login')
  await page.fill('input[type="text"]', 'parent_test') // ← adapter
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard-parent/, { timeout: 10_000 })
  await page.context().storageState({ path: 'e2e/.auth/parent.json' })
  await page.close()
})

test.use({ storageState: 'e2e/.auth/parent.json' })

test.describe('Espace Parent', () => {

  test('dashboard parent s\'affiche', async ({ page }) => {
    await page.goto('/dashboard-parent')
    await expect(page.locator('text=Espace Parent')).toBeVisible()
  })

  test('4 onglets présents', async ({ page }) => {
    await page.goto('/dashboard-parent')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Notes & Bulletins')).toBeVisible()
    await expect(page.locator('text=Absences')).toBeVisible()
    await expect(page.locator('text=Paiements')).toBeVisible()
    await expect(page.locator('text=Messages')).toBeVisible()
  })

  test('onglet absences s\'ouvre', async ({ page }) => {
    await page.goto('/dashboard-parent')
    await page.waitForLoadState('networkidle')
    await page.click('text=Absences')
    await page.waitForTimeout(500)
    // Stats absences visibles
    await expect(page.locator('text=Total').first()).toBeVisible()
  })

  test('onglet messages : interface chat', async ({ page }) => {
    await page.goto('/dashboard-parent')
    await page.waitForLoadState('networkidle')
    await page.click('text=Messages')
    await page.waitForTimeout(500)
    await expect(page.locator('text=Administration')).toBeVisible()
    await expect(page.locator('textarea, input[placeholder*="message"]')).toBeVisible()
  })

  test('envoyer un message depuis le parent', async ({ page }) => {
    await page.goto('/dashboard-parent')
    await page.click('text=Messages')
    await page.waitForTimeout(500)
    const input = page.locator('textarea').first()
    await input.fill('Bonjour, test Playwright parent')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Bonjour, test Playwright parent')).toBeVisible()
  })

  test('parent ne peut pas accéder à /eleves', async ({ page }) => {
    await page.goto('/eleves')
    // Doit être redirigé ou voir une page non autorisée
    const url = page.url()
    const isRedirected = url.includes('non-autorise') || url.includes('dashboard-parent') || url.includes('login')
    expect(isRedirected).toBeTruthy()
  })
})
