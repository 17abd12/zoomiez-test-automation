/**
 * k6 load test — GET /api/papers/random (hottest student endpoint)
 * Simulates students loading MCQ/SQ papers concurrently.
 * SLO: p95 < 800ms, error rate < 1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000';
const TEST_TOKEN = __ENV.LOAD_TEST_TOKEN || '';  // Set a pre-minted JWT

const errorRate = new Rate('errors');
const paperLoadTime = new Trend('paper_load_time');

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: __ENV.K6_DURATION || '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
    paper_load_time: ['p(95)<800'],
  },
};

const SUBJECTS = ['Chemistry', 'Physics', 'Biology', 'Mathematics'];
const TYPES = ['mcq', 'sq'];

export default function () {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];

  const res = http.get(
    `${BASE_URL}/api/papers/random?paper_type=${type}&subject=${encodeURIComponent(subject)}&level=O-Level`,
    {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const ok = check(res, {
    'status 200 or 404': (r) => [200, 404].includes(r.status),
    'p95 < 800ms': (r) => r.timings.duration < 800,
  });

  errorRate.add(!ok);
  paperLoadTime.add(res.timings.duration);

  sleep(0.5);
}
