# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher\evaluation.spec.ts >> UC-TC-05: Teacher Evaluation — stubbed >> print button opens new tab
- Location: playwright\teacher\evaluation.spec.ts:82:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/extracted text|paste/i)

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e5]:
    - generic [ref=e10]:
      - generic [ref=e12]:
        - img "Zoomiez Fox" [ref=e14]
        - generic [ref=e15]:
          - heading "Zoomiez" [level=2] [ref=e16]
          - paragraph [ref=e17]: Powered By Zoomiez
      - list [ref=e20]:
        - listitem [ref=e21]:
          - link "Dashboard" [ref=e22] [cursor=pointer]:
            - /url: /teacher
            - img [ref=e23]
            - generic [ref=e28]: Dashboard
        - listitem [ref=e29]:
          - link "Students" [ref=e30] [cursor=pointer]:
            - /url: /teacher/students
            - img [ref=e31]
            - generic [ref=e36]: Students
        - listitem [ref=e37]:
          - link "Evaluation" [ref=e38] [cursor=pointer]:
            - /url: /teacher/evaluation
            - img [ref=e39]
            - generic [ref=e43]: Evaluation
        - listitem [ref=e44]:
          - link "Notes" [ref=e45] [cursor=pointer]:
            - /url: /teacher/notes
            - img [ref=e46]
            - generic [ref=e48]: Notes
        - listitem [ref=e49]:
          - link "Quizzes" [ref=e50] [cursor=pointer]:
            - /url: /teacher/quizzes
            - img [ref=e51]
            - generic [ref=e61]: Quizzes
        - listitem [ref=e62]:
          - link "Schedule" [ref=e63] [cursor=pointer]:
            - /url: /teacher/schedule
            - img [ref=e64]
            - generic [ref=e66]: Schedule
        - listitem [ref=e67]:
          - link "Settings" [ref=e68] [cursor=pointer]:
            - /url: /teacher/settings
            - img [ref=e69]
            - generic [ref=e72]: Settings
      - generic [ref=e74]:
        - generic [ref=e75]:
          - img [ref=e76]
          - generic [ref=e79]: Pro Tip
        - paragraph [ref=e80]: Schedule quizzes for your students' weak topics to boost performance!
    - generic [ref=e81]:
      - banner [ref=e82]:
        - button "Toggle Sidebar" [ref=e84] [cursor=pointer]:
          - img
          - generic [ref=e85]: Toggle Sidebar
        - button "Switch to dark mode" [ref=e87] [cursor=pointer]:
          - img [ref=e88]
      - main [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e92]:
            - generic [ref=e93]:
              - heading "Evaluation Module" [level=1] [ref=e94]
              - paragraph [ref=e95]: Evaluate uploaded solved papers for selected students and keep a reusable history.
            - generic [ref=e96]:
              - img [ref=e97]
              - text: Teacher Side
          - generic [ref=e99]:
            - tablist [ref=e100]:
              - tab "New Evaluation" [selected] [ref=e101] [cursor=pointer]:
                - img [ref=e102]
                - text: New Evaluation
              - tab "Evaluation Report" [ref=e106] [cursor=pointer]:
                - img [ref=e107]
                - text: Evaluation Report
            - tabpanel "New Evaluation" [ref=e110]:
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - heading "New Evaluation" [level=3] [ref=e113]:
                    - img [ref=e114]
                    - text: New Evaluation
                  - paragraph [ref=e118]: Select student and a pre-made quiz, then upload solved script in PNG/PDF.
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - combobox [ref=e121]:
                      - option "Select student"
                      - option "Ahmed Khan (enrolled-student@example.com)" [selected]
                    - combobox [ref=e122]:
                      - option "Select pre-made quiz"
                      - option "Chemistry SQ 1 (SQ)" [selected]
                    - generic [ref=e123]: O-Level • Chemistry
                    - generic [ref=e124]: SQ • 3 questions
                  - generic [ref=e125]:
                    - generic [ref=e126]:
                      - text: Upload solved paper (PNG/PDF)
                      - button "Choose File" [ref=e127]
                    - generic [ref=e128]:
                      - text: Optional extracted text fallback
                      - textbox "Question statement ... Answer ..." [ref=e129]
                  - button "Run Evaluation" [ref=e130] [cursor=pointer]:
                    - img
                    - text: Run Evaluation
```

# Test source

```ts
  1   | /**
  2   |  * UC-TC-05: Teacher Evaluation
  3   |  * SENSITIVE routes stubbed: OpenAI GPT (submit), Mistral OCR (image path)
  4   |  */
  5   | 
  6   | import { test, expect } from '@playwright/test';
  7   | 
  8   | const API = process.env.API_BASE_URL ?? 'http://localhost:5000';
  9   | 
  10  | test.describe('UC-TC-05: Teacher Evaluation — stubbed', () => {
  11  |   test.beforeEach(async ({ page }) => {
  12  |     await page.route(`${API}/api/teacher/evaluations/options`, (r) =>
  13  |       r.fulfill({
  14  |         json: {
  15  |           students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan' }],
  16  |           quizzes: [{ _id: 'quiz-001', title: 'Chemistry SQ 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'sq', question_count: 3 }],
  17  |         },
  18  |       })
  19  |     );
  20  |     // SENSITIVE: OpenAI + (optional) Mistral — always stub
  21  |     await page.route(`${API}/api/teacher/evaluations/submit`, (r) =>
  22  |       r.fulfill({
  23  |         json: {
  24  |           submission_id: 'eval-001',
  25  |           student_email: 'enrolled-student@example.com',
  26  |           quiz_title: 'Chemistry SQ 1',
  27  |           total_marks_obtained: 14,
  28  |           total_marks_available: 20,
  29  |           percentage: 70,
  30  |           evaluations: [
  31  |             { root_question_id: 'q1', question_number: 1, part_label: 'a', marks_awarded: 2, marks_total: 2, is_correct: true, feedback: 'Correct.' },
  32  |             { root_question_id: 'q1', question_number: 1, part_label: 'b', marks_awarded: 2, marks_total: 4, is_correct: false, feedback: 'Partial.', mistake: 'Omitted discharge potential.', improve: 'Review section 4.' },
  33  |           ],
  34  |         },
  35  |       })
  36  |     );
  37  |     await page.route(`${API}/api/teacher/evaluations/history/*`, (r) =>
  38  |       r.fulfill({
  39  |         json: [{ submission_id: 'eval-001', quiz_title: 'Chemistry SQ 1', subject: 'Chemistry', level: 'O-Level', evaluation_type: 'sq', total_marks_obtained: 14, total_marks_available: 20, percentage: 70 }],
  40  |       })
  41  |     );
  42  |     await page.route(`${API}/api/teacher/evaluations/report/*`, (r) =>
  43  |       r.fulfill({ json: { submission_id: 'eval-001', evaluations: [], total_marks_obtained: 14, total_marks_available: 20 } })
  44  |     );
  45  |   });
  46  | 
  47  |   test('evaluation page loads with student and quiz selects', async ({ page }) => {
  48  |     await page.goto('/teacher/evaluation');
  49  |     await expect(page.getByText(/evaluation module/i)).toBeVisible({ timeout: 8_000 });
  50  |     await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 5_000 });
  51  |   });
  52  | 
  53  |   test('submit text evaluation returns report (OpenAI stubbed)', async ({ page }) => {
  54  |     await page.goto('/teacher/evaluation');
  55  |     // Select student
  56  |     await page.locator('select').first().selectOption('enrolled-student@example.com');
  57  |     // Select quiz
  58  |     await page.locator('select').nth(1).selectOption('quiz-001');
  59  |     // Paste extracted text
  60  |     await page.getByPlaceholder(/extracted text|paste/i).fill('Q1a) Cathode: Hydrogen. Anode: Chlorine. Q1b) Because Cl- is more concentrated.');
  61  |     // Submit
  62  |     await page.getByRole('button', { name: /run evaluation/i }).click();
  63  |     // Report tab should appear
  64  |     await expect(page.getByText(/Evaluation Report/i)).toBeVisible({ timeout: 15_000 });
  65  |     await expect(page.getByText(/14.*20|70%/i)).toBeVisible({ timeout: 5_000 });
  66  |   });
  67  | 
  68  |   test('no student selected shows validation error', async ({ page }) => {
  69  |     await page.goto('/teacher/evaluation');
  70  |     await page.getByRole('button', { name: /run evaluation/i }).click();
  71  |     await expect(page.getByText(/select student/i)).toBeVisible({ timeout: 5_000 });
  72  |   });
  73  | 
  74  |   test('no input (no file, no text) shows validation error', async ({ page }) => {
  75  |     await page.goto('/teacher/evaluation');
  76  |     await page.locator('select').first().selectOption('enrolled-student@example.com');
  77  |     await page.locator('select').nth(1).selectOption('quiz-001');
  78  |     await page.getByRole('button', { name: /run evaluation/i }).click();
  79  |     await expect(page.getByText(/upload.*paste|file or text/i)).toBeVisible({ timeout: 5_000 });
  80  |   });
  81  | 
  82  |   test('print button opens new tab', async ({ page, context }) => {
  83  |     await page.goto('/teacher/evaluation');
  84  |     await page.locator('select').first().selectOption('enrolled-student@example.com');
  85  |     await page.locator('select').nth(1).selectOption('quiz-001');
> 86  |     await page.getByPlaceholder(/extracted text|paste/i).fill('Some answer text.');
      |                                                          ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  87  |     await page.getByRole('button', { name: /run evaluation/i }).click();
  88  |     await expect(page.getByText(/Evaluation Report/i)).toBeVisible({ timeout: 15_000 });
  89  | 
  90  |     // Switch to report tab
  91  |     await page.getByRole('tab', { name: /evaluation report/i }).click();
  92  | 
  93  |     const [newPage] = await Promise.all([
  94  |       context.waitForEvent('page'),
  95  |       page.getByRole('button', { name: /print.*pdf/i }).click(),
  96  |     ]);
  97  |     await newPage.waitForLoadState();
  98  |     await expect(newPage.url()).toContain('/teacher/evaluation/print');
  99  |     await newPage.close();
  100 |   });
  101 | });
  102 | 
  103 | test.describe('UC-TC-04: Quiz Management', () => {
  104 |   test.beforeEach(async ({ page }) => {
  105 |     await page.route(`${API}/api/teacher-quiz/my-quizzes`, (r) =>
  106 |       r.fulfill({
  107 |         json: [
  108 |           { _id: 'quiz-001', title: 'Chemistry MCQ 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'mcq', question_count: 20, status: 'active' },
  109 |         ],
  110 |       })
  111 |     );
  112 |     await page.route(`${API}/api/teacher-quiz/subjects/*`, (r) =>
  113 |       r.fulfill({ json: { subjects: ['Chemistry', 'Physics', 'Biology'] } })
  114 |     );
  115 |     await page.route(`${API}/api/teacher-quiz/save`, (r) =>
  116 |       r.fulfill({ json: { quiz_id: 'new-quiz', message: 'Quiz saved' } })
  117 |     );
  118 |   });
  119 | 
  120 |   test('quiz list renders', async ({ page }) => {
  121 |     await page.goto('/teacher/quizzes');
  122 |     await expect(page.getByText(/Chemistry MCQ 1/i)).toBeVisible({ timeout: 8_000 });
  123 |   });
  124 | 
  125 |   test('print quiz opens new tab with light background', async ({ page, context }) => {
  126 |     await page.goto('/teacher/quizzes');
  127 |     await expect(page.getByText(/Chemistry MCQ 1/i)).toBeVisible({ timeout: 8_000 });
  128 |     const printBtn = page.getByRole('button', { name: /print/i }).first();
  129 |     if (await printBtn.isVisible()) {
  130 |       const [printPage] = await Promise.all([
  131 |         context.waitForEvent('page'),
  132 |         printBtn.click(),
  133 |       ]);
  134 |       await printPage.waitForLoadState();
  135 |       await expect(printPage.url()).toContain('/teacher/quizzes/print');
  136 |       // Verify light background (masthead background should be f8fafc not dark)
  137 |       const bgColor = await printPage.evaluate(() => {
  138 |         const el = document.querySelector('[data-testid="quiz-print-masthead"]');
  139 |         if (!el) return '';
  140 |         return getComputedStyle(el).backgroundColor;
  141 |       });
  142 |       // Should not be dark background
  143 |       expect(bgColor).not.toBe('rgb(30, 41, 59)'); // #1e293b
  144 |       await printPage.close();
  145 |     }
  146 |   });
  147 | });
  148 | 
```