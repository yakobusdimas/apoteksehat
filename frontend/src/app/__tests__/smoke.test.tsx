import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Smoke test: App renders without crashing

test('App renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});

// Smoke test: Main routes render without crashing

test('Main routes render without crashing', async () => {
  const { container } = render(<App />);
  // Wait for lazy routes to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(container.querySelector('main')).toBeTruthy();
});

// Smoke test: Build produces valid assets

test('Build produces valid assets', async () => {
  // This test is run after `npm run build` in CI
  const fs = require('fs');
  const path = require('path');
  const indexHtml = path.join(__dirname, '../../dist/index.html');
  const mainJs = path.join(__dirname, '../../dist/assets/index-*.js');
  
  expect(fs.existsSync(indexHtml)).toBe(true);
  
  const assetsDir = path.join(__dirname, '../../dist/assets');
  expect(fs.existsSync(assetsDir)).toBe(true);
  const assetFiles = fs.readdirSync(assetsDir);
  const hasIndexJs = assetFiles.some((f: string) => f.startsWith('index-') && f.endsWith('.js'));
  expect(hasIndexJs).toBe(true);
  
  const htmlContent = fs.readFileSync(indexHtml, 'utf-8');
  expect(htmlContent).toContain('<div id="root"></div>');
});
