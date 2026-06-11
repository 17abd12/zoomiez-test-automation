/**
 * k6 browser screenshots — captures key pages of the Zoomiez frontend.
 * Requires: k6 v0.52+ with browser module.
 * Run: k6 run k6/screenshots.js  (frontend must be running on FRONTEND_URL)
 *
 * Outputs PNG files to docs/k6/screenshots/ for the report hub.
 */

import { browser } from 'k6/browser';

const BASE_URL = __ENV.FRONTEND_URL || 'http://localhost:8080';
const API_URL  = __ENV.API_BASE_URL  || 'http://localhost:5000';

export const options = {
  scenarios: {
    screenshots: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: { type: 'chromium' },
      },
    },
  },
};

async function snap(page, url, filename, waitMs = 1500) {
  await page.goto(url, { waitUntil: 'networkidle' });
  // extra settle time for React hydration
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: `docs/k6/screenshots/${filename}`, fullPage: true });
}

export default async function () {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    // ── Public pages (no auth needed) ─────────────────────────────────────
    await snap(page, BASE_URL, '01-landing.png');
    await snap(page, `${BASE_URL}/auth/login`, '02-login.png');
    await snap(page, `${BASE_URL}/auth/signup`, '03-signup.png');

    // ── Authenticated pages (student self-enrolled) ───────────────────────
    // Inject JWT into localStorage so ProtectedRoute lets us in.
    // Requires JWT_SECRET_KEY env var (same value as backend).
    const secret = __ENV.JWT_SECRET_KEY || '';
    if (secret) {
      await page.goto(BASE_URL, { waitUntil: 'load' });

      // Build a minimal app_state matching the Redux auth slice shape.
      // We call the backend /auth/login directly to get a real token.
      const loginRes = await page.evaluate(async (args) => {
        const r = await fetch(`${args.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: args.email, password: args.password }),
        });
        return r.ok ? await r.json() : null;
      }, {
        apiUrl: API_URL,
        email: __ENV.SCREENSHOT_EMAIL || 'load-test-student@example.com',
        password: __ENV.SCREENSHOT_PASSWORD || 'LoadTestPass123',
      });

      if (loginRes && loginRes.token) {
        await page.evaluate((state) => {
          localStorage.setItem('app_state', JSON.stringify(state));
        }, {
          auth: {
            isLoggedIn: true,
            token: loginRes.token,
            user: loginRes.user,
          },
        });

        await snap(page, `${BASE_URL}/student/dashboard`, '04-student-dashboard.png');
        await snap(page, `${BASE_URL}/student/past-papers`, '05-past-papers.png');
        await snap(page, `${BASE_URL}/student/topical`, '06-topical-papers.png');
      }
    }
  } finally {
    await page.close();
  }
}
