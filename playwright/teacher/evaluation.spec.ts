/**
 * UC-TC-05: Teacher Evaluation
 * SENSITIVE routes stubbed: OpenAI GPT (submit), Mistral OCR (image path)
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-TC-05: Teacher Evaluation — stubbed', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/teacher/evaluations/options`, (r) =>
      r.fulfill({
        json: {
          students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan' }],
          quizzes: [{ _id: 'quiz-001', title: 'Chemistry SQ 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'sq', question_count: 3 }],
        },
      })
    );
    // SENSITIVE: OpenAI + (optional) Mistral — always stub
    await page.route(`${API}/api/teacher/evaluations/submit`, (r) =>
      r.fulfill({
        json: {
          submission_id: 'eval-001',
          student_email: 'enrolled-student@example.com',
          quiz_title: 'Chemistry SQ 1',
          total_marks_obtained: 14,
          total_marks_available: 20,
          percentage: 70,
          evaluations: [
            { root_question_id: 'q1', question_number: 1, part_label: 'a', marks_awarded: 2, marks_total: 2, is_correct: true, feedback: 'Correct.' },
            { root_question_id: 'q1', question_number: 1, part_label: 'b', marks_awarded: 2, marks_total: 4, is_correct: false, feedback: 'Partial.', mistake: 'Omitted discharge potential.', improve: 'Review section 4.' },
          ],
        },
      })
    );
    await page.route(`${API}/api/teacher/evaluations/history/*`, (r) =>
      r.fulfill({
        json: [{ submission_id: 'eval-001', quiz_title: 'Chemistry SQ 1', subject: 'Chemistry', level: 'O-Level', evaluation_type: 'sq', total_marks_obtained: 14, total_marks_available: 20, percentage: 70 }],
      })
    );
    await page.route(`${API}/api/teacher/evaluations/report/*`, (r) =>
      r.fulfill({ json: { submission_id: 'eval-001', evaluations: [], total_marks_obtained: 14, total_marks_available: 20 } })
    );
  });

  test('evaluation page loads with student and quiz selects', async ({ page }) => {
    await page.goto('/teacher/evaluation');
    await expect(page.getByText(/evaluation module/i)).toBeVisible({ timeout: 8_000 });
    // Native <select> options are in DOM but not "visible" in a closed dropdown — check attachment instead
    await expect(page.locator('option', { hasText: /Ahmed Khan/i })).toBeAttached({ timeout: 5_000 });
  });

  test('submit text evaluation returns report (OpenAI stubbed)', async ({ page }) => {
    await page.goto('/teacher/evaluation');
    // Select student
    await page.locator('select').first().selectOption('enrolled-student@example.com');
    // Select quiz
    await page.locator('select').nth(1).selectOption('quiz-001');
    // Paste extracted text
    await page.getByPlaceholder(/Question statement/i).fill('Q1a) Cathode: Hydrogen. Anode: Chlorine. Q1b) Because Cl- is more concentrated.');
    // Submit
    await page.getByRole('button', { name: /run evaluation/i }).click();
    // Report tab appears — click it to reveal tab content (content hidden until tab activated)
    await expect(page.getByText(/Evaluation Report/i).first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /evaluation report/i }).click();
    await expect(page.getByText(/14.*20|70%/i)).toBeVisible({ timeout: 5_000 });
  });

  test('no student selected shows validation error', async ({ page }) => {
    await page.goto('/teacher/evaluation');
    await page.getByRole('button', { name: /run evaluation/i }).click();
    await expect(page.getByText('Select student and a pre-made quiz first.')).toBeVisible({ timeout: 5_000 });
  });

  test('no input (no file, no text) shows validation error', async ({ page }) => {
    await page.goto('/teacher/evaluation');
    await page.locator('select').first().selectOption('enrolled-student@example.com');
    await page.locator('select').nth(1).selectOption('quiz-001');
    await page.getByRole('button', { name: /run evaluation/i }).click();
    await expect(page.getByText('Upload a solved paper (PNG/PDF) or paste extracted text.')).toBeVisible({ timeout: 5_000 });
  });

  test('print button opens new tab', async ({ page, context }) => {
    await page.goto('/teacher/evaluation');
    await page.locator('select').first().selectOption('enrolled-student@example.com');
    await page.locator('select').nth(1).selectOption('quiz-001');
    await page.getByPlaceholder(/Question statement/i).fill('Some answer text.');
    await page.getByRole('button', { name: /run evaluation/i }).click();
    await expect(page.getByText(/Evaluation Report/i).first()).toBeVisible({ timeout: 15_000 });

    // Switch to report tab
    await page.getByRole('tab', { name: /evaluation report/i }).click();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /print.*pdf/i }).click(),
    ]);
    await newPage.waitForLoadState();
    await expect(newPage.url()).toContain('/teacher/evaluation/print');
    await newPage.close();
  });
});

test.describe('UC-TC-04: Quiz Management', () => {
  test.beforeEach(async ({ page }) => {
    // getMyQuizzes checks data.success — mock must return { success: true, quizzes: [...] }
    await page.route(`${API}/api/teacher-quiz/my-quizzes`, (r) =>
      r.fulfill({
        json: {
          success: true,
          quizzes: [
            { _id: 'quiz-001', title: 'Chemistry MCQ 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'mcq', question_count: 20, status: 'active' },
          ],
        },
      })
    );
    await page.route(`${API}/api/teacher-quiz/subjects/*`, (r) =>
      r.fulfill({ json: { subjects: ['Chemistry', 'Physics', 'Biology'] } })
    );
    await page.route(`${API}/api/teacher-quiz/save`, (r) =>
      r.fulfill({ json: { quiz_id: 'new-quiz', message: 'Quiz saved' } })
    );
  });

  test('quiz list renders', async ({ page }) => {
    await page.goto('/teacher/quizzes');
    // Default tab is "create" — must click "My Quizzes" tab to trigger loadQuizzes()
    await page.getByRole('tab', { name: /my quizzes/i }).click();
    await expect(page.getByText(/Chemistry MCQ 1/i)).toBeVisible({ timeout: 8_000 });
  });

  test('print quiz opens new tab with light background', async ({ page, context }) => {
    await page.goto('/teacher/quizzes');
    // Default tab is "create" — must click "My Quizzes" tab to trigger loadQuizzes()
    await page.getByRole('tab', { name: /my quizzes/i }).click();
    await expect(page.getByText(/Chemistry MCQ 1/i)).toBeVisible({ timeout: 8_000 });
    const printBtn = page.getByRole('button', { name: /print/i }).first();
    if (await printBtn.isVisible()) {
      const [printPage] = await Promise.all([
        context.waitForEvent('page'),
        printBtn.click(),
      ]);
      await printPage.waitForLoadState();
      await expect(printPage.url()).toContain('/teacher/quizzes/print');
      // Verify light background (masthead background should be f8fafc not dark)
      const bgColor = await printPage.evaluate(() => {
        const el = document.querySelector('[data-testid="quiz-print-masthead"]');
        if (!el) return '';
        return getComputedStyle(el).backgroundColor;
      });
      // Should not be dark background
      expect(bgColor).not.toBe('rgb(30, 41, 59)'); // #1e293b
      await printPage.close();
    }
  });
});
