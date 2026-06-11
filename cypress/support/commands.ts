/// <reference types="cypress" />
import * as jwt from 'jsonwebtoken';

// ─── Custom Commands ────────────────────────────────────────────────────────

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
    const secret = Cypress.env('JWT_SECRET_KEY') || 'test-secret-key';

    cy.visit('/');
    cy.window().then((win) => {
      const token = jwt.sign(
        { sub: user.email, email: user.email, role: user.role, roles: [user.role], student_type: user.student_type, institution_name: user.institution_name, onboarding_completed: true, exp: Math.floor(Date.now() / 1000) + 7200 },
        secret
      );
      win.localStorage.setItem('app_state', JSON.stringify({
        auth: { isLoggedIn: true, token, user: { ...user, name: 'Test User', onboarding_completed: true } },
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

  // SENSITIVE: OpenAI
  cy.intercept('POST', `${api}/api/teacher/evaluations/submit`, { fixture: 'mock-data/evaluation-stub.json' });
  cy.intercept('POST', `${api}/api/sq-evaluation/evaluate`, { fixture: 'mock-data/evaluation-stub.json' });
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
