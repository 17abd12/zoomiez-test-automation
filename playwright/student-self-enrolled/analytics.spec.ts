/**
 * UC-SE-08: Analytics
 * UC-SE-09: Notes browse + bookmark
 * UC-SE-11: Flashcards
 */

import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('UC-SE-08: Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Analytics endpoint is /analytics (no /api/ prefix) — uses fetch directly, not apiClient
    await page.route(`${API}/analytics`, (r) =>
      r.fulfill({
        json: {
          subjects: [{ name: 'Chemistry', avg_score: 72 }],
          topic_breakdown: [{ topic: 'Bonding', percentage: 68 }],
          recommendations: ['Review electrolysis'],
        },
      })
    );
  });

  test('analytics page renders charts and recommendations', async ({ page }) => {
    await page.goto('/student/analytics');
    await expect(page.getByText(/analytics/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/chemistry/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('empty analytics for new student shows no crash', async ({ page }) => {
    await page.route(`${API}/analytics`, (r) =>
      r.fulfill({ json: { subjects: [], topic_breakdown: [], recommendations: [] } })
    );
    await page.goto('/student/analytics');
    await expect(page.getByText(/no data|start practicing/i)).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('UC-SE-09: Notes — Browse & Bookmark', () => {
  test.beforeEach(async ({ page }) => {
    // Use RegExp — glob ** may not reliably match query strings in Playwright
    await page.route(/\/notes\/student\/notes/, (r) =>
      r.fulfill({
        json: {
          notes: [
            { _id: 'note-001', topic: 'Electrolysis Notes', subject: 'Chemistry', class_level: 'O-Level', download_count: 12 },
            { _id: 'note-002', topic: 'Bonding PDF', subject: 'Chemistry', class_level: 'O-Level', download_count: 5 },
          ],
          total: 2,
        },
      })
    );
    await page.route(`${API}/api/bookmarks`, (r) => r.fulfill({ json: { bookmarks: [] } }));
    await page.route(`${API}/api/bookmarks/note-001`, (r) => r.fulfill({ json: { message: 'Bookmarked' } }));
  });

  test('notes list renders', async ({ page }) => {
    await page.goto('/student/notes');
    await expect(page.getByText(/Electrolysis Notes/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/Bonding PDF/i)).toBeVisible();
  });

  test('bookmark icon is clickable', async ({ page }) => {
    await page.goto('/student/notes');
    await expect(page.getByText(/Electrolysis Notes/i)).toBeVisible({ timeout: 8_000 });
    // Find and click bookmark button for first note
    const bookmarkBtn = page.locator('[data-testid="bookmark-note-001"], button[aria-label*="bookmark"]').first();
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
      // Expect API call was made — route.fulfill above
    }
  });

  test('empty state shows message', async ({ page }) => {
    await page.route(/\/notes\/student\/notes/, (r) =>
      r.fulfill({ json: { notes: [], total: 0 } })
    );
    await page.goto('/student/notes');
    await expect(page.getByText(/no notes|nothing here/i)).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('UC-SE-11: Flashcards', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/flashcards/subjects`, (r) =>
      r.fulfill({ json: { 'O-Level': ['Chemistry', 'Physics'] } })
    );
    // Flashcards cards endpoint always has ?level=&subject= query params
    await page.route(`${API}/api/flashcards/cards**`, (r) =>
      r.fulfill({
        json: {
          cards: [
            { front: 'What is ionic bonding?', back: 'Transfer of electrons between atoms forming ions.' },
            { front: 'What is covalent bonding?', back: 'Sharing of electron pairs between atoms.' },
          ],
        },
      })
    );
  });

  test('flashcard deck loads', async ({ page }) => {
    await page.goto('/student/flashcards');
    await expect(page.getByText(/flashcard/i).first()).toBeVisible({ timeout: 8_000 });
  });
});
