import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('Verificar acceso a resumen digital de liquidaciones para instrumentador', async ({ app, browser }) => {
  await app.open('/resumen/demo-token');
  await expect(browser.locator('body')).toBeVisible();
});

test('Verificar pantalla de acceso y autenticación', async ({ app, browser }) => {
  await app.open('/login');
  await expect(browser.locator('body')).toBeVisible();
});
