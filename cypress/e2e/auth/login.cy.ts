/// <reference types="cypress" />

/**
 * Cypress — UC-AUTH-03: Login
 * UC-CROSS-02: Protected Route Redirects
 */

describe('UC-AUTH-03: Login', () => {
  const api = Cypress.env('API_BASE_URL') || 'http://localhost:5000';

  it('student login happy path redirects to /student/dashboard', () => {
    cy.intercept('POST', `${api}/auth/login`, {
      body: { token: 'mock-jwt', user: { email: 'student@example.com', role: 'student', student_type: 'self_enrolled', onboarding_completed: true } },
    });
    cy.visit('/login/student');
    cy.get('input[type="email"]').type('student@example.com');
    cy.get('input[type="password"]').type('Pass123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10_000 }).should('include', '/student/dashboard');
  });

  it('wrong password shows error message', () => {
    cy.intercept('POST', `${api}/auth/login`, { statusCode: 401, body: { error: 'Invalid credentials' } });
    cy.visit('/login/student');
    cy.get('input[type="email"]').type('bad@example.com');
    cy.get('input[type="password"]').type('WrongPass');
    cy.get('button[type="submit"]').click();
    cy.contains(/invalid credentials/i, { timeout: 5_000 }).should('be.visible');
  });

  it('unverified user redirected to verify-email', () => {
    cy.intercept('POST', `${api}/auth/login`, { statusCode: 403, body: { error: 'Email not verified' } });
    cy.visit('/login/student');
    cy.get('input[type="email"]').type('unverified@example.com');
    cy.get('input[type="password"]').type('Pass123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 8_000 }).should('include', '/verify-email');
  });

  it('institution login stores org_name in localStorage', () => {
    cy.intercept('POST', `${api}/auth/login`, {
      body: { token: 'mock-jwt', user: { email: 'inst@example.com', role: 'institution', institution_name: 'Test Academy', onboarding_completed: true } },
    });
    cy.visit('/login/institution');
    cy.get('input[type="email"]').type('inst@example.com');
    cy.get('input[type="password"]').type('Pass123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10_000 }).should('include', '/institution');
    cy.window().its('localStorage').invoke('getItem', 'org_name').should('eq', 'Test Academy');
  });
});

describe('UC-CROSS-02: Protected Route Redirects', () => {
  it('unauthenticated /student/dashboard redirects to login', () => {
    cy.clearLocalStorage();
    cy.visit('/student/dashboard');
    cy.url({ timeout: 8_000 }).should('include', '/login');
  });

  it('unauthenticated /teacher redirects to login', () => {
    cy.clearLocalStorage();
    cy.visit('/teacher');
    cy.url({ timeout: 8_000 }).should('include', '/login');
  });

  it('unauthenticated /institution/dashboard redirects to login', () => {
    cy.clearLocalStorage();
    cy.visit('/institution/dashboard');
    cy.url({ timeout: 8_000 }).should('include', '/login');
  });
});
