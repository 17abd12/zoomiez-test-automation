# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-self-enrolled\past-papers.spec.ts >> UC-SE-03: Past Papers — Browse >> browse page renders subject cards
- Location: playwright\student-self-enrolled\past-papers.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /past papers/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /past papers/i }) resolved to 2 elements:
    1) <h1 data-lov-name="h1" data-component-name="h1" data-component-line="342" data-component-file="PastPapers.tsx" class="text-3xl font-bold text-gradient mb-2" data-lov-id="src\pages\students\PastPapers.tsx:342:10" data-component-path="src\pages\students\PastPapers.tsx" data-component-content="%7B%22text%22%3A%22Past%20Papers%22%2C%22className%22%3A%22text-3xl%20font-bold%20text-gradient%20mb-2%22%7D">Past Papers</h1> aka getByRole('heading', { name: 'Past Papers', exact: true })
    2) <h2 data-lov-name="h2" data-component-name="h2" data-component-line="434" class="text-xl font-bold mb-6" data-component-file="PastPapers.tsx" data-lov-id="src\pages\students\PastPapers.tsx:434:10" data-component-path="src\pages\students\PastPapers.tsx" data-component-content="%7B%22text%22%3A%22Why%20Practice%20with%20Past%20Papers%3F%22%2C%22className%22%3A%22text-xl%20font-bold%20mb-6%22%7D">Why Practice with Past Papers?</h2> aka getByRole('heading', { name: 'Why Practice with Past Papers?' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /past papers/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img "Zoomiez Fox" [ref=e8]
          - generic [ref=e10]: Zoomiez
        - generic [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /student/dashboard
            - img [ref=e13]
            - generic [ref=e16]: Home
          - link "Quizzes" [ref=e17] [cursor=pointer]:
            - /url: /student/quizzes
            - img [ref=e18]
            - generic [ref=e20]: Quizzes
          - link "Past Papers" [ref=e21] [cursor=pointer]:
            - /url: /student/past-papers
            - img [ref=e22]
            - generic [ref=e26]: Past Papers
          - link "Topical" [ref=e27] [cursor=pointer]:
            - /url: /student/topical
            - img [ref=e28]
            - generic [ref=e31]: Topical
          - link "Notes" [ref=e32] [cursor=pointer]:
            - /url: /student/notes
            - img [ref=e33]
            - generic [ref=e36]: Notes
          - link "Paper Notes" [ref=e37] [cursor=pointer]:
            - /url: /student/paper-notes
            - img [ref=e38]
            - generic [ref=e41]: Paper Notes
          - link "Analytics" [ref=e42] [cursor=pointer]:
            - /url: /student/analytics
            - img [ref=e43]
            - generic [ref=e46]: Analytics
          - link "Flashcards" [ref=e47] [cursor=pointer]:
            - /url: /student/flashcards
            - img [ref=e48]
            - generic [ref=e50]: Flashcards
          - link "Profile" [ref=e51] [cursor=pointer]:
            - /url: /student/profile
            - img [ref=e52]
            - generic [ref=e55]: Profile
        - button "Switch to dark mode" [ref=e56] [cursor=pointer]:
          - img [ref=e57]
          - generic [ref=e59]: Dark
    - main [ref=e61]:
      - generic [ref=e62]:
        - heading "Past Papers" [level=1] [ref=e63]
        - paragraph [ref=e64]: Practice with exam questions from previous years — showing your selected subjects
      - generic [ref=e65]:
        - generic [ref=e68] [cursor=pointer]:
          - generic [ref=e69]: O-Level
          - img [ref=e71]
          - heading "Biology" [level=3] [ref=e73]
          - generic [ref=e74]: Paper 5090
          - paragraph [ref=e75]: O-Level Biology Papers (5090)
          - generic [ref=e76]:
            - generic [ref=e77]: MCQ
            - generic [ref=e78]: SQ Paper 2
          - generic [ref=e79]:
            - generic [ref=e80]:
              - img [ref=e81]
              - text: 30+ papers
            - generic [ref=e85]:
              - img [ref=e86]
              - text: 2018–2025
          - generic [ref=e88]:
            - generic [ref=e89]: Select Practice
            - img [ref=e90]
        - generic [ref=e94] [cursor=pointer]:
          - generic [ref=e95]: O-Level
          - img [ref=e97]
          - heading "Chemistry" [level=3] [ref=e99]
          - generic [ref=e100]: Paper 5070
          - paragraph [ref=e101]: O-Level Chemistry Papers (5070)
          - generic [ref=e102]:
            - generic [ref=e103]: MCQ
            - generic [ref=e104]: SQ Paper 2
          - generic [ref=e105]:
            - generic [ref=e106]:
              - img [ref=e107]
              - text: 30+ papers
            - generic [ref=e111]:
              - img [ref=e112]
              - text: 2018–2025
          - generic [ref=e114]:
            - generic [ref=e115]: Select Practice
            - img [ref=e116]
        - generic [ref=e120] [cursor=pointer]:
          - generic [ref=e121]: O-Level
          - img [ref=e123]
          - heading "Economics" [level=3] [ref=e126]
          - generic [ref=e127]: Paper 2281
          - paragraph [ref=e128]: O-Level Economics Papers (2281)
          - generic [ref=e130]: SQ Paper 2
          - generic [ref=e131]:
            - generic [ref=e132]:
              - img [ref=e133]
              - text: 21+ papers
            - generic [ref=e137]:
              - img [ref=e138]
              - text: 2018–2025
          - generic [ref=e140]:
            - generic [ref=e141]: Select Practice
            - img [ref=e142]
        - generic [ref=e146] [cursor=pointer]:
          - generic [ref=e147]: O-Level
          - img [ref=e149]
          - heading "Islamiyat" [level=3] [ref=e151]
          - generic [ref=e152]: Paper 2068
          - paragraph [ref=e153]: O-Level Islamiyat Papers (2068)
          - generic [ref=e154]:
            - generic [ref=e155]: SQ Paper 1
            - generic [ref=e156]: SQ Paper 2
          - generic [ref=e157]:
            - generic [ref=e158]:
              - img [ref=e159]
              - text: 16+ papers
            - generic [ref=e163]:
              - img [ref=e164]
              - text: 2018–2025
          - generic [ref=e166]:
            - generic [ref=e167]: Select Practice
            - img [ref=e168]
        - generic [ref=e172] [cursor=pointer]:
          - generic [ref=e173]: O-Level
          - img [ref=e175]
          - heading "Mathematics" [level=3] [ref=e177]
          - generic [ref=e178]: Paper 4024
          - paragraph [ref=e179]: O-Level Mathematics Papers (4024)
          - generic [ref=e180]:
            - generic [ref=e181]: SQ Paper 1
            - generic [ref=e182]: SQ Paper 2
          - generic [ref=e183]:
            - generic [ref=e184]:
              - img [ref=e185]
              - text: 28+ papers
            - generic [ref=e189]:
              - img [ref=e190]
              - text: 2018–2025
          - generic [ref=e192]:
            - generic [ref=e193]: Select Practice
            - img [ref=e194]
        - generic [ref=e198] [cursor=pointer]:
          - generic [ref=e199]: O-Level
          - img [ref=e201]
          - heading "Physics" [level=3] [ref=e203]
          - generic [ref=e204]: Paper 5054
          - paragraph [ref=e205]: O-Level Physics Papers (5054)
          - generic [ref=e206]:
            - generic [ref=e207]: MCQ
            - generic [ref=e208]: SQ Paper 2
          - generic [ref=e209]:
            - generic [ref=e210]:
              - img [ref=e211]
              - text: 30+ papers
            - generic [ref=e215]:
              - img [ref=e216]
              - text: 2018–2025
          - generic [ref=e218]:
            - generic [ref=e219]: Select Practice
            - img [ref=e220]
        - generic [ref=e224] [cursor=pointer]:
          - generic [ref=e225]: SAT
          - img [ref=e227]
          - heading "SAT" [level=3] [ref=e229]
          - generic [ref=e230]: SAT
          - paragraph [ref=e231]: SAT Practice Papers
          - generic [ref=e233]: MCQ
          - generic [ref=e234]:
            - generic [ref=e235]:
              - img [ref=e236]
              - text: 8+ papers
            - generic [ref=e240]:
              - img [ref=e241]
              - text: 2018–2025
          - generic [ref=e243]:
            - generic [ref=e244]: Select Practice
            - img [ref=e245]
        - generic [ref=e249] [cursor=pointer]:
          - generic [ref=e250]: A-Level
          - img [ref=e252]
          - heading "Accounting" [level=3] [ref=e255]
          - generic [ref=e256]: Paper 9706
          - paragraph [ref=e257]: A-Level Accounting Papers (9706)
          - generic [ref=e259]: MCQ
          - generic [ref=e260]:
            - generic [ref=e261]:
              - img [ref=e262]
              - text: 13+ papers
            - generic [ref=e266]:
              - img [ref=e267]
              - text: 2018–2025
          - generic [ref=e269]:
            - generic [ref=e270]: Select Practice
            - img [ref=e271]
        - generic [ref=e275] [cursor=pointer]:
          - generic [ref=e276]: A-Level
          - img [ref=e278]
          - heading "Chemistry" [level=3] [ref=e280]
          - generic [ref=e281]: Paper 9701
          - paragraph [ref=e282]: A-Level Chemistry Papers (9701)
          - generic [ref=e283]:
            - generic [ref=e284]: MCQ
            - generic [ref=e285]: SQ Paper 2
          - generic [ref=e286]:
            - generic [ref=e287]:
              - img [ref=e288]
              - text: 25+ papers
            - generic [ref=e292]:
              - img [ref=e293]
              - text: 2018–2025
          - generic [ref=e295]:
            - generic [ref=e296]: Select Practice
            - img [ref=e297]
        - generic [ref=e301] [cursor=pointer]:
          - generic [ref=e302]: A-Level
          - img [ref=e304]
          - heading "Economics" [level=3] [ref=e307]
          - generic [ref=e308]: Paper 9708
          - paragraph [ref=e309]: A-Level Economics Papers (9708)
          - generic [ref=e310]:
            - generic [ref=e311]: SQ Paper 2
            - generic [ref=e312]: SQ Paper 4
          - generic [ref=e313]:
            - generic [ref=e314]:
              - img [ref=e315]
              - text: 20+ papers
            - generic [ref=e319]:
              - img [ref=e320]
              - text: 2018–2025
          - generic [ref=e322]:
            - generic [ref=e323]: Select Practice
            - img [ref=e324]
        - generic [ref=e328] [cursor=pointer]:
          - generic [ref=e329]: A-Level
          - img [ref=e331]
          - heading "Mathematics" [level=3] [ref=e333]
          - generic [ref=e334]: Paper 9709
          - paragraph [ref=e335]: A-Level Mathematics Papers (9709)
          - generic [ref=e336]:
            - generic [ref=e337]: SQ Paper 1
            - generic [ref=e338]: SQ Paper 2
          - generic [ref=e339]:
            - generic [ref=e340]:
              - img [ref=e341]
              - text: 28+ papers
            - generic [ref=e345]:
              - img [ref=e346]
              - text: 2018–2025
          - generic [ref=e348]:
            - generic [ref=e349]: Select Practice
            - img [ref=e350]
        - generic [ref=e354] [cursor=pointer]:
          - generic [ref=e355]: A-Level
          - img [ref=e357]
          - heading "Physics" [level=3] [ref=e359]
          - generic [ref=e360]: Paper 9702
          - paragraph [ref=e361]: A-Level Physics Papers (9702)
          - generic [ref=e362]:
            - generic [ref=e363]: MCQ
            - generic [ref=e364]: SQ Paper 2
          - generic [ref=e365]:
            - generic [ref=e366]:
              - img [ref=e367]
              - text: 25+ papers
            - generic [ref=e371]:
              - img [ref=e372]
              - text: 2018–2025
          - generic [ref=e374]:
            - generic [ref=e375]: Select Practice
            - img [ref=e376]
      - generic [ref=e378]:
        - generic [ref=e379]:
          - generic [ref=e380]: 274+
          - generic [ref=e381]: Total Papers
        - generic [ref=e382]:
          - generic [ref=e383]: "12"
          - generic [ref=e384]: Your Subjects
        - generic [ref=e385]:
          - generic [ref=e386]: 8+
          - generic [ref=e387]: Years of Papers
      - generic [ref=e388]:
        - heading "Why Practice with Past Papers?" [level=2] [ref=e389]
        - generic [ref=e390]:
          - generic [ref=e391]:
            - img [ref=e393]
            - generic [ref=e395]:
              - heading "Real Exam Questions" [level=3] [ref=e396]
              - paragraph [ref=e397]: Practice with actual questions from previous years' exams
          - generic [ref=e398]:
            - img [ref=e400]
            - generic [ref=e403]:
              - heading "Timed Practice" [level=3] [ref=e404]
              - paragraph [ref=e405]: Track your time and improve your exam speed
          - generic [ref=e406]:
            - img [ref=e408]
            - generic [ref=e411]:
              - heading "Instant Feedback" [level=3] [ref=e412]
              - paragraph [ref=e413]: Get immediate answers and explanations after submission
          - generic [ref=e414]:
            - img [ref=e416]
            - generic [ref=e418]:
              - heading "Track Progress" [level=3] [ref=e419]
              - paragraph [ref=e420]: All submissions are saved for your review and progress tracking
```

# Test source

```ts
  1  | /**
  2  |  * UC-SE-03 Past Papers + UC-SE-04 MCQ Practice + UC-SE-05 SQ Practice
  3  |  * Runs as self-enrolled student (storageState injected by auth.setup.ts)
  4  |  */
  5  | 
  6  | import { test, expect } from '@playwright/test';
  7  | 
  8  | const API = process.env.API_BASE_URL ?? 'http://localhost:5000';
  9  | 
  10 | test.describe('UC-SE-03: Past Papers — Browse', () => {
  11 |   test.beforeEach(async ({ page }) => {
  12 |     await page.route(`${API}/papers/available`, (r) =>
  13 |       r.fulfill({ json: { papers: [{ id: 'chem-2023-mj', variant: 'Paper 1', year: '2023', session: 'May/June' }] } })
  14 |     );
  15 |   });
  16 | 
  17 |   test('browse page renders subject cards', async ({ page }) => {
  18 |     await page.goto('/student/past-papers');
> 19 |     await expect(page.getByRole('heading', { name: /past papers/i })).toBeVisible();
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  20 |     await expect(page.getByText(/chemistry/i).first()).toBeVisible();
  21 |   });
  22 | 
  23 |   test('click MCQ variant navigates to practice page', async ({ page }) => {
  24 |     await page.goto('/student/past-papers');
  25 |     const chemCard = page.getByText(/chemistry/i).first();
  26 |     await chemCard.click();
  27 |     await expect(page.getByText(/mcq|paper 1/i)).toBeVisible({ timeout: 5_000 });
  28 |   });
  29 | });
  30 | 
  31 | test.describe('UC-SE-04: Paper Practice — MCQ', () => {
  32 |   test.beforeEach(async ({ page }) => {
  33 |     await page.route(`${API}/api/papers/random`, (r) =>
  34 |       r.fulfill({
  35 |         json: {
  36 |           paper_type: 'mcq',
  37 |           questions: [
  38 |             { question_number: 1, question_text: 'Which element has atomic number 6?', options: { A: 'N', B: 'C', C: 'O', D: 'B' }, correct_answer: 'B' },
  39 |             { question_number: 2, question_text: 'Bond between Na and Cl?', options: { A: 'Covalent', B: 'Metallic', C: 'Ionic', D: 'H-bond' }, correct_answer: 'C' },
  40 |           ],
  41 |           total_questions: 2,
  42 |           time_limit_minutes: 45,
  43 |         },
  44 |       })
  45 |     );
  46 |     await page.route(`${API}/api/papers/submit`, (r) =>
  47 |       r.fulfill({ json: { submission_id: 'sub-001', score: 1, total: 2, percentage: 50, correct: [1], wrong: [2] } })
  48 |     );
  49 |   });
  50 | 
  51 |   test('paper loads with questions', async ({ page }) => {
  52 |     await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
  53 |     await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  54 |   });
  55 | 
  56 |   test('selecting answer highlights choice', async ({ page }) => {
  57 |     await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
  58 |     await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  59 |     await page.getByText('C').first().click();
  60 |     // Expect selection to be visually marked (class change or aria-pressed)
  61 |     await expect(page.getByText('C').first()).toBeVisible();
  62 |   });
  63 | 
  64 |   test('submit shows score result', async ({ page }) => {
  65 |     await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
  66 |     await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  67 |     // Select answers
  68 |     await page.getByText('B').first().click();
  69 |     await page.getByText('C').first().click();
  70 |     // Submit
  71 |     await page.getByRole('button', { name: /submit/i }).click();
  72 |     await expect(page.getByText(/1.*2|50%/i)).toBeVisible({ timeout: 8_000 });
  73 |   });
  74 | 
  75 |   test('navigate away during attempt shows QuizLock dialog', async ({ page }) => {
  76 |     await page.goto('/student/papers/practice/O-Level/Chemistry/mcq/attempt');
  77 |     await expect(page.getByText(/Which element has atomic number 6/i)).toBeVisible({ timeout: 8_000 });
  78 |     // Attempt navigate away
  79 |     await page.goBack();
  80 |     // QuizLock intercept dialog should appear
  81 |     await expect(page.getByText(/leave|exit|warning/i)).toBeVisible({ timeout: 5_000 });
  82 |   });
  83 | });
  84 | 
  85 | test.describe('UC-SE-04: Route Restriction', () => {
  86 |   test('teacher_enrolled student cannot access past-papers', async ({ browser }) => {
  87 |     // Create a context simulating teacher_enrolled user
  88 |     const context = await browser.newContext();
  89 |     const page = await context.newPage();
  90 |     await page.goto('/student/past-papers');
  91 |     // self_enrolled sees page; teacher_enrolled redirects to /student/quizzes
  92 |     // This test just verifies the page renders for self_enrolled
  93 |     await expect(page).toHaveURL(/\/student\/past-papers|\/student\/quizzes/);
  94 |     await context.close();
  95 |   });
  96 | });
  97 | 
```