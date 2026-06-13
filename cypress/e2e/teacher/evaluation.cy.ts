/// <reference types="cypress" />

/**
 * Cypress — UC-TC-05: Teacher Evaluation (OpenAI + Mistral stubbed)
 * UC-TC-04: Quiz print (light background)
 */

describe('UC-TC-05: Teacher Evaluation', () => {
  const api = Cypress.env('API_BASE_URL') || 'http://localhost:5000';

  beforeEach(() => {
    cy.loginAs('teacher');
    cy.stubSensitiveApis();

    cy.intercept('GET', `${api}/api/teacher/evaluations/options`, {
      students: [{ email: 'student@example.com', name: 'Ahmed Khan' }],
      quizzes: [{ _id: 'quiz-001', title: 'Chemistry SQ 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'sq', question_count: 3 }],
    });
    cy.intercept('GET', `${api}/api/teacher/evaluations/history/*`, []);
  });

  it('evaluation page loads and shows student/quiz selects', () => {
    cy.visit('/teacher/evaluation');
    cy.contains(/evaluation module/i, { timeout: 8_000 }).should('be.visible');
    cy.contains(/Ahmed Khan/i).should('be.visible');
  });

  it('submit text evaluation shows report (OpenAI stubbed)', () => {
    cy.visit('/teacher/evaluation');
    cy.get('select').first().select('student@example.com');
    cy.get('select').eq(1).select('quiz-001');
    cy.get('textarea').type('Q1a) Hydrogen and Chlorine. Q1b) Because Cl- is concentrated.');
    cy.get('button').contains(/run evaluation/i).click();
    cy.contains(/evaluation report/i, { timeout: 15_000 }).should('be.visible');
  });

  it('validation error when no student selected', () => {
    cy.visit('/teacher/evaluation');
    cy.get('button').contains(/run evaluation/i).click();
    cy.contains(/select student/i, { timeout: 5_000 }).should('be.visible');
  });
});

describe('UC-TC-04: Quiz Print — Light Background', () => {
  beforeEach(() => {
    cy.loginAs('teacher');
  });

  it('quiz print page has light background masthead', () => {
    // QuizPrint reads from 'teacher_quiz_print_payload' (QuizManager QUIZ_PRINT_STORAGE_KEY)
    // Payload must match QuizPrintPayload interface: title, subject, class_level, quiz_type, questions, question_count
    cy.window().then((win) => {
      win.localStorage.setItem('teacher_quiz_print_payload', JSON.stringify({
        title: 'Chemistry MCQ Test',
        subject: 'Chemistry',
        class_level: 'O-Level',
        quiz_type: 'mcq',
        question_count: 1,
        teacher_name: 'Test Teacher',
        questions: [
          { question_number: 1, statement: 'Q1 text?', options: { A: 'A', B: 'B', C: 'C', D: 'D' }, Answer: 'A' },
        ],
      }));
    });
    cy.visit('/teacher/quizzes/print');
    cy.get('[data-testid="quiz-print-masthead"], .print-masthead').should('exist');
    // Background should NOT be dark
    cy.get('[data-testid="quiz-print-masthead"], .print-masthead').should(($el) => {
      const bg = window.getComputedStyle($el[0]).backgroundColor;
      expect(bg).not.to.equal('rgb(30, 41, 59)'); // #1e293b
    });
  });
});
