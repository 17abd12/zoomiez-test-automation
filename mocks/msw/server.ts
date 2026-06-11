import { setupServer } from 'msw/node';
import { handlers } from './handlers/index';

// Node-side MSW server — used in Playwright and backend-adjacent tests
export const server = setupServer(...handlers);
