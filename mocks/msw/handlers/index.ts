/**
 * MSW Handler registry — all sensitive routes stubbed here.
 * Import into Playwright/Cypress tests via msw/node (server) or msw/browser (page).
 *
 * SENSITIVE APIs stubbed:
 *   - OpenAI: sq-evaluation, teacher evaluation, eval enrichment
 *   - Mistral: (proxied via teacher eval — same stub)
 *   - Resend: all email sends (OTP, invites, report emails)
 *   - R2: file upload/download (note files, logos)
 */

import { http, HttpResponse } from 'msw';
import evaluationStub from '../../fixtures/mock-data/evaluation-stub.json';
import mcqStub from '../../fixtures/mock-data/papers-mcq-stub.json';
import sqStub from '../../fixtures/mock-data/papers-sq-stub.json';
import dashboardStub from '../../fixtures/mock-data/dashboard-stub.json';
import reportStub from '../../fixtures/mock-data/institution-report-stub.json';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── Auth handlers ──────────────────────────────────────────────────────────
export const authHandlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    const roleMap: Record<string, string> = {
      'self-student@example.com': 'student',
      'enrolled-student@example.com': 'student',
      'teacher@example.com': 'teacher',
      'institution@example.com': 'institution',
    };
    const role = roleMap[body.email];
    if (!role) return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        email: body.email,
        name: 'Test User',
        role,
        roles: [role],
        student_type: body.email.includes('enrolled') ? 'teacher_enrolled' : 'self_enrolled',
        onboarding_completed: true,
        institution_name: role === 'institution' ? 'Test Academy' : undefined,
      },
    });
  }),

  // OTP verification — always success in stubs
  http.post(`${API}/auth/verify-email`, () =>
    HttpResponse.json({ message: 'Email verified successfully' })
  ),

  // Resend OTP — stub (SENSITIVE: would call Resend)
  http.post(`${API}/auth/resend-otp`, () =>
    HttpResponse.json({ message: 'OTP resent' })
  ),

  // Forgot password — stub (SENSITIVE: would call Resend)
  http.post(`${API}/auth/forgot-password`, () =>
    HttpResponse.json({ message: 'Reset OTP sent' })
  ),

  http.post(`${API}/auth/reset-password`, () =>
    HttpResponse.json({ message: 'Password reset successful' })
  ),

  // Student registration — stub (SENSITIVE: would call Resend for OTP)
  http.post(`${API}/auth/register/student`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ message: 'Registration successful', email: body.email }, { status: 201 });
  }),

  // Institution signup — stub (SENSITIVE: Resend + R2 for logo)
  http.post(`${API}/api/institutions/signup`, () =>
    HttpResponse.json({ token: 'mock-jwt', user: { role: 'institution', email: 'new-inst@example.com' } }, { status: 201 })
  ),
];

// ─── Papers handlers ─────────────────────────────────────────────────────────
export const papersHandlers = [
  http.get(`${API}/api/papers/random`, () => HttpResponse.json(mcqStub)),
  http.get(`${API}/api/papers/mcq`, () => HttpResponse.json(mcqStub)),
  http.get(`${API}/api/papers/sq`, () => HttpResponse.json(sqStub)),
  http.get(`${API}/papers/available`, () =>
    HttpResponse.json({ papers: [{ id: 'chem-2023-mj', variant: 'Paper 1', year: '2023', session: 'May/June' }] })
  ),
  http.post(`${API}/api/papers/submit`, () =>
    HttpResponse.json({
      submission_id: 'test-sub-001',
      score: 2,
      total: 3,
      percentage: 67,
      correct: [2],
      wrong: [1, 3],
    })
  ),
  http.get(`${API}/api/papers/submissions/:userId/:submissionId`, () =>
    HttpResponse.json({ submission_id: 'test-sub-001', score: 2, total: 3 })
  ),
];

// ─── Evaluation handlers — SENSITIVE: OpenAI + Mistral ───────────────────────
export const evaluationHandlers = [
  // Teacher submits evaluation (calls Mistral OCR + OpenAI GPT internally)
  http.post(`${API}/api/teacher/evaluations/submit`, () =>
    HttpResponse.json(evaluationStub)
  ),
  http.get(`${API}/api/teacher/evaluations/report/:submissionId`, () =>
    HttpResponse.json(evaluationStub)
  ),
  http.get(`${API}/api/teacher/evaluations/history/:email`, () =>
    HttpResponse.json([
      { submission_id: 'test-eval-001', quiz_title: 'Chemistry SQ 1', subject: 'Chemistry', level: 'O-Level', evaluation_type: 'sq', total_marks_obtained: 14, total_marks_available: 20, percentage: 70 }
    ])
  ),
  http.get(`${API}/api/teacher/evaluations/options`, () =>
    HttpResponse.json({
      students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan' }],
      quizzes: [{ _id: 'test-quiz-001', title: 'Chemistry SQ Test 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'sq', question_count: 3 }],
    })
  ),

  // Student views their own evaluation report
  http.get(`${API}/api/student-quiz/evaluations/report/:submissionId`, () =>
    HttpResponse.json(evaluationStub)
  ),

  // SQ self-evaluation — SENSITIVE: OpenAI
  http.post(`${API}/api/sq-evaluation/evaluate`, () =>
    HttpResponse.json(evaluationStub)
  ),
  http.get(`${API}/api/sq-evaluation/result/:submissionId`, () =>
    HttpResponse.json(evaluationStub)
  ),

  // Eval enrichment — SENSITIVE: OpenAI gpt-4o-mini
  http.post(`${API}/api/evaluations/:submissionId/enrich`, () =>
    HttpResponse.json({ ...evaluationStub, ai_enriched: true })
  ),
];

// ─── Teacher handlers ────────────────────────────────────────────────────────
export const teacherHandlers = [
  http.get(`${API}/api/teacher/students`, () =>
    HttpResponse.json([
      { _id: 'stu-001', email: 'enrolled-student@example.com', name: 'Ahmed Khan', status: 'active', level: 'O-Level', subjects: ['Chemistry'] }
    ])
  ),
  // Invite — SENSITIVE: Resend
  http.post(`${API}/api/teacher/students/invite`, () =>
    HttpResponse.json({ message: 'Invitation sent', invite_id: 'inv-001' })
  ),
  http.get(`${API}/api/teacher/students/invites`, () =>
    HttpResponse.json([
      { invite_id: 'inv-001', email: 'new-student@example.com', status: 'pending', sent_at: '2024-03-15T10:00:00Z' }
    ])
  ),
  http.get(`${API}/api/teacher/statistics`, () =>
    HttpResponse.json({ total_students: 1, avg_score: 72, evaluations_done: 3 })
  ),
  http.get(`${API}/api/teacher/students/:studentId`, () =>
    HttpResponse.json({ _id: 'stu-001', email: 'enrolled-student@example.com', name: 'Ahmed Khan' })
  ),
  http.get(`${API}/api/teacher/students/:studentId/performance`, () =>
    HttpResponse.json({ subject_breakdown: [], trend: [], recent_tests: [] })
  ),
  http.get(`${API}/api/teacher/dashboard/stats`, () =>
    HttpResponse.json(dashboardStub.teacher_dashboard)
  ),
  http.get(`${API}/api/teacher/dashboard/activities`, () =>
    HttpResponse.json(dashboardStub.teacher_dashboard.recent_activities)
  ),
  http.get(`${API}/api/teacher/dashboard/performance-insights`, () =>
    HttpResponse.json(dashboardStub.teacher_dashboard.performance_insights)
  ),
  http.get(`${API}/api/teacher/dashboard/teacher-info`, () =>
    HttpResponse.json({ name: 'Test Teacher' })
  ),
];

// ─── Teacher quiz handlers ────────────────────────────────────────────────────
export const quizHandlers = [
  http.get(`${API}/api/teacher-quiz/subjects/:level`, () =>
    HttpResponse.json({ subjects: ['Chemistry', 'Physics', 'Biology', 'Mathematics'] })
  ),
  http.post(`${API}/api/teacher-quiz/preview`, () =>
    HttpResponse.json({ questions: mcqStub.questions })
  ),
  http.post(`${API}/api/teacher-quiz/save`, () =>
    HttpResponse.json({ quiz_id: 'test-quiz-001', message: 'Quiz saved' })
  ),
  http.get(`${API}/api/teacher-quiz/my-quizzes`, () =>
    HttpResponse.json([
      { _id: 'test-quiz-001', title: 'Chemistry Test 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'mcq', question_count: 3, status: 'active' }
    ])
  ),
  http.get(`${API}/api/teacher-quiz/:quizId`, ({ params }) =>
    HttpResponse.json({ _id: params.quizId, title: 'Chemistry Test 1', questions: mcqStub.questions })
  ),
  http.post(`${API}/api/teacher-quiz/:quizId/reshuffle`, () =>
    HttpResponse.json({ questions: mcqStub.questions })
  ),
  http.post(`${API}/api/teacher-quiz/:quizId/schedule`, () =>
    HttpResponse.json({ message: 'Quiz scheduled' })
  ),
  http.delete(`${API}/api/teacher-quiz/:quizId`, () =>
    HttpResponse.json({ message: 'Quiz deleted' })
  ),
  http.get(`${API}/api/teacher-quiz/:quizId/results`, () =>
    HttpResponse.json([{ student: 'Ahmed Khan', score: 2, total: 3, percentage: 67 }])
  ),
  http.get(`${API}/api/student-quiz/available`, () =>
    HttpResponse.json([
      { _id: 'test-quiz-001', title: 'Chemistry Test 1', subject: 'Chemistry', class_level: 'O-Level', quiz_type: 'mcq', question_count: 3, duration_minutes: 30 }
    ])
  ),
  http.post(`${API}/api/student-quiz/:quizId/start`, () =>
    HttpResponse.json({ attempt_id: 'attempt-001', questions: mcqStub.questions, started_at: new Date().toISOString() })
  ),
  http.post(`${API}/api/student-quiz/:quizId/submit`, () =>
    HttpResponse.json({ score: 2, total: 3, percentage: 67, result_id: 'result-001' })
  ),
  http.get(`${API}/api/student-quiz/results`, () =>
    HttpResponse.json([
      { submission_id: 'test-eval-001', quiz_title: 'Chemistry Test 1', score: 14, total: 20, percentage: 70, date: '2024-03-15' }
    ])
  ),
];

// ─── Institution handlers ─────────────────────────────────────────────────────
export const institutionHandlers = [
  http.get(`${API}/api/institution/dashboard`, () =>
    HttpResponse.json(dashboardStub.institution_dashboard)
  ),
  http.get(`${API}/api/institution/teachers`, () =>
    HttpResponse.json([
      { _id: 'tch-001', email: 'teacher@example.com', name: 'Test Teacher', status: 'active', subjects: ['Chemistry'], quiz_count: 5, evaluation_count: 12 }
    ])
  ),
  // Institution invites teacher — SENSITIVE: Resend
  http.post(`${API}/api/institution/teachers/invite`, () =>
    HttpResponse.json({ message: 'Teacher invited' })
  ),
  http.get(`${API}/api/institution/teachers/invites`, () =>
    HttpResponse.json([{ email: 'new-teacher@example.com', status: 'pending' }])
  ),
  http.post(`${API}/api/institution/teachers/invites/resend`, () =>
    HttpResponse.json({ message: 'Invite resent' })
  ),
  http.get(`${API}/api/institution/teachers/statistics`, () =>
    HttpResponse.json({ avg_score: 72, top_teacher: 'Test Teacher', class_count: 4 })
  ),
  http.get(`${API}/api/institution/students/analytics`, () =>
    HttpResponse.json({
      total_students: 145,
      avg_performance: 68,
      weak_students: 12,
      students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan', avg_score: 72 }],
      topic_breakdown: [{ topic: 'Atomic Structure', percentage: 75 }],
    })
  ),
  http.get(`${API}/api/institution/reports/options`, () =>
    HttpResponse.json({
      students: [{ email: 'enrolled-student@example.com', name: 'Ahmed Khan' }],
      teachers: [{ email: 'teacher@example.com', name: 'Test Teacher' }],
      subjects: ['Chemistry', 'Physics'],
      classes: ['O-Level', 'A-Level'],
      detail_levels: ['summary', 'detailed'],
      report_types: ['student', 'teacher', 'parent'],
    })
  ),
  http.post(`${API}/api/institution/reports/preview`, () =>
    HttpResponse.json(reportStub)
  ),
  // Download PDF — SENSITIVE: no real PDF, return fake blob
  http.post(`${API}/api/institution/reports/download`, () =>
    new HttpResponse(new Blob(['%PDF-1.4 test pdf content'], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="report.pdf"',
      },
    })
  ),
  // Email report — SENSITIVE: Resend
  http.post(`${API}/api/institution/reports/email`, () =>
    HttpResponse.json({ message: 'Report emailed successfully' })
  ),
  http.get(`${API}/api/institution/reports/history`, () =>
    HttpResponse.json([
      { id: 'rpt-001', report_type: 'student', target_email: 'enrolled-student@example.com', action: 'download', status: 'success', created_at: '2024-03-15T10:00:00Z' }
    ])
  ),
  http.get(`${API}/api/institution/profile`, () =>
    HttpResponse.json({ name: 'Test Academy', email: 'institution@example.com', logo_url: '' })
  ),
  // Institution profile update — SENSITIVE: R2 for logo
  http.put(`${API}/api/institution/profile`, () =>
    HttpResponse.json({ message: 'Profile updated', logo_url: 'https://stub.r2.example.com/logo.png' })
  ),
  http.get(`${API}/api/institution/parent-communication`, () =>
    HttpResponse.json({ status: 'coming_soon' })
  ),
];

// ─── Notes handlers — SENSITIVE: R2 for file upload/download ────────────────
export const notesHandlers = [
  http.post(`${API}/notes/notes`, () =>
    HttpResponse.json({ note_id: 'note-001', message: 'Note created' }, { status: 201 })
  ),
  http.get(`${API}/notes/notes`, () =>
    HttpResponse.json({
      notes: [{ _id: 'note-001', title: 'Electrolysis Notes', subject: 'Chemistry', class_level: 'O-Level', download_count: 12 }],
      total: 1, page: 1, limit: 10
    })
  ),
  http.get(`${API}/notes/student/notes`, () =>
    HttpResponse.json({
      notes: [{ _id: 'note-001', title: 'Electrolysis Notes', subject: 'Chemistry', class_level: 'O-Level' }],
      total: 1
    })
  ),
  http.delete(`${API}/notes/notes/:noteId`, () =>
    HttpResponse.json({ message: 'Note deleted' })
  ),
  http.post(`${API}/notes/notes/:noteId/download`, () =>
    HttpResponse.json({ message: 'Download counted' })
  ),
  // R2 file download stub
  http.get(`${API}/notes/download/:noteId`, () =>
    new HttpResponse(new Blob(['PDF content'], { type: 'application/pdf' }), {
      headers: { 'Content-Type': 'application/pdf' }
    })
  ),
  http.get(`${API}/notes/preview/:noteId`, () =>
    new HttpResponse(new Blob(['PDF content'], { type: 'application/pdf' }), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline' }
    })
  ),
  http.get(`${API}/api/bookmarks`, () => HttpResponse.json({ bookmarks: [] })),
  http.get(`${API}/api/bookmarks/notes`, () => HttpResponse.json({ notes: [] })),
  http.post(`${API}/api/bookmarks/:noteId`, () => HttpResponse.json({ message: 'Bookmarked' })),
  http.delete(`${API}/api/bookmarks/:noteId`, () => HttpResponse.json({ message: 'Removed' })),
];

// ─── Analytics + misc ────────────────────────────────────────────────────────
export const analyticsHandlers = [
  http.get(`${API}/api/analytics`, () =>
    HttpResponse.json({ subjects: [], topic_breakdown: [], trend: [], recommendations: [] })
  ),
  http.post(`${API}/api/analytics/refresh`, () =>
    HttpResponse.json({ message: 'Analytics refreshed' })
  ),
  http.get(`${API}/api/dashboard/stats`, () =>
    HttpResponse.json(dashboardStub.student_dashboard)
  ),
  http.get(`${API}/api/performance/stats`, () =>
    HttpResponse.json({ subjects: [], trend: [] })
  ),
  http.get(`${API}/api/onboarding/levels-subjects`, () =>
    HttpResponse.json({ 'O-Level': ['Chemistry', 'Physics', 'Biology'], 'A-Level': ['Chemistry', 'Physics', 'Mathematics'] })
  ),
  http.post(`${API}/api/onboarding/complete`, () =>
    HttpResponse.json({ message: 'Onboarding complete' })
  ),
  http.get(`${API}/api/onboarding/status`, () =>
    HttpResponse.json({ completed: true })
  ),
  http.get(`${API}/api/topical/subjects`, () =>
    HttpResponse.json({ 'O-Level': ['Chemistry', 'Physics'] })
  ),
  http.get(`${API}/api/topical/topics`, () =>
    HttpResponse.json([{ topic: 'Atomic Structure', question_count: 15 }, { topic: 'Bonding', question_count: 20 }])
  ),
  http.get(`${API}/api/topical/questions`, () =>
    HttpResponse.json({ questions: mcqStub.questions })
  ),
  http.get(`${API}/api/flashcards/subjects`, () =>
    HttpResponse.json({ 'O-Level': ['Chemistry'] })
  ),
  http.get(`${API}/api/flashcards/cards`, () =>
    HttpResponse.json({ cards: [{ front: 'What is ionic bonding?', back: 'Transfer of electrons between atoms.' }] })
  ),
  http.get(`${API}/api/users/profile`, () =>
    HttpResponse.json({ email: 'test@example.com', name: 'Test User', role: 'student' })
  ),
  http.put(`${API}/api/users/profile`, () =>
    HttpResponse.json({ message: 'Profile updated' })
  ),
  http.post(`${API}/api/users/change-password`, () =>
    HttpResponse.json({ message: 'Password changed' })
  ),
];

// ─── All handlers combined ───────────────────────────────────────────────────
export const handlers = [
  ...authHandlers,
  ...papersHandlers,
  ...evaluationHandlers,
  ...teacherHandlers,
  ...quizHandlers,
  ...institutionHandlers,
  ...notesHandlers,
  ...analyticsHandlers,
];
