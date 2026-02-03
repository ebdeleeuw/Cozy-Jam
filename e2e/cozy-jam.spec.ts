import { test, expect } from '@playwright/test';

async function openSecondPage(context) {
  const page = await context.newPage();
  await page.goto('/');
  return page;
}

test('queue join updates on-stage and queue label', async ({ page, context }) => {
  await page.goto('/');

  const page2 = await openSecondPage(context);

  await expect(page.getByTestId('ws-status')).toHaveText('Live', { timeout: 10000 });
  await page.getByTestId('join-jam').click();

  await expect(page.getByTestId('on-stage-name')).toHaveText(/\w+/, { timeout: 10000 });
  await expect(page.getByText(/Live Now/i)).toBeVisible();

  await expect(page2.getByTestId('on-stage-name')).toHaveText(/\w+/, { timeout: 10000 });
});

test('reactions appear across tabs', async ({ page, context }) => {
  await page.goto('/');
  const page2 = await openSecondPage(context);

  await expect(page.getByTestId('ws-status')).toHaveText('Live', { timeout: 10000 });
  await expect(page2.getByTestId('ws-status')).toHaveText('Live', { timeout: 10000 });

  await page.getByTitle('Send Love').click();
  // Reaction should appear in DOM of second page (may animate with opacity)
  await expect(page2.getByTestId('reaction-particle')).toHaveCount(1, { timeout: 10000 });
});
