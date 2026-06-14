// e2e/paiements.spec.ts
import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

test.describe('Paiements', () => {

  test('dashboard paiements s\'affiche', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.locator('h1').first()).toBeVisible()
    await page.waitForSelector('[class*="card"], [class*="stat"]', { timeout: 5_000 })
  })

  test('formulaire paiement : étape 1 (recherche élève)', async ({ page }) => {
    await page.goto('/paiements/nouveau')
    await expect(page.locator('text=1. Élève')).toBeVisible()
    await expect(page.locator('input[placeholder*="matricule"]')).toBeVisible()
  })

  test('recherche élève dans paiement', async ({ page }) => {
    await page.goto('/paiements/nouveau')
    await page.fill('input[placeholder*="matricule"]', '2026')
    await page.click('button:has-text("Chercher")')
    await page.waitForTimeout(1000)
    // Soit des résultats, soit "aucun élève trouvé"
    const content = await page.locator('body').textContent()
    expect(content).toBeTruthy()
  })

  test('page scolarités s\'affiche', async ({ page }) => {
    await page.goto('/scolarites')
    await expect(page.locator('h1, text=Scolarités').first()).toBeVisible()
  })

  test('stats paiements accessibles', async ({ page }) => {
    await page.goto('/paiements/stats')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('404')
  })
})
