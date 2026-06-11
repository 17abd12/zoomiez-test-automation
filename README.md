# Zoomiez — Test Documentation

Full test suite: Playwright E2E · Cypress E2E · k6 Load · Newman Contract · pytest Backend · Allure Reports · GitHub Actions CI

---

## Quick Start

```bash
cd Zoomiez-test-Documentation

# 1. Copy env + user fixtures
cp .env.example .env
cp fixtures/users.example.json fixtures/users.json
# Edit .env — set JWT_SECRET_KEY to match backend .env
# Edit fixtures/users.json — fill in real test credentials

# 2. Install deps
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Run Playwright (frontend + backend must be running)
npm run test:playwright

# 5. Run Cypress
npm run test:cypress:run

# 6. Run backend pytest
cd backend-tests
pip install -r requirements-test.txt
pytest . -v

# 7. Run Newman contract tests
npm run test:newman

# 8. k6 load tests
k6 run k6/scenarios/login-load.js
k6 run k6/scenarios/papers-load.js

# 9. Generate + open Allure report
npm run test:allure
npm run test:allure:open
```

---

## Environment Setup

Copy `.env.example` → `.env`:

```env
PW_BASE_URL=http://localhost:8080
API_BASE_URL=http://localhost:5000
JWT_SECRET_KEY=<same as backend JWT_SECRET_KEY>
STUB_MODE=true
MONGO_URI_TEST=mongodb://localhost:27017/zoomiez_test
```

Copy `fixtures/users.example.json` → `fixtures/users.json` and fill in real credentials.

---

## Auth Strategy

**JWT Mint Trick (default, STUB_MODE=true)**  
Tests sign JWTs using `JWT_SECRET_KEY` directly — no real login calls, no Resend emails.  
Works because the backend uses HS256.

**Real Login (REAL_LOGIN=true)**  
Set `REAL_LOGIN=true` in `.env` to use actual login UI + real credentials from `fixtures/users.json`.  
Requires a real test account in the DB.

---

## Sensitive Routes — Stub Policy

These routes call paid external APIs. **Never hit real endpoints in tests.**

| API | What it does | Stub mechanism |
|-----|-------------|----------------|
| **OpenAI** | SQ eval, teacher eval, insight enrichment | `pytest-mock` (backend) · `page.route()` / `cy.intercept()` (frontend) |
| **Mistral** | OCR on uploaded images | `pytest-mock` |
| **Resend** | OTP emails, invites, report emails | `responses` lib (backend) · `cy.intercept()` (frontend) |
| **R2** | Note upload/download, institution logo | `moto` (backend) · `cy.intercept()` / `page.route()` (frontend) |
| **Playwright PDF** | Server-side PDF generation | Use HTML fallback path in tests |

**Frontend:** All sensitive routes pre-stubbed in `mocks/msw/handlers/index.ts`.  
**Cypress:** `cy.stubSensitiveApis()` command stubs all in one call.  
**pytest:** Fixtures `mock_openai`, `mock_mistral`, `mock_resend`, `mock_r2` in `conftest.py`.

---

## Test Structure

```
Zoomiez-test-Documentation/
├── fixtures/
│   ├── users.example.json       # Copy → users.json, fill credentials
│   └── mock-data/               # Stub response JSON for all sensitive APIs
│
├── mocks/msw/
│   ├── handlers/index.ts        # All MSW network stubs (OpenAI, Resend, R2, Mistral)
│   └── server.ts                # Node MSW server for Playwright
│
├── playwright/
│   ├── playwright.config.ts     # Multi-project config (4 roles)
│   ├── auth/auth.setup.ts       # JWT mint → storageState per role
│   ├── auth/auth.spec.ts        # UC-AUTH-01–05
│   ├── student-self-enrolled/   # UC-SE-01–12
│   ├── student-teacher-enrolled/ # UC-TE-01–04
│   ├── teacher/                 # UC-TC-01–06
│   └── institution/             # UC-IN-01–05
│
├── cypress/
│   ├── cypress.config.ts
│   ├── support/commands.ts      # cy.loginAs(), cy.stubSensitiveApis()
│   └── e2e/                     # auth/, student/, teacher/, institution/
│
├── k6/scenarios/
│   ├── login-load.js            # POST /auth/login — p95 < 500ms
│   ├── papers-load.js           # GET /api/papers/random — p95 < 800ms
│   └── dashboard-load.js        # Dashboard + analytics — p95 < 600ms
│
├── newman/
│   ├── zoomiez-collection.json  # Full Postman collection (all contract tests)
│   └── environments/local.json
│
├── backend-tests/
│   ├── conftest.py              # Flask client, JWT mint, mock_openai/resend/r2/mistral
│   ├── utils/jwt_helper.py      # mint_jwt(), auth_header()
│   ├── test_auth.py             # 12 auth tests
│   ├── test_papers.py           # 8 paper tests
│   ├── test_teacher.py          # 15 teacher tests
│   └── test_institution.py      # 13 institution tests
│
└── .github/workflows/
    ├── playwright.yml           # Playwright CI
    ├── backend-tests.yml        # pytest + Newman CI
    ├── k6.yml                   # Load tests (nightly + manual)
    └── allure-pages.yml         # Allure report → GitHub Pages
```

---

## data-testid Attributes

Added to these frontend elements for stable selectors:

| Component | Attribute |
|-----------|-----------|
| `QuizPrint.tsx` — masthead div | `data-testid="quiz-print-masthead"` |

**To add more** (recommended for test stability):

```tsx
// Login form
<input data-testid="login-email" ... />
<input data-testid="login-password" ... />
<button data-testid="login-submit" ... />

// Onboarding
<div data-testid="level-card-{level}" ... />
<button data-testid="onboarding-next" ... />

// Quiz attempt
<div data-testid="question-{n}" ... />
<button data-testid="option-{q}-{letter}" ... />
<button data-testid="submit-quiz" ... />

// Evaluation report
<div data-testid="eval-masthead" ... />
<button data-testid="print-report" ... />
```

---

## k6 SLOs

| Endpoint | p95 target | Error rate |
|----------|-----------|------------|
| `POST /auth/login` | < 500ms | < 1% |
| `GET /api/papers/random` | < 800ms | < 1% |
| `GET /api/dashboard/stats` | < 600ms | < 1% |
| `GET /api/topical/subjects` | < 400ms | < 1% |

---

## GitHub Actions CI

| Workflow | Trigger | What runs |
|----------|---------|-----------|
| `playwright.yml` | push/PR to main | All Playwright E2E specs |
| `backend-tests.yml` | push/PR to main | pytest (40+ tests) + Newman (contract) |
| `k6.yml` | Nightly 2am UTC + manual | k6 load tests with SLO enforcement |
| `allure-pages.yml` | After test workflows | Merge Allure results → GitHub Pages |

**GitHub Pages URL:** `https://<your-org>.github.io/<repo-name>/`

---

## Self-Cleaning Backend Tests

All test data uses `TEST_PREFIX = f"ztest_{int(time.time())}_"`.  
`conftest.py` `cleanup_test_data` fixture (autouse=True) deletes all prefixed records after each test.  
No manual DB cleanup needed.
