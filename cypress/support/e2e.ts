import 'cypress-mochawesome-reporter/register';
import 'allure-cypress';
import './commands';

// Global before each — reset all intercepts (prevents bleed between tests)
beforeEach(() => {
  // Nothing to reset by default — cy.intercept scoped per test
});
