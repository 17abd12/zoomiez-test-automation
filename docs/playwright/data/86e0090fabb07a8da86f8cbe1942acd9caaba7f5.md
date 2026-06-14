# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-self-enrolled\analytics.spec.ts >> UC-SE-08: Analytics >> empty analytics for new student shows no crash
- Location: playwright\student-self-enrolled\analytics.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/no data|start practicing/i)
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText(/no data|start practicing/i)

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
  - link "Past Papers":
    - /url: /student/past-papers
    - img
    - text: Past Papers
  - link "Topical":
    - /url: /student/topical
    - img
    - text: Topical
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
- img
- paragraph: Analyzing your recent activity...
- paragraph: This may take some time as we analyze your complete practice history.
```

# Test source

```ts
  1   | /**
  2   |  * UC-SE-08: Analytics
  3   |  * UC-SE-09: Notes browse + bookmark
  4   |  * UC-SE-11: Flashcards
  5   |  */
  6   | 
  7   | import { test, expect } from '@playwright/test';
  8   | 
  9   | const API = process.env.API_BASE_URL ?? 'http://localhost:5000';
  10  | 
  11  | test.describe('UC-SE-08: Analytics', () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  |     // Analytics endpoint is /analytics (no /api/ prefix) — uses fetch directly, not apiClient
  14  |     await page.route(`${API}/analytics`, (r) =>
  15  |       r.fulfill({
  16  |         json: {
  17  |           subjects: [{ name: 'Chemistry', avg_score: 72 }],
  18  |           topic_breakdown: [{ topic: 'Bonding', percentage: 68 }],
  19  |           recommendations: ['Review electrolysis'],
  20  |         },
  21  |       })
  22  |     );
  23  |   });
  24  | 
  25  |   test('analytics page renders charts and recommendations', async ({ page }) => {
  26  |     await page.goto('/student/analytics');
  27  |     await expect(page.getByText(/analytics/i)).toBeVisible({ timeout: 8_000 });
  28  |     await expect(page.getByText(/chemistry/i).first()).toBeVisible({ timeout: 5_000 });
  29  |   });
  30  | 
  31  |   test('empty analytics for new student shows no crash', async ({ page }) => {
  32  |     await page.route(`${API}/analytics`, (r) =>
  33  |       r.fulfill({ json: { subjects: [], topic_breakdown: [], recommendations: [] } })
  34  |     );
  35  |     await page.goto('/student/analytics');
> 36  |     await expect(page.getByText(/no data|start practicing/i)).toBeVisible({ timeout: 8_000 });
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  37  |   });
  38  | });
  39  | 
  40  | test.describe('UC-SE-09: Notes — Browse & Bookmark', () => {
  41  |   test.beforeEach(async ({ page }) => {
  42  |     // Use RegExp — glob ** may not reliably match query strings in Playwright
  43  |     await page.route(/\/notes\/student\/notes/, (r) =>
  44  |       r.fulfill({
  45  |         json: {
  46  |           notes: [
  47  |             { _id: 'note-001', topic: 'Electrolysis Notes', subject: 'Chemistry', class_level: 'O-Level', download_count: 12 },
  48  |             { _id: 'note-002', topic: 'Bonding PDF', subject: 'Chemistry', class_level: 'O-Level', download_count: 5 },
  49  |           ],
  50  |           total: 2,
  51  |         },
  52  |       })
  53  |     );
  54  |     await page.route(`${API}/api/bookmarks`, (r) => r.fulfill({ json: { bookmarks: [] } }));
  55  |     await page.route(`${API}/api/bookmarks/note-001`, (r) => r.fulfill({ json: { message: 'Bookmarked' } }));
  56  |   });
  57  | 
  58  |   test('notes list renders', async ({ page }) => {
  59  |     await page.goto('/student/notes');
  60  |     await expect(page.getByText(/Electrolysis Notes/i)).toBeVisible({ timeout: 8_000 });
  61  |     await expect(page.getByText(/Bonding PDF/i)).toBeVisible();
  62  |   });
  63  | 
  64  |   test('bookmark icon is clickable', async ({ page }) => {
  65  |     await page.goto('/student/notes');
  66  |     await expect(page.getByText(/Electrolysis Notes/i)).toBeVisible({ timeout: 8_000 });
  67  |     // Find and click bookmark button for first note
  68  |     const bookmarkBtn = page.locator('[data-testid="bookmark-note-001"], button[aria-label*="bookmark"]').first();
  69  |     if (await bookmarkBtn.isVisible()) {
  70  |       await bookmarkBtn.click();
  71  |       // Expect API call was made — route.fulfill above
  72  |     }
  73  |   });
  74  | 
  75  |   test('empty state shows message', async ({ page }) => {
  76  |     await page.route(/\/notes\/student\/notes/, (r) =>
  77  |       r.fulfill({ json: { notes: [], total: 0 } })
  78  |     );
  79  |     await page.goto('/student/notes');
  80  |     await expect(page.getByText(/no notes|nothing here/i)).toBeVisible({ timeout: 8_000 });
  81  |   });
  82  | });
  83  | 
  84  | test.describe('UC-SE-11: Flashcards', () => {
  85  |   test.beforeEach(async ({ page }) => {
  86  |     await page.route(`${API}/api/flashcards/subjects`, (r) =>
  87  |       r.fulfill({ json: { 'O-Level': ['Chemistry', 'Physics'] } })
  88  |     );
  89  |     // Flashcards cards endpoint always has ?level=&subject= query params
  90  |     await page.route(`${API}/api/flashcards/cards**`, (r) =>
  91  |       r.fulfill({
  92  |         json: {
  93  |           cards: [
  94  |             { front: 'What is ionic bonding?', back: 'Transfer of electrons between atoms forming ions.' },
  95  |             { front: 'What is covalent bonding?', back: 'Sharing of electron pairs between atoms.' },
  96  |           ],
  97  |         },
  98  |       })
  99  |     );
  100 |   });
  101 | 
  102 |   test('flashcard deck loads', async ({ page }) => {
  103 |     await page.goto('/student/flashcards');
  104 |     await expect(page.getByText(/flashcard/i).first()).toBeVisible({ timeout: 8_000 });
  105 |   });
  106 | });
  107 | 
```