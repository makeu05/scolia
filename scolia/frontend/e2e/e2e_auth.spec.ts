// e2e/auth.spec.ts
import { test, expect, Page } from '@playwright/test'

// ── Helper login ──────────────────────────────────────────────────────────────
async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="username"], input[placeholder*="utilisateur"], input[type="text"]', username)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(url => !url.includes('/login'), { timeout: 10_000 })
}

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Authentification', () => {

  test('page login s\'affiche correctement', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Scolia/)
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login admin réussi → redirige vers dashboard', async ({ page }) => {
    await login(page, 'admin', 'password')  // ← adapter au vrai compte
    await expect(page).toHaveURL(/dashboard/)
  })

  test('login mauvais mdp → message d\'erreur', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'mauvais')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Identifiants invalides')).toBeVisible()
  })

  test('login parent → redirige vers dashboard-parent', async ({ page }) => {
    await login(page, 'parent_test', 'password')
    await expect(page).toHaveURL(/dashboard-parent/)
    await expect(page.locator('text=Espace Parent')).toBeVisible()
  })

  test('accès protégé sans connexion → redirige vers login', async ({ page }) => {
    await page.goto('/eleves')
    await expect(page).toHaveURL(/login/)
  })

  test('déconnexion fonctionne', async ({ page }) => {
    await login(page, 'admin', 'password')
    // Cliquer sur le bouton de déconnexion (adapter selon votre UI)
    await page.click('[data-testid="logout-btn"], text=Déconnexion')
    await expect(page).toHaveURL(/login/)
  })
})
