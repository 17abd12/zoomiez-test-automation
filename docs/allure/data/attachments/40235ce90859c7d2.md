# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: institution\reports.spec.ts >> UC-IN-02: Teacher Management >> teacher list renders
- Location: playwright\institution\reports.spec.ts:144:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Test Teacher/i)
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText(/Test Teacher/i)

```

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- complementary:
  - img
  - text: Zoomiez Powered By Zoomiez
  - navigation:
    - link "Dashboard":
      - /url: /institution/dashboard
      - img
      - text: Dashboard
    - link "Teacher Management":
      - /url: /institution/teachers
      - img
      - text: Teacher Management
    - link "Student Analytics":
      - /url: /institution/students
      - img
      - text: Student Analytics
    - link "Teacher Progress":
      - /url: /institution/progress
      - img
      - text: Teacher Progress
    - link "Reports":
      - /url: /institution/reports
      - img
      - text: Reports
    - link "Settings":
      - /url: /institution/settings
      - img
      - text: Settings
  - button:
    - img
- banner:
  - button "Switch to dark mode":
    - img
  - button "IN":
    - text: IN
    - img
- main:
  - heading "Teacher Management" [level=1]
  - paragraph: Manage and onboard teachers across your academy.
  - button "Show Stats"
  - button "Invite Teacher":
    - img
    - text: Invite Teacher
  - text: User not found
  - heading "All Teachers" [level=3]
  - img
  - textbox "Search teachers..."
  - table:
    - rowgroup:
      - row "Name Email Subjects Classes Status":
        - columnheader "Name"
        - columnheader "Email"
        - columnheader "Subjects"
        - columnheader "Classes"
        - columnheader "Status"
        - columnheader
    - rowgroup:
      - row "No teachers yet.":
        - cell "No teachers yet."
  - heading "Invited Teachers" [level=3]
  - table:
    - rowgroup:
      - row "Name Email Subjects Status Invited At Expires Action":
        - columnheader "Name"
        - columnheader "Email"
        - columnheader "Subjects"
        - columnheader "Status"
        - columnheader "Invited At"
        - columnheader "Expires"
        - columnheader "Action"
    - rowgroup:
      - row "No teacher invitations yet.":
        - cell "No teacher invitations yet."
```

# Test source

```ts
  46  |       })
  47  |     );
  48  |     // SENSITIVE: Resend stub
  49  |     await page.route(`${API}/api/institution/reports/email`, (r) =>
  50  |       r.fulfill({ json: { message: 'Report emailed successfully' } })
  51  |     );
  52  |     await page.route(`${API}/api/institution/reports/history`, (r) =>
  53  |       r.fulfill({ json: [] })
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
> 146 |     await expect(page.getByText(/Test Teacher/i)).toBeVisible({ timeout: 8_000 });
      |                                                   ^ Error: expect(locator).toBeVisible() failed
  147 |   });
  148 | 
  149 |   test('invite teacher (Resend stubbed)', async ({ page }) => {
  150 |     await page.goto('/institution/teachers');
  151 |     const inviteBtn = page.getByRole('button', { name: /invite/i });
  152 |     if (await inviteBtn.isVisible()) {
  153 |       await inviteBtn.click();
  154 |       await page.getByLabel(/email/i).fill('new-teacher@example.com');
  155 |       await page.getByLabel(/name/i).fill('New Teacher');
  156 |       await page.getByRole('button', { name: /send invite|confirm/i }).click();
  157 |       await expect(page.getByText(/invited|success/i)).toBeVisible({ timeout: 8_000 });
  158 |     }
  159 |   });
  160 | });
  161 | 
```