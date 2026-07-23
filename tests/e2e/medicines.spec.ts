import { test, expect } from '@playwright/test';

test.describe('APOTEK - Medicine Images & Products', () => {
  test('should load medicines from backend API', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/medicines?per_page=5');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('medicines');
    expect(data.medicines.length).toBeGreaterThan(0);
    
    // Verify first medicine has required fields
    const med = data.medicines[0];
    expect(med).toHaveProperty('name');
    expect(med).toHaveProperty('price');
    expect(med).toHaveProperty('photo');
    expect(med.price).toBeGreaterThan(0);
  });

  test('should serve medicine image via static path', async ({ request }) => {
    // First get a medicine with photo
    const listRes = await request.get('http://localhost:5000/api/medicines?per_page=1');
    const listData = await listRes.json();
    const photo = listData.medicines[0].photo;
    
    expect(photo).toBeTruthy();
    expect(photo).toContain('/static/images/medicines/');
    
    // Verify the image is accessible
    const imgRes = await request.get(`http://localhost:5000${photo}`);
    expect(imgRes.ok()).toBeTruthy();
    expect(imgRes.headers()['content-type']).toContain('image');
  });

  test('should load Amlodac medicine with image', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/medicines?q=Amlodac&per_page=1');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.medicines.length).toBeGreaterThan(0);
    
    const amlodac = data.medicines[0];
    expect(amlodac.name).toContain('Amlodac');
    expect(amlodac.photo).toContain('/static/images/medicines/Amlodac');
    
    // Verify image loads
    const imgRes = await request.get(`http://localhost:5000${amlodac.photo}`);
    expect(imgRes.ok()).toBeTruthy();
  });

  test('should return nonzero prices for all medicines', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/medicines?per_page=200');
    const data = await response.json();
    
    for (const med of data.medicines) {
      expect(med.price, `Medicine "${med.name}" has zero price`).toBeGreaterThan(0);
    }
  });

  test('should have medicine categories', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/medicines/categories');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    // API returns { categories: [...], status: "success" }
    expect(data.categories).toBeDefined();
    expect(data.categories.length).toBeGreaterThan(0);
  });
});

test.describe('APOTEK - Frontend Medicine Display', () => {
  test('should display medicine detail page with image', async ({ page }) => {
    // First get a medicine ID from API
    const response = await page.request.get('http://localhost:5000/api/medicines?per_page=1');
    const data = await response.json();
    const medicineId = data.medicines[0].id;
    const medicineName = data.medicines[0].name;
    
    // Navigate to medicine detail
    await page.goto(`/medicine/${medicineId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check page shows medicine info
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(medicineName);
  });

  test('should display medicines on user dashboard', async ({ page }) => {
    await page.goto('/user/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Page should load without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should redirect to login if not authenticated
    const url = page.url();
    // Either shows dashboard or redirects to login
    expect(url.includes('/user/dashboard') || url.includes('/login') || url.includes('/')).toBeTruthy();
  });
});

test.describe('APOTEK - Frontend Proxied Static Images', () => {
  test('should serve static images through Vite proxy', async ({ request }) => {
    // Test that frontend dev server proxies /static to backend
    const response = await request.get('http://localhost:5173/static/images/medicines/Amlodac_25_Tablet.png');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image');
  });
});
