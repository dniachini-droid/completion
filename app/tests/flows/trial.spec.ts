import { expect, test } from '@playwright/test';

// The Phase 8 trial flow: hall → choose a length → Begin → delve → it ends → back. Plus: survives a reload; no network.
test('a trial delve runs from the clock, survives a reload, and ends', async ({ page, context }, info) => {
  const outside: string[] = [];
  context.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173')) outside.push(r.url()); });
  await context.grantPermissions(['notifications']);
  await page.clock.install({ time: new Date('2026-09-24T10:02:00') });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The Lamp Hall' })).toBeVisible();
  await page.clock.runFor(1500);
  await page.screenshot({ path: `shots/${info.project.name}-hall.png` });

  await page.getByRole('button', { name: '3 min' }).click();
  await expect(page.getByRole('button', { name: '3 min' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Begin' }).click();
  await expect(page.getByRole('img', { name: '3 min left' })).toBeVisible();

  await page.clock.fastForward(61_000);
  await expect(page.getByRole('img', { name: '2 min left' })).toBeVisible();
  await page.screenshot({ path: `shots/${info.project.name}-delve.png` });

  // Closing the app loses nothing: the delve is read back and worked out from the clock.
  await page.reload();
  await expect(page.getByRole('img', { name: '2 min left' })).toBeVisible();

  await page.clock.fastForward(125_000);
  await expect(page.getByText('The delve is over.')).toBeVisible();
  await page.clock.runFor(1500);
  await page.screenshot({ path: `shots/${info.project.name}-ended.png` });

  await page.getByRole('button', { name: 'Back to the hall' }).click();
  await expect(page.getByRole('heading', { name: 'The Lamp Hall' })).toBeVisible();

  // Nothing sideways, and nothing left the app.
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(sideways).toBe(false);
  expect(outside).toEqual([]);
});
