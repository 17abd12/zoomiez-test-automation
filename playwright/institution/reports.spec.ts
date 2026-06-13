/**
 * UC-IN-04: Reports Generation
 * UC-IN-02: Teacher Management
 * SENSITIVE stubs: Resend (email), no real PDF generation
 *
 * NOTE: Institution pages use Radix UI <Select> — NOT native <select>.
 * Interaction pattern: click combobox trigger → click option (not selectOption).
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

/**
 * Helper: select a Radix UI combobox option by index and option label.
 * comboboxIndex = 0-based index of role="combobox" elements on the page.
 */
async function selectRadixOption(page: any, comboboxIndex: number, optionName: string | RegExp) {
  await page.getByRole('combobox').nth(comboboxIndex).click();
  await page.getByRole('option', { name: optionName }).click();
}

test.describe('UC-IN-04: Institution Reports', () => {
  test.beforeEach(async ({ page }) => {
    // Layout: InstitutionDashboardLayout fetches profile on mount — mock to prevent network errors
    await page.route(`${API}/api/institution/profile`, (r) =>
      r.fulfill({
        json: { institution_name: 'Test Academy', email: 'institution@example.com', logo_url: null },
      })
    );
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
    // Wait for options to load (loading spinner disappears)
    await expect(page.getByText(/Loading report controls/i)).not.toBeVisible({ timeout: 5_000 });

    // Radix UI Select: combobox index 0 = Report Type (already "student"), index 1 = Student
    await selectRadixOption(page, 1, /Ahmed Khan/i);

    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/12/)).toBeVisible({ timeout: 5_000 });
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
    await expect(page.getByText(/Loading report controls/i)).not.toBeVisible({ timeout: 5_000 });

    // Select student then get preview
    await selectRadixOption(page, 1, /Ahmed Khan/i);
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });

    const [printPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /print report/i }).click(),
    ]);
    await printPage.waitForLoadState();
    expect(printPage.url()).toContain('/institution/reports/print');
    await printPage.close();
  });

  test('print page renders institution branding', async ({ page, context }) => {
    await page.goto('/institution/reports');
    await expect(page.getByText(/Loading report controls/i)).not.toBeVisible({ timeout: 5_000 });

    await selectRadixOption(page, 1, /Ahmed Khan/i);
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });

    const [printPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /print report/i }).click(),
    ]);
    await printPage.waitForLoadState();
    await expect(printPage.getByText(/powered by zoomiez/i)).toBeVisible({ timeout: 8_000 });
    await printPage.close();
  });

  test('email report sends to recipient (Resend stubbed)', async ({ page }) => {
    await page.goto('/institution/reports');
    await expect(page.getByText(/Loading report controls/i)).not.toBeVisible({ timeout: 5_000 });

    // Must select a student — Send PDF button is disabled otherwise
    await selectRadixOption(page, 1, /Ahmed Khan/i);
    await page.getByPlaceholder(/parent@example\.com/i).fill('parent@example.com');
    await page.getByRole('button', { name: /send pdf/i }).click();
    await expect(page.getByText(/emailed successfully|sent/i)).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('UC-IN-02: Teacher Management', () => {
  test.beforeEach(async ({ page }) => {
    // Layout profile mock
    await page.route(`${API}/api/institution/profile`, (r) =>
      r.fulfill({
        json: { institution_name: 'Test Academy', email: 'institution@example.com', logo_url: null },
      })
    );
    // getInstitutionTeachers expects { teachers: [...], summary: {...} }
    await page.route(`${API}/api/institution/teachers`, (r) =>
      r.fulfill({
        json: {
          teachers: [
            { _id: 'tch-001', email: 'teacher@example.com', name: 'Test Teacher', status: 'active', subjects: ['Chemistry'], quiz_count: 5 }
          ],
          summary: { total_teachers: 1, total_quizzes: 5, total_evaluations: 0, avg_last_active_days: 2, weekly_progress: [] },
        },
      })
    );
    // Page also calls statistics and invites — must mock or the Promise.all fails
    await page.route(`${API}/api/institution/teachers/statistics`, (r) =>
      r.fulfill({
        json: {
          institution_name: 'Test Academy',
          overview: { average_class_score: 72, pass_fail_ratio: { pass: 8, fail: 2 }, platform_average: 65, historical_delta: 7, performance_trend: [] },
          topic_analysis: { topics: [], strong_topics: [], weak_topics: [] },
          ai_mapping: { strengths: [], weaknesses: [], teaching_gaps: [] },
        },
      })
    );
    await page.route(`${API}/api/institution/teachers/invites`, (r) =>
      r.fulfill({ json: [] })
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
    await expect(page.getByText(/Test Teacher/i)).toBeVisible({ timeout: 8_000 });
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
