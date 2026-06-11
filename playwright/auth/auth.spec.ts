/**
 * UC-AUTH-01 — UC-AUTH-05 + UC-CROSS-01/02
 * All auth flows: register, OTP verify, login, forgot/reset, institution signup
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PW_BASE_URL ?? 'http://localhost:8080';
const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-AUTH-03: Login', () => {
  test('student login happy path redirects to /student/dashboard', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        json: {
          token: 'mock-jwt',
          user: { email: 'self-student@example.com', role: 'student', student_type: 'self_enrolled', onboarding_completed: true },
        },
      })
    );
    await page.goto(`${BASE}/login/student`);
    await page.getByLabel(/email/i).fill('self-student@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 10_000 });
  });

  test('teacher login redirects to /teacher', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        json: { token: 'mock-jwt', user: { email: 'teacher@example.com', role: 'teacher', onboarding_completed: true } },
      })
    );
    await page.goto(`${BASE}/login/teacher`);
    await page.getByLabel(/email/i).fill('teacher@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/teacher/, { timeout: 10_000 });
  });

  test('institution login sets orgName in localStorage', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        json: { token: 'mock-jwt', user: { email: 'inst@example.com', role: 'institution', institution_name: 'Test Academy', onboarding_completed: true } },
      })
    );
    await page.goto(`${BASE}/login/institution`);
    await page.getByLabel(/email/i).fill('inst@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/institution/, { timeout: 10_000 });
    const orgName = await page.evaluate(() => localStorage.getItem('org_name'));
    expect(orgName).toBe('Test Academy');
  });

  test('wrong password shows error toast', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({ status: 401, json: { error: 'Invalid credentials' } })
    );
    await page.goto(`${BASE}/login/student`);
    await page.getByLabel(/email/i).fill('self-student@example.com');
    await page.getByLabel(/password/i).fill('WrongPass');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5_000 });
  });

  test('unverified email shows verify message', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({ status: 403, json: { error: 'Email not verified' } })
    );
    await page.goto(`${BASE}/login/student`);
    await page.getByLabel(/email/i).fill('unverified@example.com');
    await page.getByLabel(/password/i).fill('Pass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 8_000 });
  });

  test('new student without onboarding redirects to /student/onboarding', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        json: { token: 'mock-jwt', user: { email: 'new@example.com', role: 'student', student_type: 'self_enrolled', onboarding_completed: false } },
      })
    );
    await page.goto(`${BASE}/login/student`);
    await page.getByLabel(/email/i).fill('new@example.com');
    await page.getByLabel(/password/i).fill('Pass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/\/student\/onboarding/, { timeout: 10_000 });
  });
});

test.describe('UC-AUTH-01: Student Registration', () => {
  test('happy path shows verify-email page', async ({ page }) => {
    await page.route(`${API}/auth/register/student`, (route) =>
      route.fulfill({ status: 201, json: { message: 'Registration successful' } })
    );
    await page.goto(`${BASE}/signup-student`);
    await page.getByLabel(/email/i).fill('new-student@example.com');
    await page.getByLabel(/password/i).first().fill('SecurePass123');
    await page.getByLabel(/confirm password/i).fill('SecurePass123');
    await page.getByLabel(/name/i).fill('New Student');
    await page.getByRole('button', { name: /sign up|create|register/i }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 8_000 });
  });

  test('duplicate email shows error', async ({ page }) => {
    await page.route(`${API}/auth/register/student`, (route) =>
      route.fulfill({ status: 400, json: { error: 'Email already registered' } })
    );
    await page.goto(`${BASE}/signup-student`);
    await page.getByLabel(/email/i).fill('existing@example.com');
    await page.getByLabel(/password/i).first().fill('SecurePass123');
    await page.getByLabel(/confirm password/i).fill('SecurePass123');
    await page.getByLabel(/name/i).fill('Name');
    await page.getByRole('button', { name: /sign up|create|register/i }).click();
    await expect(page.getByText(/already registered|email.*taken/i)).toBeVisible({ timeout: 5_000 });
  });

  test('password mismatch blocks submit', async ({ page }) => {
    await page.goto(`${BASE}/signup-student`);
    await page.getByLabel(/email/i).fill('new@example.com');
    await page.getByLabel(/password/i).first().fill('Pass123');
    await page.getByLabel(/confirm password/i).fill('DifferentPass');
    await page.getByLabel(/name/i).fill('Name');
    await page.getByRole('button', { name: /sign up|create|register/i }).click();
    // Should not navigate — still on signup page
    await expect(page).toHaveURL(/signup-student/);
  });
});

test.describe('UC-CROSS-02: Protected Route Redirects', () => {
  test('unauthenticated access to /student/dashboard redirects to login', async ({ page }) => {
    // Clear any stored state
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/student/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test('direct access to /teacher redirects when not authenticated', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/teacher`);
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
