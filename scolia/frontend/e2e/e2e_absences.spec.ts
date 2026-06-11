// e2e/absences.spec.ts
import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

test.describe('Gestion des absences', () => {

  test('page absences s\'affiche', async ({ page }) => {
    await page.goto('/absences')
    await expect(page.locator('text=Absences & Retards')).toBeVisible()
  })

  test('bouton saisir une absence', async ({ page }) => {
    await page.goto('/absences')
    await page.click('text=Saisir une absence')
    // Modal s'ouvre
    await expect(page.locator('text=Élève individuel')).toBeVisible()
    await expect(page.locator('text=Toute une classe')).toBeVisible()
  })

  test('filtres fonctionnent', async ({ page }) => {
    await page.goto('/absences')
    await page.waitForLoadState('networkidle')

    // Filtre par statut
    await page.selectOption('select', 'non_justifiee')
    await page.waitForTimeout(500)
    await expect(page.locator('body')).not.toContainText('Erreur')
  })

  test('basculer mode saisie classe', async ({ page }) => {
    await page.goto('/absences')
    await page.click('text=Saisir une absence')
    await page.click('text=Toute une classe')
    await expect(page.locator('text=Classe')).toBeVisible()
    await expect(page.locator('select').first()).toBeVisible()
  })
})
