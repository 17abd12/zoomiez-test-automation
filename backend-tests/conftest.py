"""
pytest conftest — shared fixtures for all backend tests.
- Flask test client
- JWT auth headers per role
- Self-cleaning test data (TEST_PREFIX pattern)
- Mocks for all sensitive APIs (OpenAI, Resend, R2, Mistral)
"""

import os
import sys
import time
import pytest
import dotenv
from unittest.mock import MagicMock, patch

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

# Allow importing from the backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

# Unique prefix per test run — all test data uses this prefix for easy cleanup
TEST_PREFIX = f"ztest_{int(time.time())}_"


@pytest.fixture(scope="session")
def app():
    """Create Flask app in test mode."""
    os.environ["APP_ENV"] = "local"
    os.environ["MONGO_URI"] = os.environ.get("MONGO_URI_TEST", "mongodb://localhost:27017/zoomiez_test")
    os.environ["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "test-secret-key")

    from app import create_app
    flask_app = create_app()
    flask_app.config["TESTING"] = True
    flask_app.config["WTF_CSRF_ENABLED"] = False
    yield flask_app


@pytest.fixture(scope="session")
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def mongo_db(app):
    """Direct MongoDB connection for assertions and cleanup."""
    from app import mongo
    yield mongo.db


@pytest.fixture(autouse=True)
def cleanup_test_data(mongo_db):
    """Auto-cleanup: delete all test documents after each test."""
    yield
    try:
        # Clean up users, evaluations, quizzes, invitations with test prefix
        for collection in ["users", "teacher_evaluations", "quiz_submissions", "quizzes", "invitations", "notes", "institution_reports"]:
            try:
                mongo_db[collection].delete_many({"email": {"$regex": f"^{TEST_PREFIX}"}})
                mongo_db[collection].delete_many({"student_email": {"$regex": f"^{TEST_PREFIX}"}})
                mongo_db[collection].delete_many({"target_email": {"$regex": f"^{TEST_PREFIX}"}})
            except Exception:
                pass
    except Exception:
        pass


# ─── Auth headers per role ───────────────────────────────────────────────────

from utils.jwt_helper import auth_header

@pytest.fixture()
def self_student_headers():
    return auth_header(f"{TEST_PREFIX}self@example.com", "student", student_type="self_enrolled")


@pytest.fixture()
def enrolled_student_headers():
    return auth_header(f"{TEST_PREFIX}enrolled@example.com", "student", student_type="teacher_enrolled")


@pytest.fixture()
def teacher_headers():
    return auth_header(f"{TEST_PREFIX}teacher@example.com", "teacher")


@pytest.fixture()
def institution_headers():
    return auth_header(f"{TEST_PREFIX}inst@example.com", "institution", institution_name="Test Academy")


# ─── Sensitive API mocks ─────────────────────────────────────────────────────

@pytest.fixture()
def mock_openai(mocker):
    """Mock OpenAI client — prevents real API calls, returns stub evaluation."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"mistake": "Student omitted key detail.", "improve": "Review section 3.2."}'

    mock_client.chat.completions.create.return_value = mock_response

    # Patch everywhere OpenAI is instantiated
    mocker.patch("app.services.sq_evaluation_service._client", mock_client)
    mocker.patch("app.services.teacher_evaluation_service._client", mock_client)
    mocker.patch("app.services.eval_grading_service._client", mock_client)
    return mock_client


@pytest.fixture()
def mock_mistral(mocker):
    """Mock Mistral OCR client — returns stub extracted text."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.pages = [MagicMock()]
    mock_response.pages[0].markdown = "Q1a) Cathode: Hydrogen. Anode: Chlorine.\nQ1b) Cl- is more concentrated."

    mock_client.ocr.process.return_value = mock_response
    mocker.patch("app.services.teacher_evaluation_service._mistral_client", mock_client)
    return mock_client


@pytest.fixture()
def mock_resend(mocker):
    """Mock Resend email — prevents real emails, returns stub success."""
    mock_send = mocker.patch("app.utils.mailer.resend.Emails.send")
    mock_send.return_value = {"id": "re_test_123", "from": "onboarding@resend.dev"}
    return mock_send


@pytest.fixture()
def mock_r2(mocker):
    """Mock Cloudflare R2 (boto3 S3) — prevents real file uploads."""
    mock_s3 = MagicMock()
    mock_s3.put_object.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}
    mock_s3.get_object.return_value = {
        "Body": MagicMock(read=lambda: b"%PDF-1.4 test content"),
        "ContentType": "application/pdf",
    }
    mock_s3.delete_object.return_value = {}
    mocker.patch("app.utils.r2_storage.boto3.client", return_value=mock_s3)
    return mock_s3
