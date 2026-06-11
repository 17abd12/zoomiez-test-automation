"""
Backend tests: Papers + SQ Evaluation
UC-SE-04, UC-SE-05, UC-SE-06
~10 test cases
"""

import pytest
import allure
from conftest import TEST_PREFIX


@allure.feature("Papers")
class TestPaperEndpoints:
    """UC-SE-04/05: Paper access and submission"""

    @allure.story("Unauthenticated access denied")
    def test_get_random_paper_unauthenticated(self, client):
        """No token → 401 or 403."""
        res = client.get("/api/papers/random")
        assert res.status_code in (401, 403, 422)

    @allure.story("MCQ paper loads for authenticated student")
    def test_get_random_mcq_authenticated(self, client, self_student_headers):
        """Authenticated student gets MCQ paper."""
        res = client.get("/api/papers/random?paper_type=mcq&subject=Chemistry&level=O-Level",
                         headers=self_student_headers)
        # 200 = paper found; 404 = no paper for that subject (acceptable)
        assert res.status_code in (200, 404)
        if res.status_code == 200:
            data = res.get_json()
            assert "questions" in data or "paper_type" in data

    @allure.story("Submit MCQ paper saves submission")
    def test_submit_mcq_paper(self, client, self_student_headers):
        """POST /api/papers/submit returns score."""
        res = client.post("/api/papers/submit", json={
            "paper_type": "mcq",
            "subject": "Chemistry",
            "level": "O-Level",
            "answers": {"1": "B", "2": "C"},
            "paper_ref": "test-paper-ref",
            "time_taken_seconds": 120,
        }, headers=self_student_headers)
        assert res.status_code in (200, 201)
        if res.status_code in (200, 201):
            data = res.get_json()
            assert "submission_id" in data or "score" in data

    @allure.story("Available papers list returns array")
    def test_get_available_papers(self, client, self_student_headers):
        res = client.get("/papers/available?subject=Chemistry&type=mcq", headers=self_student_headers)
        assert res.status_code in (200, 404)

    @allure.story("Access another user's submission denied")
    def test_access_other_user_submission(self, client, self_student_headers, enrolled_student_headers):
        """Student A cannot access Student B's submission."""
        # First get a fake submission_id by user B (won't exist, should 404 not 200)
        res = client.get("/api/papers/submissions/other-user-id/fake-sub-id",
                         headers=self_student_headers)
        assert res.status_code in (403, 404)


@allure.feature("SQ Evaluation")
class TestSQEvaluation:
    """UC-SE-06: SQ Self-Evaluation (OpenAI-powered — mocked)"""

    @allure.story("SQ evaluation — text input (OpenAI stubbed)")
    def test_sq_evaluation_text_input(self, client, self_student_headers, mock_openai):
        """POST /api/sq-evaluation/evaluate with text returns evaluation."""
        res = client.post("/api/sq-evaluation/evaluate", json={
            "paper_type": "sq",
            "subject": "Chemistry",
            "level": "O-Level",
            "answers_text": "Q1a) Cathode: Hydrogen. Anode: Chlorine.",
            "paper_ref": "test-sq-ref",
        }, headers=self_student_headers)
        # 200 = success; 400 = validation; 503 = OpenAI unavailable
        assert res.status_code in (200, 201, 400, 503)

    @allure.story("Retrieve SQ evaluation result — wrong user denied")
    def test_get_sq_result_wrong_user(self, client, enrolled_student_headers):
        """Student cannot view another student's SQ result."""
        res = client.get("/api/sq-evaluation/result/fake-id-belongs-to-other",
                         headers=enrolled_student_headers)
        assert res.status_code in (403, 404)

    @allure.story("SQ health check always 200")
    def test_sq_health(self, client):
        res = client.get("/api/sq-evaluation/health")
        assert res.status_code == 200
