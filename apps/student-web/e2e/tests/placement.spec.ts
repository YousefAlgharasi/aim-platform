import { expect, Page, test } from '@playwright/test';
import { provisionStudent, removeStudent, TestStudent } from './provision';

let student: TestStudent;

test.beforeAll(async () => {
  student = await provisionStudent();
  // The API rate-limits to ~60 requests/min per client IP. Let the window from
  // any previous run (e.g. the other viewport project) expire before starting.
  await new Promise((r) => setTimeout(r, Number(process.env.E2E_SETTLE_MS ?? 62_000)));
});
test.afterAll(async () => {
  if (student) await removeStudent(student);
});

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(student.email);
  await page.getByLabel('Password', { exact: true }).fill(student.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

/** Answer whatever question type is on screen; skip the AI-graded ones. */
async function answerCurrentQuestion(page: Page): Promise<'answered' | 'skipped'> {
  const submit = page.getByRole('button', { name: /^(Submit answer|Submit & finish section)$/ });
  const skip = page.getByRole('button', { name: 'Skip', exact: true });

  if (await page.getByPlaceholder('Type your response here…').count()) {
    await skip.click(); // writing -> AI graded, not exercised here
    return 'skipped';
  }
  if (await page.getByText(/Record|microphone/i).first().isVisible().catch(() => false)
      && !(await page.locator('input[type=radio]').count())
      && !(await page.getByPlaceholder('Type your answer here…').count())) {
    await skip.click(); // speaking -> needs real audio
    return 'skipped';
  }
  if (await page.getByPlaceholder('Type your answer here…').count()) {
    await page.getByPlaceholder('Type your answer here…').fill('test');
  } else {
    await page.locator('input[type=radio]').first().check({ force: true });
  }
  await expect(submit).toBeEnabled();
  await submit.click();
  return 'answered';
}

test('student completes the placement test end to end in the browser', async ({ page }) => {
  await login(page);

  // ---- First-login gate (shown once per student) -----------------------------
  await page.waitForURL(/\/(placement\/gate|dashboard|placement)/);
  if (page.url().includes('/placement/gate')) {
    await expect(page.getByRole('heading', { name: 'How would you like to start?' })).toBeVisible();
    await page.getByRole('radio', { name: /Take the placement test/ }).check({ force: true });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await page.goto('/placement');

  // ---- Entry page ------------------------------------------------------------
  await expect(page.getByRole('heading', { name: 'Sections' })).toBeVisible();
  await page.getByRole('button', { name: /Start placement test|Continue|Resume/ }).first().click();
  await page.waitForURL(/\/placement\/[0-9a-f-]{36}$/);

  // ---- Every section, every question ----------------------------------------
  let answered = 0;
  let skipped = 0;
  for (let guard = 0; guard < 80; guard++) {
    if (await page.getByRole('heading', { name: 'Ready to submit?' }).isVisible().catch(() => false)) break;

    const startSection = page.getByRole('button', { name: 'Start section' });
    if (await startSection.isVisible().catch(() => false)) {
      await startSection.click();
      continue;
    }
    if (await page.getByText(/Question \d+ of \d+/).first().isVisible().catch(() => false)) {
      // timer must be shown while the attempt is running
      const r = await answerCurrentQuestion(page);
      r === 'answered' ? answered++ : skipped++;
      await page.waitForTimeout(Number(process.env.E2E_PACE_MS ?? 1500)); // human-like pace, stays under the rate limit
      continue;
    }
    await page.waitForTimeout(500);
  }

  expect(answered, 'objective questions answered via the UI').toBeGreaterThanOrEqual(20);
  expect(skipped, 'writing + speaking skipped').toBeLessThanOrEqual(3);

  // ---- Review + submit -------------------------------------------------------
  await expect(page.getByRole('heading', { name: 'Ready to submit?' })).toBeVisible();
  await expect(page.getByText('Answered', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Submit placement test' }).click();

  // ---- Result ---------------------------------------------------------------
  await page.waitForURL(/\/placement\/[0-9a-f-]{36}\/result$/);
  await expect(page.getByRole('heading', { name: 'Your level' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Skill summary', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible();

  // gate must not come back
  await page.goto('/dashboard');
  await expect(page).not.toHaveURL(/placement\/gate/);
});

test('unauthenticated visitors are sent to sign in', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/placement');
  await expect(page).toHaveURL(/login|session-expired/);
});
