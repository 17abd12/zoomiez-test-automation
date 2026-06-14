/// <reference types="cypress" />

// ─── Custom Commands ────────────────────────────────────────────────────────

/**
 * Craft a structurally-valid JWT without Node.js crypto.
 * Frontend only uses the token as a Bearer string — never validates signature.
 * Backend calls are all stubbed, so signature doesn't matter.
 */
function makeTestToken(payload: object): string {
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const header = enc({ alg: 'HS256', typ: 'JWT' });
  const body = enc(payload);
  return `${header}.${body}.cypress-test-signature`;
}

/**
 * cy.loginAs(role) — injects JWT into Redux localStorage to bypass login UI.
 * Uses cy.session() so token is reused across tests in same spec.
 */
Cypress.Commands.add('loginAs', (role: 'self_student' | 'enrolled_student' | 'teacher' | 'institution') => {
  cy.session(role, () => {
    const users: Record<string, any> = {
      self_student: { email: 'self-student@example.com', role: 'student', student_type: 'self_enrolled' },
      enrolled_student: { email: 'enrolled-student@example.com', role: 'student', student_type: 'teacher_enrolled' },
      teacher: { email: 'teacher@example.com', role: 'teacher' },
      institution: { email: 'institution@example.com', role: 'institution', institution_name: 'Test Academy' },
    };
    const user = users[role];

    cy.visit('/');
    cy.window().then((win) => {
      const token = makeTestToken({
        sub: user.email, email: user.email, role: user.role, roles: [user.role],
        student_type: user.student_type, institution_name: user.institution_name,
        onboarding_completed: true, exp: Math.floor(Date.now() / 1000) + 7200,
      });
      // roles array required — ProtectedRoute uses user.roles || [] for allowedRoles check
      win.localStorage.setItem('app_state', JSON.stringify({
        auth: { isLoggedIn: true, token, user: { ...user, roles: [user.role], name: 'Test User', onboarding_completed: true } },
      }));
    });
  });
});

/**
 * cy.stubSensitiveApis() — intercept all OpenAI/Resend/R2/Mistral routes.
 * Call in beforeEach for any test touching sensitive endpoints.
 */
Cypress.Commands.add('stubSensitiveApis', () => {
  const api = Cypress.env('API_BASE_URL') || 'http://localhost:5000';

  // SENSITIVE: OpenAI — inline body avoids fixturesFolder path resolution issues
  const evalStub = {
    submission_id: 'test-eval-001', quiz_title: 'Chemistry SQ Test 1', subject: 'Chemistry',
    total_marks_obtained: 14, total_marks_available: 20, percentage: 70,
    evaluations: [
      { root_question_id: 'q1', question_number: 1, part_label: 'a', marks_awarded: 2, marks_total: 2, is_correct: true, feedback: 'Correct.' },
      { root_question_id: 'q1', question_number: 1, part_label: 'b', marks_awarded: 2, marks_total: 4, is_correct: false, feedback: 'Partial.', mistake: 'Omitted discharge potential.', improve: 'Review section 4.' },
    ],
  };
  cy.intercept('POST', `${api}/api/teacher/evaluations/submit`, { body: evalStub });
  cy.intercept('POST', `${api}/api/sq-evaluation/evaluate`, { body: evalStub });
  cy.intercept('POST', `${api}/api/evaluations/*/enrich`, { body: { ai_enriched: true } });

  // SENSITIVE: Resend (all email sends)
  cy.intercept('POST', `${api}/auth/register/student`, { statusCode: 201, body: { message: 'Registered' } });
  cy.intercept('POST', `${api}/auth/forgot-password`, { body: { message: 'OTP sent' } });
  cy.intercept('POST', `${api}/api/teacher/students/invite`, { body: { message: 'Invited' } });
  cy.intercept('POST', `${api}/api/institution/teachers/invite`, { body: { message: 'Invited' } });
  cy.intercept('POST', `${api}/api/institution/reports/email`, { body: { message: 'Emailed' } });

  // SENSITIVE: R2 storage
  cy.intercept('POST', `${api}/notes/notes`, { statusCode: 201, body: { note_id: 'note-001' } });
  cy.intercept('GET', `${api}/notes/download/*`, { body: '%PDF-1.4 stub' });
  cy.intercept('GET', `${api}/notes/preview/*`, { body: '%PDF-1.4 stub' });
  cy.intercept('PUT', `${api}/api/institution/profile`, { body: { message: 'Updated', logo_url: 'https://stub.r2.example.com/logo.png' } });
  cy.intercept('POST', `${api}/api/institutions/signup`, { statusCode: 201, body: { token: 'mock-jwt' } });
});

// ─── Type declarations ───────────────────────────────────────────────────────

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'self_student' | 'enrolled_student' | 'teacher' | 'institution'): void;
      stubSensitiveApis(): void;
    }
  }
}

export {};
