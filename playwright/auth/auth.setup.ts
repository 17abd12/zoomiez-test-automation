/**
 * Auth setup — generates storageState for all 4 user roles.
 * Uses JWT mint trick: signs a test JWT with JWT_SECRET_KEY so no real login is needed.
 * If real login is preferred, set REAL_LOGIN=true in .env.
 */

import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { STORAGE_STATES } from '../playwright.config';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// fixtures/users.json is gitignored (contains real credentials for REAL_LOGIN mode).
// For JWT mint mode (default), only email/role fields are used — password is irrelevant.
// Fallback users are used if the file is absent (e.g. in CI without the file).
const DEFAULT_USERS = {
  self_enrolled_student: { email: 'self-student@test.com', name: 'Self Student', role: 'student', student_type: 'self_enrolled', password: '' },
  teacher_enrolled_student: { email: 'enrolled-student@test.com', name: 'Enrolled Student', role: 'student', student_type: 'teacher_enrolled', password: '' },
  teacher: { email: 'teacher@test.com', name: 'Test Teacher', role: 'teacher', password: '' },
  institution: { email: 'institution@test.com', name: 'Test Institution', role: 'institution', institution_name: 'Test Academy', password: '' },
};
let users: typeof DEFAULT_USERS;
try {
  users = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../fixtures/users.json'), 'utf-8'));
} catch {
  users = DEFAULT_USERS;
}

const BASE_URL = process.env.PW_BASE_URL ?? 'http://localhost:8080';
const USE_REAL_LOGIN = process.env.REAL_LOGIN === 'true';
const JWT_SECRET = process.env.JWT_SECRET_KEY ?? '';

/**
 * Mint a JWT for test users — no /auth/login call needed.
 * Token shape must match what the Flask backend issues.
 */
function mintToken(user: { email: string; role: string; student_type?: string; institution_name?: string }) {
  return jwt.sign(
    {
      sub: user.email,
      email: user.email,
      role: user.role,
      roles: [user.role],
      student_type: user.student_type,
      institution_name: user.institution_name,
      onboarding_completed: true,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

/**
 * Inject token into Redux state in localStorage to bypass login UI.
 * Must include isLoggedIn:true — authSlice initial state has it; ProtectedRoute reads it.
 * page.evaluate runs in localhost:8080 context so localStorage goes to the correct origin.
 * storageState saved after this captures localhost:8080 localStorage for use in all spec tests.
 */
async function injectAuthState(page: any, user: any, token: string) {
  await page.goto(BASE_URL);
  await page.evaluate(({ token, user }: any) => {
    const state = {
      auth: {
        isLoggedIn: true,
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          roles: [user.role],
          student_type: user.student_type,
          institution_name: user.institution_name,
          onboarding_completed: true,
        },
      },
    };
    localStorage.setItem('app_state', JSON.stringify(state));
  }, { token, user });
}

// ─── Helper: real login via UI ────────────────────────────────────────────────
async function loginViaUI(page: any, user: any, portal: string) {
  await page.goto(`${BASE_URL}/login/${portal}`);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  // Wait for dashboard to load
  await page.waitForURL(/\/(student|teacher|institution)\/dashboard/, { timeout: 15_000 });
}

// ─── Auth setup tests ─────────────────────────────────────────────────────────

setup('setup self-enrolled student auth', async ({ page }) => {
  fs.mkdirSync(path.dirname(STORAGE_STATES.selfStudent), { recursive: true });
  const user = users.self_enrolled_student;
  if (USE_REAL_LOGIN) {
    await loginViaUI(page, user, 'student');
  } else {
    const token = mintToken(user);
    await injectAuthState(page, user, token);
  }
  await page.context().storageState({ path: STORAGE_STATES.selfStudent });
});

setup('setup teacher-enrolled student auth', async ({ page }) => {
  const user = users.teacher_enrolled_student;
  if (USE_REAL_LOGIN) {
    await loginViaUI(page, user, 'student');
  } else {
    const token = mintToken(user);
    await injectAuthState(page, user, token);
  }
  await page.context().storageState({ path: STORAGE_STATES.enrolledStudent });
});

setup('setup teacher auth', async ({ page }) => {
  const user = users.teacher;
  if (USE_REAL_LOGIN) {
    await loginViaUI(page, user, 'teacher');
  } else {
    const token = mintToken(user);
    await injectAuthState(page, user, token);
  }
  await page.context().storageState({ path: STORAGE_STATES.teacher });
});

setup('setup institution auth', async ({ page }) => {
  const user = users.institution;
  if (USE_REAL_LOGIN) {
    await loginViaUI(page, user, 'institution');
  } else {
    const token = mintToken(user);
    await injectAuthState(page, user, token);
  }
  await page.context().storageState({ path: STORAGE_STATES.institution });
});
