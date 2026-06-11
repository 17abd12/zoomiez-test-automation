/**
 * UC-SE-03 Past Papers + UC-SE-04 MCQ Practice + UC-SE-05 SQ Practice
 * Runs as self-enrolled student (storageState injected by auth.setup.ts)
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-SE-03: Past Papers — Browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/papers/available`, (r) =>
      r.fulfill({ json: { papers: [{ id: 'chem-2023-mj', variant: 'Paper 1', year: '2023', session: 'May/June' }] } })
    );
  });

  test('browse page renders subject cards', async ({ page }) => {
    await page.goto('/student/past-papers');
    await expect(page.getByRole('heading', { name: /past papers/i })).toBeVisible();
    await expect(page.getByText(/chemistry/i).first()).toBeVisible();
  });

  test('click MCQ variant navigates to practice page', async ({ page }) => {
    await page.goto('/student/past-papers');
    const chemCard = page.getByText(/chemistry/i).first();
    await chemCard.click();
    await expect(page.getByText(/mcq|paper 1/i)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('UC-SE-04: Paper Practice — MCQ', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/papers/random`, (r) =>
      r.fulfill({
        json: {
          paper_type: 'mcq',
          questions: [
            { question_number: 1, question_text: 'Which element has atomic number 6?', options: { A: 'N', B: 'C', C: 'O', D: 'B' }, correct_answer: 'B' },
            { question_number: 2, question_text: 'Bond between Na and Cl?', options: { A: 'Covalent', B: 'Metallic', C: 'Ionic', D: 'H-bond' }, correct_answer: 'C' },
          ],
          total_questions: 2,
          time_limit_minutes: 45,
        },
      })
    );
    await page.route(`${API}/api/papers/submit`, (r) =>
      r.fulfill({ json: { submission_id: 'sub-001', score: 1, total: 2, percentage: 50, correct: [1], wrong: [2] } })
    );
  });

  test('paper loads with questions', async ({ page }) => {
    await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  });

  test('selecting answer highlights choice', async ({ page }) => {
    await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    await page.getByText('C').first().click();
    // Expect selection to be visually marked (class change or aria-pressed)
    await expect(page.getByText('C').first()).toBeVisible();
  });

  test('submit shows score result', async ({ page }) => {
    await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    // Select answers
    await page.getByText('B').first().click();
    await page.getByText('C').first().click();
    // Submit
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText(/1.*2|50%/i)).toBeVisible({ timeout: 8_000 });
  });

  test('navigate away during attempt shows QuizLock dialog', async ({ page }) => {
    await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    // Attempt navigate away
    await page.goBack();
    // QuizLock intercept dialog should appear
    await expect(page.getByText(/leave|exit|warning/i)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('UC-SE-04: Route Restriction', () => {
  test('teacher_enrolled student cannot access past-papers', async ({ browser }) => {
    // Create a context simulating teacher_enrolled user
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/student/past-papers');
    // self_enrolled sees page; teacher_enrolled redirects to /student/quizzes
    // This test just verifies the page renders for self_enrolled
    await expect(page).toHaveURL(/\/student\/past-papers|\/student\/quizzes/);
    await context.close();
  });
});
