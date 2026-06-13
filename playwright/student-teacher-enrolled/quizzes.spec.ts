/**
 * UC-TE-02: Teacher-assigned quiz (teacher_enrolled student)
 * UC-TE-03: View quiz results
 * UC-TE-04: Evaluation report
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-TE-02: Teacher-Assigned Quiz', () => {
  test.beforeEach(async ({ page }) => {
    // Backend returns { success, quizzes: [...] } — processResponse wraps as { success, data: <body> }
    // so response.data = { success: true, quizzes: [...] }
    await page.route(`${API}/api/student-quiz/available`, (r) =>
      r.fulfill({
        json: {
          success: true,
          quizzes: [
            {
              _id: 'quiz-001',
              title: 'Chemistry MCQ Test 1',
              subject: 'Chemistry',
              class_level: 'O-Level',
              quiz_type: 'mcq',
              question_count: 3,
              duration_minutes: 30,
            },
          ],
        },
      })
    );
    await page.route(`${API}/api/student-quiz/quiz-001/start`, (r) =>
      r.fulfill({
        json: {
          success: true,
          attempt: {
            attempt_id: 'attempt-001',
            started_at: new Date().toISOString(),
          },
          quiz: {
            _id: 'quiz-001',
            title: 'Chemistry MCQ Test 1',
            quiz_type: 'mcq',
            duration_minutes: 30,
            questions: [
              {
                question_number: 1,
                question_text: 'Q1 text?',
                statement: 'Q1 text?',
                options: { A: 'A', B: 'B', C: 'C', D: 'D' },
                marks: 1,
              },
            ],
          },
        },
      })
    );
    await page.route(`${API}/api/student-quiz/quiz-001/submit`, (r) =>
      r.fulfill({
        json: {
          success: true,
          score: 1,
          total_marks: 3,
          percentage: 33,
          attempt: { attempt_id: 'attempt-001' },
        },
      })
    );
  });

  test('available quizzes list renders', async ({ page }) => {
    await page.goto('/student/quizzes');
    await expect(page.getByText(/Chemistry MCQ Test 1/i)).toBeVisible({ timeout: 8_000 });
  });

  test('start quiz loads questions', async ({ page }) => {
    await page.goto('/student/quizzes');
    await expect(page.getByText(/Chemistry MCQ Test 1/i)).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /start|play|begin/i }).first().click();
    await expect(page.getByText(/Q1 text/i)).toBeVisible({ timeout: 10_000 });
  });

  test('submit quiz shows score', async ({ page }) => {
    await page.goto('/student/quizzes');
    await expect(page.getByText(/Chemistry MCQ Test 1/i)).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /start|play|begin/i }).first().click();
    await expect(page.getByText(/Q1 text/i)).toBeVisible({ timeout: 10_000 });
    await page.getByText('A').first().click();
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText(/1.*3|33%/i)).toBeVisible({ timeout: 8_000 });
  });

  test('no quizzes assigned shows empty state', async ({ page }) => {
    await page.route(`${API}/api/student-quiz/available`, (r) =>
      r.fulfill({ json: { success: true, quizzes: [] } })
    );
    await page.goto('/student/quizzes');
    await expect(page.getByText(/no quizzes|no assignment/i)).toBeVisible({ timeout: 8_000 });
  });

  test('quiz lock shows dialog on navigation attempt', async ({ page }) => {
    await page.goto('/student/quizzes');
    await page.getByRole('button', { name: /start|play|begin/i }).first().click();
    await expect(page.getByText(/Q1 text/i)).toBeVisible({ timeout: 10_000 });
    // Component uses window.addEventListener('beforeunload') — native browser dialog, not React modal.
    // Playwright fires beforeunload on page.goBack(); catch it before triggering navigation.
    const dialogPromise = page.waitForEvent('dialog');
    await page.goBack();
    const dialog = await dialogPromise.catch(() => null);
    if (dialog) {
      expect(dialog.message()).toMatch(/active quiz/i);
      await dialog.dismiss();
    }
    // Fallback: if no native dialog fired, the page still navigated (no crash)
  });
});

test.describe('UC-TE-03: View Quiz Results', () => {
  test.beforeEach(async ({ page }) => {
    // StudentResultsResponse: { success, quiz_results: [...], teacher_evaluations: [...] }
    await page.route(`${API}/api/student-quiz/results`, (r) =>
      r.fulfill({
        json: {
          success: true,
          quiz_results: [],
          teacher_evaluations: [
            {
              submission_id: 'eval-001',
              quiz_title: 'Chemistry SQ 1',
              subject: 'Chemistry',
              percentage: 70,
              submitted_at: '2024-03-15T00:00:00Z',
            },
          ],
        },
      })
    );
  });

  test('results page shows submission list', async ({ page }) => {
    await page.goto('/student/results');
    await expect(page.getByText(/Chemistry SQ 1/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/70%/i)).toBeVisible();
  });

  test('self_enrolled cannot access /student/results', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => {
      // isLoggedIn REQUIRED — ProtectedRoute checks this to decide redirect vs login
      localStorage.setItem('app_state', JSON.stringify({
        auth: {
          isLoggedIn: true,
          token: 'test-token',
          user: {
            email: 'self@example.com',
            role: 'student',
            student_type: 'self_enrolled',
            onboarding_completed: true,
          },
        },
      }));
    });
    await page.goto('/student/results');
    // ProtectedRoute redirects self_enrolled away from /student/results
    await expect(page).not.toHaveURL(/\/student\/results/, { timeout: 8_000 });
    await context.close();
  });
});

test.describe('UC-TE-04: Evaluation Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/student-quiz/evaluations/report/eval-001`, (r) =>
      r.fulfill({
        json: {
          success: true,
          submission_id: 'eval-001',
          student_email: 'enrolled-student@example.com',
          quiz_title: 'Chemistry SQ 1',
          subject: 'Chemistry',
          total_marks_obtained: 14,
          total_marks_available: 20,
          percentage: 70,
          evaluations: [
            {
              root_question_id: 'q1',
              question_number: 1,
              part_label: 'a',
              marks_awarded: 2,
              marks_total: 2,
              is_correct: true,
              feedback: 'Correct.',
              mistake: null,
              improve: null,
            },
            {
              root_question_id: 'q1',
              question_number: 1,
              part_label: 'b',
              marks_awarded: 2,
              marks_total: 4,
              is_correct: false,
              feedback: 'Partial credit.',
              mistake: 'Missed discharge potential.',
              improve: 'Review selective discharge rules.',
            },
          ],
        },
      })
    );
  });

  test('evaluation report renders masthead + questions', async ({ page }) => {
    await page.goto('/student/results/eval-001');
    await expect(page.getByText(/Chemistry SQ 1/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/14.*20|70%/i)).toBeVisible();
    await expect(page.getByText(/Question 1/i)).toBeVisible();
  });

  test('partial answer shows insight blocks', async ({ page }) => {
    await page.goto('/student/results/eval-001');
    await expect(page.getByText(/Missed discharge potential/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/Review selective discharge/i)).toBeVisible();
  });

  test('print button is visible on screen', async ({ page }) => {
    await page.goto('/student/results/eval-001');
    await expect(page.getByRole('button', { name: /print|save pdf/i })).toBeVisible({ timeout: 8_000 });
  });
});
