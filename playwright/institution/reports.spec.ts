/**
 * UC-IN-04: Reports Generation
 * SENSITIVE stubs: Resend (email), no real PDF generation
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-IN-04: Institution Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/institution/reports/options`, (r) =>
      r.fulfill({
        json: {
          students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan' }],
          teachers: [{ email: 'teacher@example.com', name: 'Test Teacher' }],
          subjects: ['Chemistry', 'Physics'],
          classes: ['O-Level', 'A-Level'],
          detail_levels: ['summary', 'detailed'],
          report_types: ['student', 'teacher', 'parent'],
        },
      })
    );
    await page.route(`${API}/api/institution/reports/preview`, (r) =>
      r.fulfill({
        json: {
          report_type: 'student',
          title: 'Student Performance Report — Ahmed Khan',
          generated_at: new Date().toISOString(),
          profile: { name: 'Ahmed Khan', email: 'enrolled-student@example.com', class_level: 'O-Level', subject: 'Chemistry' },
          summary: { total_tests: 12, average_score: 72, pass_rate: '83%' },
          topic_breakdown: [{ topic: 'Atomic Structure', percentage: 85 }, { topic: 'Electrolysis', percentage: 60 }],
          insights: {
            common_strengths: ['Atomic structure'],
            common_weaknesses: ['Electrolysis'],
            simple_feedback: 'Ahmed shows strong conceptual understanding.',
          },
          recommendations: ['Review electrolysis discharge potential rules'],
        },
      })
    );
    await page.route(`${API}/api/institution/reports/download`, (r) =>
      r.fulfill({
        body: '%PDF-1.4 fake content',
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="report.pdf"' },
      })
    );
    // SENSITIVE: Resend stub
    await page.route(`${API}/api/institution/reports/email`, (r) =>
      r.fulfill({ json: { message: 'Report emailed successfully' } })
    );
    await page.route(`${API}/api/institution/reports/history`, (r) =>
      r.fulfill({ json: [] })
    );
  });

  test('reports page renders controls', async ({ page }) => {
    await page.goto('/institution/reports');
    await expect(page.getByText(/PDF.*Reports|PDF Generation/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /print report/i })).toBeVisible();
  });

  test('preview renders KPIs and topic breakdown', async ({ page }) => {
    await page.goto('/institution/reports');
    // Select student target
    await page.getByRole('combobox', { name: /student/i }).selectOption?.('enrolled-student@example.com');
    const studentSelect = page.locator('select').first();
    if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');

    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/total_tests|12/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/Atomic Structure/i)).toBeVisible();
    await expect(page.getByText(/Ahmed shows strong conceptual/i)).toBeVisible();
  });

  test('print button disabled before preview', async ({ page }) => {
    await page.goto('/institution/reports');
    const printBtn = page.getByRole('button', { name: /print report/i });
    await expect(printBtn).toBeDisabled({ timeout: 8_000 });
  });

  test('print button opens new tab after preview', async ({ page, context }) => {
    await page.goto('/institution/reports');
    // Get a preview first
    const studentSelect = page.locator('select').first();
    if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });

    const [printPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /print report/i }).click(),
    ]);
    await printPage.waitForLoadState();
    await expect(printPage.url()).toContain('/institution/reports/print');
    await printPage.close();
  });

  test('print page renders institution branding', async ({ page, context }) => {
    await page.goto('/institution/reports');
    const studentSelect = page.locator('select').first();
    if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });

    const [printPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /print report/i }).click(),
    ]);
    await printPage.waitForLoadState();
    // Should show institution info from localStorage
    await expect(printPage.getByText(/powered by zoomiez/i)).toBeVisible({ timeout: 8_000 });
    await printPage.close();
  });

  test('email report sends to recipient (Resend stubbed)', async ({ page }) => {
    await page.goto('/institution/reports');
    const studentSelect = page.locator('select').first();
    if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
    await page.getByPlaceholder(/recipient email|parent@/i).fill('parent@example.com');
    await page.getByRole('button', { name: /send pdf/i }).click();
    await expect(page.getByText(/emailed successfully|sent/i)).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('UC-IN-02: Teacher Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/institution/teachers`, (r) =>
      r.fulfill({
        json: [
          { _id: 'tch-001', email: 'teacher@example.com', name: 'Test Teacher', status: 'active', subjects: ['Chemistry'], quiz_count: 5 }
        ],
      })
    );
    // SENSITIVE: Resend stub
    await page.route(`${API}/api/institution/teachers/invite`, (r) =>
      r.fulfill({ json: { message: 'Teacher invited' } })
    );
  });

  test('teacher list renders', async ({ page }) => {
    await page.goto('/institution/teachers');
    await expect(page.getByText(/Test Teacher/i)).toBeVisible({ timeout: 8_000 });
  });

  test('invite teacher (Resend stubbed)', async ({ page }) => {
    await page.goto('/institution/teachers');
    const inviteBtn = page.getByRole('button', { name: /invite/i });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
      await page.getByLabel(/email/i).fill('new-teacher@example.com');
      await page.getByLabel(/name/i).fill('New Teacher');
      await page.getByRole('button', { name: /send invite|confirm/i }).click();
      await expect(page.getByText(/invited|success/i)).toBeVisible({ timeout: 8_000 });
    }
  });
});
