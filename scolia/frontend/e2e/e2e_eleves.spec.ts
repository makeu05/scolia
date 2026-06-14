// e2e/eleves.spec.ts
import { test, expect, Page } from '@playwright/test'

// ── Auth partagée entre les tests ─────────────────────────────────────────────
test.use({ storageState: 'e2e/.auth/admin.json' })

test.beforeAll(async ({ browser }) => {
  // Connexion une seule fois, stockée dans un fichier
  const page = await browser.newPage()
  await page.goto('/login')
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/)
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
  await page.close()
})

test.describe('Gestion des élèves', () => {

  test('liste des élèves s\'affiche', async ({ page }) => {
    await page.goto('/eleves')
    await expect(page.locator('h1, [class*="title"]').first()).toContainText(/élève/i)
    // La liste doit se charger
    await page.waitForSelector('table, [class*="card"]', { timeout: 5_000 })
  })

  test('recherche un élève par nom', async ({ page }) => {
    await page.goto('/eleves')
    await page.fill('input[placeholder*="Rechercher"]', 'FOUDA')
    await page.waitForTimeout(500) // debounce
    // Vérifier que les résultats contiennent FOUDA ou "aucun résultat"
    const hasResults = await page.locator('text=FOUDA').count() > 0
    const hasEmpty   = await page.locator('text=Aucun').count() > 0
    expect(hasResults || hasEmpty).toBeTruthy()
  })

  test('formulaire de création d\'élève', async ({ page }) => {
    await page.goto('/eleves/nouveau')
    await expect(page.locator('text=Nouvel élève')).toBeVisible()

    // Remplir les champs obligatoires
    await page.fill('input[placeholder="FOUDA"]', 'PLAYWRIGHT')
    await page.fill('input[placeholder="Jean Claude"]', 'Test')
    await page.fill('input[type="date"]', '2010-06-15')
    await page.fill('input[placeholder="Yaoundé"]', 'Douala')

    // Vérifier que le bouton submit existe
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('navigation vers détail élève', async ({ page }) => {
    await page.goto('/eleves')
    await page.waitForSelector('table tbody tr, [class*="eleve"]', { timeout: 5_000 })

    // Cliquer sur le premier élève
    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.count() > 0) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/eleves\/\d+/)
      await expect(page.locator('text=Parents / Tuteurs')).toBeVisible()
    }
  })

  test('onglets dans détail élève', async ({ page }) => {
    await page.goto('/eleves')
    await page.waitForSelector('table tbody tr', { timeout: 5_000 })
    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.count() > 0) {
      await firstRow.click()
      await expect(page.locator('text=Informations')).toBeVisible()
      await expect(page.locator('text=Santé')).toBeVisible()
      await expect(page.locator('text=Scolarité antérieure')).toBeVisible()
    }
  })
})
