const { defineConfig } = require('cypress');
require('dotenv').config();

// allure-cypress v3 uses setupNodeEvents, not the top-level `reporter` field.
let allureCypress;
try {
  allureCypress = require('allure-cypress/reporter').allureCypress;
} catch {
  allureCypress = null;
}

module.exports = defineConfig({
  // cypress-mochawesome-reporter generates docs/cypress/index.html locally.
  // allure-cypress (via setupNodeEvents) still writes allure-results/ for CI.
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'docs/cypress',
    charts: true,
    reportPageTitle: 'Zoomiez — Cypress E2E',
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: true,
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    env: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
      STUB_MODE: process.env.STUB_MODE || 'true',
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '',
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      if (allureCypress) {
        allureCypress(on, { resultsDir: 'allure-results' });
      }
      return config;
    },
  },
});
