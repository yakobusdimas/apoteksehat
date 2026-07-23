import { test, expect } from '@playwright/test';

test.describe('APOTEK - Landing Page', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveTitle(/Apotek|APOTEK|apotek/i);
    
    // Check page is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show navigation/header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait a bit for React hydration
    await page.waitForTimeout(3000);
    
    // Check for navigation or header elements
    const navOrHeader = page.locator('nav, header, [role="navigation"]').first();
    await expect(navOrHeader).toBeVisible({ timeout: 15000 });
  });

  test('should have login/register links or buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Look for login or register elements
    const loginBtn = page.locator('a[href="/login"], button:has-text("Login"), button:has-text("Masuk"), a:has-text("Masuk"), a:has-text("Login")').first();
    await expect(loginBtn).toBeVisible({ timeout: 15000 });
  });
});
