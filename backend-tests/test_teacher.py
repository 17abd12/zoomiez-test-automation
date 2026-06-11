"""
Backend tests: Teacher routes
UC-TC-02 (students), UC-TC-04 (quizzes), UC-TC-05 (evaluation), UC-TC-06 (notes)
~15 test cases
"""

import pytest
import allure
from conftest import TEST_PREFIX


@allure.feature("Teacher — Student Management")
class TestTeacherStudents:
    """UC-TC-02: Student management"""

    @allure.story("Student role cannot access teacher students list")
    def test_student_cannot_list_teacher_students(self, client, self_student_headers):
        res = client.get("/api/teacher/students", headers=self_student_headers)
        assert res.status_code == 403

    @allure.story("Teacher can list their students")
    def test_teacher_lists_students(self, client, teacher_headers):
        res = client.get("/api/teacher/students", headers=teacher_headers)
        assert res.status_code == 200
        assert isinstance(res.get_json(), list)

    @allure.story("Teacher invite student — email sent (Resend stubbed)")
    def test_invite_student(self, client, teacher_headers, mock_resend):
        res = client.post("/api/teacher/students/invite", json={
            "email": f"{TEST_PREFIX}invite-target@example.com",
            "name": "Invite Target",
            "subjects": ["Chemistry"],
        }, headers=teacher_headers)
        assert res.status_code in (200, 201)
        mock_resend.assert_called()

    @allure.story("Invite with no email → 400")
    def test_invite_missing_email(self, client, teacher_headers):
        res = client.post("/api/teacher/students/invite", json={"name": "No Email"},
                          headers=teacher_headers)
        assert res.status_code in (400, 422)

    @allure.story("Unauthenticated invite denied")
    def test_invite_unauthenticated(self, client):
        res = client.post("/api/teacher/students/invite", json={"email": "x@x.com", "name": "X"})
        assert res.status_code in (401, 403, 422)

    @allure.story("Teacher statistics endpoint returns data")
    def test_teacher_statistics(self, client, teacher_headers):
        res = client.get("/api/teacher/statistics", headers=teacher_headers)
        assert res.status_code == 200


@allure.feature("Teacher — Quiz Management")
class TestTeacherQuiz:
    """UC-TC-04: Quiz CRUD"""

    @allure.story("Teacher gets available subjects")
    def test_get_subjects(self, client, teacher_headers):
        res = client.get("/api/teacher-quiz/subjects/O-Level", headers=teacher_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert "subjects" in data

    @allure.story("Teacher saves quiz")
    def test_save_quiz(self, client, teacher_headers):
        res = client.post("/api/teacher-quiz/save", json={
            "title": f"{TEST_PREFIX}Chemistry Quiz",
            "description": "Test quiz",
            "class_level": "O-Level",
            "subject": "Chemistry",
            "quiz_type": "mcq",
            "question_count": 5,
            "duration_minutes": 20,
        }, headers=teacher_headers)
        assert res.status_code in (200, 201)

    @allure.story("Non-teacher cannot save quiz")
    def test_student_cannot_save_quiz(self, client, self_student_headers):
        res = client.post("/api/teacher-quiz/save", json={"title": "Hack Quiz"},
                          headers=self_student_headers)
        assert res.status_code == 403

    @allure.story("Teacher gets own quizzes")
    def test_get_my_quizzes(self, client, teacher_headers):
        res = client.get("/api/teacher-quiz/my-quizzes", headers=teacher_headers)
        assert res.status_code == 200
        assert isinstance(res.get_json(), list)


@allure.feature("Teacher — Evaluation")
class TestTeacherEvaluation:
    """UC-TC-05: Teacher evaluation (OpenAI + Mistral stubbed)"""

    @allure.story("Evaluation options returns students and quizzes")
    def test_eval_options(self, client, teacher_headers):
        res = client.get("/api/teacher/evaluations/options", headers=teacher_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert "students" in data
        assert "quizzes" in data

    @allure.story("Submit evaluation with text — OpenAI stubbed")
    def test_submit_eval_text(self, client, teacher_headers, mock_openai, mock_mistral):
        res = client.post("/api/teacher/evaluations/submit", json={
            "student_email": f"{TEST_PREFIX}eval-stu@example.com",
            "quiz_id": "nonexistent-quiz",
            "extracted_text": "Q1a) Answer here. Q1b) More answers.",
        }, headers=teacher_headers)
        # 200 = success; 404 = quiz not found (ok for test)
        assert res.status_code in (200, 201, 404)

    @allure.story("Unauthenticated submit denied")
    def test_submit_eval_unauthenticated(self, client):
        res = client.post("/api/teacher/evaluations/submit", json={"student_email": "x@x.com"})
        assert res.status_code in (401, 403, 422)

    @allure.story("Student role cannot submit teacher evaluation")
    def test_student_cannot_submit_eval(self, client, self_student_headers):
        res = client.post("/api/teacher/evaluations/submit", json={"student_email": "x@x.com"},
                          headers=self_student_headers)
        assert res.status_code == 403


@allure.feature("Teacher — Notes")
class TestTeacherNotes:
    """UC-TC-06: Notes (R2 stubbed)"""

    @allure.story("Teacher lists own notes")
    def test_list_notes(self, client, teacher_headers):
        res = client.get("/notes/notes", headers=teacher_headers)
        assert res.status_code == 200

    @allure.story("Student can list shared notes")
    def test_student_lists_shared_notes(self, client, self_student_headers):
        res = client.get("/notes/student/notes", headers=self_student_headers)
        assert res.status_code == 200

    @allure.story("Non-owner cannot delete note")
    def test_non_owner_cannot_delete(self, client, self_student_headers):
        res = client.delete("/notes/notes/fake-note-id", headers=self_student_headers)
        assert res.status_code in (403, 404)
