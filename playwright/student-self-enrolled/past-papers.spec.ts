/**
 * UC-SE-03 Past Papers + UC-SE-04 MCQ Practice
 * Runs as self-enrolled student (storageState injected by auth.setup.ts)
 *
 * PaperPracticePage restores quiz state from localStorage on mount.
 * We pre-inject 'paper_practice_quiz_state' + 'active_quiz_state' so the
 * component loads pre-set questions when we navigate to the /attempt URL.
 * McqPracticeCardV2 uses question.statement (not question_text) and question.Answer (capital A).
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PW_BASE_URL ?? 'http://localhost:8080';
const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// Inject localStorage state needed by PaperPracticePage and QuizLockContext.
// Must be called after a page.goto() so the browser context is established.
async function injectMcqPaperState(page: any) {
  await page.evaluate(() => {
    const paperState = {
      selectedLevel: 'O-Level',
      selectedSubject: 'Chemistry',
      selectedType: 'mcq',
      selectedVariant: null,
      selectedFile: 'chem-2023-mj-p1.json',
      loadedPaper: {
        filename: 'chem-2023-mj-p1.json',
        subject: 'Chemistry',
        level: 'O-Level',
        type: 'mcq',
        // McqPracticeCardV2 reads question.statement and question.Answer (capital A)
        questions: [
          { question_number: 1, statement: 'Which element has atomic number 6?', options: { A: 'N', B: 'C', C: 'O', D: 'B' }, Answer: 'B' },
          { question_number: 2, statement: 'Bond between Na and Cl?', options: { A: 'Covalent', B: 'Metallic', C: 'Ionic', D: 'H-bond' }, Answer: 'C' },
        ],
        metadata: { year: '2023', session: 'May/June' },
      },
      currentQuestionIndex: 0,
      startTime: Date.now(),
    };
    localStorage.setItem('paper_practice_quiz_state', JSON.stringify(paperState));

    // QuizLockContext reads 'active_quiz_state' on mount to restore isQuizActive = true
    const quizLockState = {
      id: 'paper-test-001',
      type: 'mcq',
      level: 'O-Level',
      subject: 'Chemistry',
      paperId: 'chem-2023-mj-p1.json',
      startedAt: new Date().toISOString(),
      mcqAnswers: [],
      sqAnswers: [],
      totalMcqs: 2,
      totalSqs: 0,
      timeRemaining: 2700,
      totalTime: 2700,
      isSubmitted: false,
    };
    localStorage.setItem('active_quiz_state', JSON.stringify(quizLockState));
  });
}

test.describe('UC-SE-03: Past Papers — Browse', () => {
  test('browse page renders subject cards', async ({ page }) => {
    await page.goto('/student/past-papers');
    // Page has both <h1>Past Papers</h1> and <h2>Why Practice with Past Papers?</h2> — use first()
    await expect(page.getByRole('heading', { name: /past papers/i }).first()).toBeVisible();
    await expect(page.getByText(/chemistry/i).first()).toBeVisible();
  });

  test('click MCQ variant navigates to practice page', async ({ page }) => {
    await page.goto('/student/past-papers');
    const chemCard = page.getByText(/chemistry/i).first();
    await chemCard.click();
    await expect(page.getByText(/mcq|paper 1|o-level/i).first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('UC-SE-04: Paper Practice — MCQ', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the submit endpoint (uses fetch directly, not apiClient — no processResponse wrap)
    await page.route(`${API}/api/papers/submit`, (r) =>
      r.fulfill({ json: { success: true, data: { submission_id: 'sub-001', score: 1, total: 2, percentage: 50 } } })
    );
    // Navigate to any student page first to establish browser context, then inject state
    await page.goto('/student/past-papers');
    await injectMcqPaperState(page);
  });

  test('paper loads with questions', async ({ page }) => {
    // o-level slug matches selectedLevel 'O-Level' after toLowerCase + replace(/-/g,' ')
    await page.goto('/student/papers/practice/o-level/chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  });

  test('selecting answer highlights choice', async ({ page }) => {
    await page.goto('/student/papers/practice/o-level/chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    // RadioGroupItem renders with role="radio" — click first option
    await page.getByRole('radio').first().click();
    // Option should now be selected — radio becomes checked
    await expect(page.getByRole('radio').first()).toBeChecked();
  });

  test('submit shows score result', async ({ page }) => {
    await page.goto('/student/papers/practice/o-level/chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    // Must select at least one answer before submit is allowed
    await page.getByRole('radio').first().click();
    // Submit
    await page.getByRole('button', { name: /submit/i }).click();
    // Results card shows "Your Results" header
    await expect(page.getByText(/Your Results/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/\d+%/)).toBeVisible();
  });

  test('navigate away during attempt shows exit dialog', async ({ page }) => {
    await page.goto('/student/papers/practice/o-level/chemistry/mcq/attempt');
    await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
    // "Exit Quiz" button calls attemptNavigation → sets showExitWarning → shows AlertDialog
    await page.getByRole('button', { name: /exit quiz/i }).click();
    // AlertDialog appears with role="alertdialog" — avoids strict mode from button+heading+action matches
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('UC-SE-04: Route Restriction', () => {
  test('unauthenticated user cannot access past-papers', async ({ page }) => {
    // Navigate home, remove auth state, then try protected route
    await page.goto(BASE);
    await page.evaluate(() => localStorage.removeItem('app_state'));
    // Redux reinitializes with empty state on next load → isLoggedIn:false → ProtectedRoute redirects
    await page.goto('/student/past-papers');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
