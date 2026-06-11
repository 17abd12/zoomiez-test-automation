import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'allure-cypress',
    reporterOptions: {
      resultsDir: '../allure-results',
    },
    env: {
      API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:5000',
      STUB_MODE: process.env.STUB_MODE ?? 'true',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
