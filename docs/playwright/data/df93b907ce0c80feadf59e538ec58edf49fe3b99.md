# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: institution\reports.spec.ts >> UC-IN-02: Teacher Management >> invite teacher (Resend stubbed)
- Location: playwright\institution\reports.spec.ts:149:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/email/i)

```

# Page snapshot

```yaml
- generic:
  - generic:
    - list
    - region "Notifications alt+T"
    - generic:
      - generic:
        - complementary:
          - generic:
            - generic:
              - img
            - generic:
              - generic: Zoomiez
              - generic: Powered By Zoomiez
          - navigation:
            - link:
              - /url: /institution/dashboard
              - img
              - generic: Dashboard
            - link:
              - /url: /institution/teachers
              - img
              - generic: Teacher Management
            - link:
              - /url: /institution/students
              - img
              - generic: Student Analytics
            - link:
              - /url: /institution/progress
              - img
              - generic: Teacher Progress
            - link:
              - /url: /institution/reports
              - img
              - generic: Reports
            - link:
              - /url: /institution/settings
              - img
              - generic: Settings
          - generic:
            - button:
              - img
        - generic:
          - banner:
            - generic:
              - button:
                - img
              - button:
                - generic:
                  - generic: IN
                - img
          - main:
            - generic:
              - generic:
                - generic:
                  - heading [level=1]: Teacher Management
                  - paragraph: Manage and onboard teachers across your academy.
                - generic:
                  - button: Show Stats
                  - button [expanded]:
                    - img
                    - text: Invite Teacher
              - generic:
                - generic: User not found
              - generic:
                - generic:
                  - generic:
                    - heading [level=3]: All Teachers
                    - generic:
                      - img
                      - textbox:
                        - /placeholder: Search teachers...
                - generic:
                  - generic:
                    - generic:
                      - table:
                        - rowgroup:
                          - row:
                            - columnheader: Name
                            - columnheader: Email
                            - columnheader: Subjects
                            - columnheader: Classes
                            - columnheader: Status
                            - columnheader
                        - rowgroup:
                          - row:
                            - cell: No teachers yet.
              - generic:
                - generic:
                  - heading [level=3]: Invited Teachers
                - generic:
                  - generic:
                    - generic:
                      - table:
                        - rowgroup:
                          - row:
                            - columnheader: Name
                            - columnheader: Email
                            - columnheader: Subjects
                            - columnheader: Status
                            - columnheader: Invited At
                            - columnheader: Expires
                            - columnheader: Action
                        - rowgroup:
                          - row:
                            - cell: No teacher invitations yet.
  - dialog "Invite Teacher" [ref=e2]:
    - generic [ref=e3]:
      - heading "Invite Teacher" [level=2] [ref=e4]
      - paragraph [ref=e5]: Add teacher details and assigned subjects. The teacher will receive temporary credentials by email.
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Teacher Name
        - textbox "e.g. Sarah Johnson" [active] [ref=e8]
      - generic [ref=e9]:
        - text: Email Address
        - textbox "teacher@example.com" [ref=e10]
      - generic [ref=e11]:
        - text: Subject(s)
        - generic [ref=e12]:
          - generic [ref=e13]:
            - paragraph [ref=e14]: A-Level
            - generic [ref=e15]:
              - generic [ref=e16] [cursor=pointer]:
                - checkbox "Accounting A-Level" [ref=e17]
                - generic [ref=e18]: Accounting A-Level
              - generic [ref=e19] [cursor=pointer]:
                - checkbox "Chemistry A-Level" [ref=e20]
                - generic [ref=e21]: Chemistry A-Level
              - generic [ref=e22] [cursor=pointer]:
                - checkbox "Economics A-Level" [ref=e23]
                - generic [ref=e24]: Economics A-Level
              - generic [ref=e25] [cursor=pointer]:
                - checkbox "Mathematics A-Level" [ref=e26]
                - generic [ref=e27]: Mathematics A-Level
              - generic [ref=e28] [cursor=pointer]:
                - checkbox "Physics A-Level" [ref=e29]
                - generic [ref=e30]: Physics A-Level
          - generic [ref=e31]:
            - paragraph [ref=e32]: O-Level
            - generic [ref=e33]:
              - generic [ref=e34] [cursor=pointer]:
                - checkbox "Biology" [ref=e35]
                - generic [ref=e36]: Biology
              - generic [ref=e37] [cursor=pointer]:
                - checkbox "Chemistry" [ref=e38]
                - generic [ref=e39]: Chemistry
              - generic [ref=e40] [cursor=pointer]:
                - checkbox "Physics" [ref=e41]
                - generic [ref=e42]: Physics
              - generic [ref=e43] [cursor=pointer]:
                - checkbox "Mathematics" [ref=e44]
                - generic [ref=e45]: Mathematics
              - generic [ref=e46] [cursor=pointer]:
                - checkbox "Economics" [ref=e47]
                - generic [ref=e48]: Economics
              - generic [ref=e49] [cursor=pointer]:
                - checkbox "Islamiyat" [ref=e50]
                - generic [ref=e51]: Islamiyat
          - generic [ref=e52]:
            - paragraph [ref=e53]: SAT
            - generic [ref=e55] [cursor=pointer]:
              - checkbox "SAT" [ref=e56]
              - generic [ref=e57]: SAT
    - generic [ref=e58]:
      - button "Cancel" [ref=e59] [cursor=pointer]
      - button "Send Invitation" [ref=e60] [cursor=pointer]
    - button "Close" [ref=e61] [cursor=pointer]:
      - img [ref=e62]
      - generic [ref=e65]: Close
```

# Test source

```ts
  54  |     );
  55  |   });
  56  | 
  57  |   test('reports page renders controls', async ({ page }) => {
  58  |     await page.goto('/institution/reports');
  59  |     await expect(page.getByText(/PDF.*Reports|PDF Generation/i)).toBeVisible({ timeout: 8_000 });
  60  |     await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
  61  |     await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
  62  |     await expect(page.getByRole('button', { name: /print report/i })).toBeVisible();
  63  |   });
  64  | 
  65  |   test('preview renders KPIs and topic breakdown', async ({ page }) => {
  66  |     await page.goto('/institution/reports');
  67  |     // Select student target
  68  |     await page.getByRole('combobox', { name: /student/i }).selectOption?.('enrolled-student@example.com');
  69  |     const studentSelect = page.locator('select').first();
  70  |     if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
  71  | 
  72  |     await page.getByRole('button', { name: /preview/i }).click();
  73  |     await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });
  74  |     await expect(page.getByText(/total_tests|12/i)).toBeVisible({ timeout: 5_000 });
  75  |     await expect(page.getByText(/Atomic Structure/i)).toBeVisible();
  76  |     await expect(page.getByText(/Ahmed shows strong conceptual/i)).toBeVisible();
  77  |   });
  78  | 
  79  |   test('print button disabled before preview', async ({ page }) => {
  80  |     await page.goto('/institution/reports');
  81  |     const printBtn = page.getByRole('button', { name: /print report/i });
  82  |     await expect(printBtn).toBeDisabled({ timeout: 8_000 });
  83  |   });
  84  | 
  85  |   test('print button opens new tab after preview', async ({ page, context }) => {
  86  |     await page.goto('/institution/reports');
  87  |     // Get a preview first
  88  |     const studentSelect = page.locator('select').first();
  89  |     if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
  90  |     await page.getByRole('button', { name: /preview/i }).click();
  91  |     await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });
  92  | 
  93  |     const [printPage] = await Promise.all([
  94  |       context.waitForEvent('page'),
  95  |       page.getByRole('button', { name: /print report/i }).click(),
  96  |     ]);
  97  |     await printPage.waitForLoadState();
  98  |     await expect(printPage.url()).toContain('/institution/reports/print');
  99  |     await printPage.close();
  100 |   });
  101 | 
  102 |   test('print page renders institution branding', async ({ page, context }) => {
  103 |     await page.goto('/institution/reports');
  104 |     const studentSelect = page.locator('select').first();
  105 |     if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
  106 |     await page.getByRole('button', { name: /preview/i }).click();
  107 |     await expect(page.getByText(/Ahmed Khan/i)).toBeVisible({ timeout: 8_000 });
  108 | 
  109 |     const [printPage] = await Promise.all([
  110 |       context.waitForEvent('page'),
  111 |       page.getByRole('button', { name: /print report/i }).click(),
  112 |     ]);
  113 |     await printPage.waitForLoadState();
  114 |     // Should show institution info from localStorage
  115 |     await expect(printPage.getByText(/powered by zoomiez/i)).toBeVisible({ timeout: 8_000 });
  116 |     await printPage.close();
  117 |   });
  118 | 
  119 |   test('email report sends to recipient (Resend stubbed)', async ({ page }) => {
  120 |     await page.goto('/institution/reports');
  121 |     const studentSelect = page.locator('select').first();
  122 |     if (await studentSelect.isVisible()) await studentSelect.selectOption('enrolled-student@example.com');
  123 |     await page.getByPlaceholder(/recipient email|parent@/i).fill('parent@example.com');
  124 |     await page.getByRole('button', { name: /send pdf/i }).click();
  125 |     await expect(page.getByText(/emailed successfully|sent/i)).toBeVisible({ timeout: 8_000 });
  126 |   });
  127 | });
  128 | 
  129 | test.describe('UC-IN-02: Teacher Management', () => {
  130 |   test.beforeEach(async ({ page }) => {
  131 |     await page.route(`${API}/api/institution/teachers`, (r) =>
  132 |       r.fulfill({
  133 |         json: [
  134 |           { _id: 'tch-001', email: 'teacher@example.com', name: 'Test Teacher', status: 'active', subjects: ['Chemistry'], quiz_count: 5 }
  135 |         ],
  136 |       })
  137 |     );
  138 |     // SENSITIVE: Resend stub
  139 |     await page.route(`${API}/api/institution/teachers/invite`, (r) =>
  140 |       r.fulfill({ json: { message: 'Teacher invited' } })
  141 |     );
  142 |   });
  143 | 
  144 |   test('teacher list renders', async ({ page }) => {
  145 |     await page.goto('/institution/teachers');
  146 |     await expect(page.getByText(/Test Teacher/i)).toBeVisible({ timeout: 8_000 });
  147 |   });
  148 | 
  149 |   test('invite teacher (Resend stubbed)', async ({ page }) => {
  150 |     await page.goto('/institution/teachers');
  151 |     const inviteBtn = page.getByRole('button', { name: /invite/i });
  152 |     if (await inviteBtn.isVisible()) {
  153 |       await inviteBtn.click();
> 154 |       await page.getByLabel(/email/i).fill('new-teacher@example.com');
      |                                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  155 |       await page.getByLabel(/name/i).fill('New Teacher');
  156 |       await page.getByRole('button', { name: /send invite|confirm/i }).click();
  157 |       await expect(page.getByText(/invited|success/i)).toBeVisible({ timeout: 8_000 });
  158 |     }
  159 |   });
  160 | });
  161 | 
```