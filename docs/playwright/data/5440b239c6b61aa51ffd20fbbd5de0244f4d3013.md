# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-teacher-enrolled\quizzes.spec.ts >> UC-TE-04: Evaluation Report >> print button is visible on screen
- Location: playwright\student-teacher-enrolled\quizzes.spec.ts:177:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /print|save pdf/i })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('button', { name: /print|save pdf/i })

```

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- navigation:
  - img "Zoomiez Fox"
  - text: Zoomiez
  - link "Home":
    - /url: /student/dashboard
    - img
    - text: Home
  - link "Quizzes":
    - /url: /student/quizzes
    - img
    - text: Quizzes
  - link "Results":
    - /url: /student/results
    - img
    - text: Results
  - link "Notes":
    - /url: /student/notes
    - img
    - text: Notes
  - link "Paper Notes":
    - /url: /student/paper-notes
    - img
    - text: Paper Notes
  - link "Analytics":
    - /url: /student/analytics
    - img
    - text: Analytics
  - link "Flashcards":
    - /url: /student/flashcards
    - img
    - text: Flashcards
  - link "Profile":
    - /url: /student/profile
    - img
    - text: Profile
  - button "Switch to dark mode":
    - img
    - text: Dark
- main:
  - button "Back to Results":
    - img
    - text: Back to Results
  - text: No evaluation data found.
```

# Test source

```ts
  79  |   });
  80  | });
  81  | 
  82  | test.describe('UC-TE-03: View Quiz Results', () => {
  83  |   test.beforeEach(async ({ page }) => {
  84  |     await page.route(`${API}/api/student-quiz/results`, (r) =>
  85  |       r.fulfill({
  86  |         json: [
  87  |           {
  88  |             submission_id: 'eval-001',
  89  |             quiz_title: 'Chemistry SQ 1',
  90  |             score: 14,
  91  |             total: 20,
  92  |             percentage: 70,
  93  |             date: '2024-03-15',
  94  |           },
  95  |         ],
  96  |       })
  97  |     );
  98  |   });
  99  | 
  100 |   test('results page shows submission list', async ({ page }) => {
  101 |     await page.goto('/student/results');
  102 |     await expect(page.getByText(/Chemistry SQ 1/i)).toBeVisible({ timeout: 8_000 });
  103 |     await expect(page.getByText(/70%|14.*20/i)).toBeVisible();
  104 |   });
  105 | 
  106 |   test('self_enrolled cannot access /student/results', async ({ browser }) => {
  107 |     // Simulate a self_enrolled user context
  108 |     const context = await browser.newContext();
  109 |     const page = await context.newPage();
  110 |     // Inject self_enrolled state
  111 |     await page.goto('/');
  112 |     await page.evaluate(() => {
  113 |       localStorage.setItem('app_state', JSON.stringify({
  114 |         auth: { token: 'test-token', user: { email: 'self@example.com', role: 'student', student_type: 'self_enrolled', onboarding_completed: true } }
  115 |       }));
  116 |     });
  117 |     await page.goto('/student/results');
  118 |     await expect(page).toHaveURL(/\/student\/quizzes/, { timeout: 8_000 });
  119 |     await context.close();
  120 |   });
  121 | });
  122 | 
  123 | test.describe('UC-TE-04: Evaluation Report', () => {
  124 |   test.beforeEach(async ({ page }) => {
  125 |     await page.route(`${API}/api/student-quiz/evaluations/report/eval-001`, (r) =>
  126 |       r.fulfill({
  127 |         json: {
  128 |           submission_id: 'eval-001',
  129 |           student_email: 'enrolled-student@example.com',
  130 |           quiz_title: 'Chemistry SQ 1',
  131 |           subject: 'Chemistry',
  132 |           total_marks_obtained: 14,
  133 |           total_marks_available: 20,
  134 |           percentage: 70,
  135 |           evaluations: [
  136 |             {
  137 |               root_question_id: 'q1',
  138 |               question_number: 1,
  139 |               part_label: 'a',
  140 |               marks_awarded: 2,
  141 |               marks_total: 2,
  142 |               is_correct: true,
  143 |               feedback: 'Correct.',
  144 |               mistake: null,
  145 |               improve: null,
  146 |             },
  147 |             {
  148 |               root_question_id: 'q1',
  149 |               question_number: 1,
  150 |               part_label: 'b',
  151 |               marks_awarded: 2,
  152 |               marks_total: 4,
  153 |               is_correct: false,
  154 |               feedback: 'Partial credit.',
  155 |               mistake: 'Missed discharge potential.',
  156 |               improve: 'Review selective discharge rules.',
  157 |             },
  158 |           ],
  159 |         },
  160 |       })
  161 |     );
  162 |   });
  163 | 
  164 |   test('evaluation report renders masthead + questions', async ({ page }) => {
  165 |     await page.goto('/student/results/eval-001');
  166 |     await expect(page.getByText(/Chemistry SQ 1/i)).toBeVisible({ timeout: 8_000 });
  167 |     await expect(page.getByText(/14.*20|70%/i)).toBeVisible();
  168 |     await expect(page.getByText(/Question 1/i)).toBeVisible();
  169 |   });
  170 | 
  171 |   test('partial answer shows insight blocks', async ({ page }) => {
  172 |     await page.goto('/student/results/eval-001');
  173 |     await expect(page.getByText(/Missed discharge potential/i)).toBeVisible({ timeout: 8_000 });
  174 |     await expect(page.getByText(/Review selective discharge/i)).toBeVisible();
  175 |   });
  176 | 
  177 |   test('print button is visible on screen', async ({ page }) => {
  178 |     await page.goto('/student/results/eval-001');
> 179 |     await expect(page.getByRole('button', { name: /print|save pdf/i })).toBeVisible({ timeout: 8_000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  180 |   });
  181 | });
  182 | 
```