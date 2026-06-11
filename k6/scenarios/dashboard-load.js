/**
 * k6 load test — dashboard + analytics endpoints
 * Simulates authenticated users hitting the dashboard on login.
 * SLO: p95 < 600ms
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000';
const TOKEN = __ENV.LOAD_TEST_TOKEN || '';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 15 },
    { duration: '30s', target: 15 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export default function () {
  group('Student dashboard page load', () => {
    const r1 = http.get(`${BASE_URL}/api/dashboard/stats?user_email=load@example.com`, { headers });
    check(r1, { 'dashboard stats 200': (r) => r.status === 200 });
    errorRate.add(r1.status !== 200);

    const r2 = http.get(`${BASE_URL}/api/performance/stats?user_email=load@example.com`, { headers });
    check(r2, { 'perf stats 200': (r) => r.status === 200 });
  });

  group('Topical subjects list', () => {
    const r3 = http.get(`${BASE_URL}/api/topical/subjects?level=O-Level`, { headers });
    check(r3, { 'topical subjects 200': (r) => r.status === 200 });
  });

  group('Teacher dashboard', () => {
    const r4 = http.get(`${BASE_URL}/api/teacher/dashboard/stats`, { headers });
    check(r4, { 'teacher dashboard 200 or 403': (r) => [200, 403].includes(r.status) });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'docs/k6/dashboard.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
