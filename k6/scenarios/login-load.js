/**
 * k6 load test — POST /auth/login
 * Hot endpoint: every user session starts here.
 * SLO: p95 < 500ms, error rate < 1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: __ENV.K6_RAMP_UP || '10s', target: parseInt(__ENV.K6_VUS || '10') },
    { duration: __ENV.K6_DURATION || '30s', target: parseInt(__ENV.K6_VUS || '10') },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    login_duration: ['p(95)<500'],
  },
};

const CREDENTIALS = [
  { email: 'load-test-student@example.com', password: 'LoadTestPass123' },
  { email: 'load-test-teacher@example.com', password: 'LoadTestPass123' },
];

export default function () {
  const cred = CREDENTIALS[Math.floor(Math.random() * CREDENTIALS.length)];

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify(cred),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const success = check(res, {
    'status 200 or 401': (r) => [200, 401].includes(r.status),
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  loginDuration.add(res.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'docs/k6/login.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
