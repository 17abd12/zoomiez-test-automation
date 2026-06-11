"""
Backend tests: UC-AUTH-01 — UC-AUTH-04
Covers: register, OTP verify, login, forgot/reset password
~12 test cases
"""

import pytest
import allure
from conftest import TEST_PREFIX


@allure.feature("Authentication")
class TestStudentRegistration:
    """UC-AUTH-01: Student Registration"""

    @allure.story("Happy path registration")
    def test_register_student_happy_path(self, client, mock_resend):
        """POST /auth/register/student → 201 + OTP email sent."""
        email = f"{TEST_PREFIX}new-student@example.com"
        res = client.post("/auth/register/student", json={
            "email": email,
            "password": "SecurePass123",
            "name": "Test Student",
            "class_level": "O-Level",
            "school": "Test School",
        })
        assert res.status_code == 201
        data = res.get_json()
        assert "email" in data or "message" in data
        # Verify Resend was called (OTP email sent)
        mock_resend.assert_called_once()

    @allure.story("Duplicate email rejected")
    def test_register_duplicate_email(self, client, mock_resend):
        """Second registration with same email returns 400."""
        email = f"{TEST_PREFIX}dup@example.com"
        payload = {"email": email, "password": "Pass123!", "name": "Dup User", "class_level": "O-Level", "school": "School"}
        client.post("/auth/register/student", json=payload)  # first
        res = client.post("/auth/register/student", json=payload)  # second
        assert res.status_code == 400
        assert "already" in (res.get_json().get("error", "")).lower()

    @allure.story("Missing required fields")
    def test_register_missing_email(self, client):
        res = client.post("/auth/register/student", json={"password": "Pass123", "name": "No Email"})
        assert res.status_code in (400, 422)


@allure.feature("Authentication")
class TestEmailVerification:
    """UC-AUTH-02: OTP Verification"""

    @allure.story("Invalid OTP rejected")
    def test_verify_wrong_otp(self, client):
        """Wrong OTP returns 400."""
        res = client.post("/auth/verify-email", json={
            "email": f"{TEST_PREFIX}verify@example.com",
            "otp": "000000",
        })
        assert res.status_code in (400, 404)

    @allure.story("Missing OTP field")
    def test_verify_missing_otp(self, client):
        res = client.post("/auth/verify-email", json={"email": f"{TEST_PREFIX}x@example.com"})
        assert res.status_code in (400, 422)


@allure.feature("Authentication")
class TestLogin:
    """UC-AUTH-03: Login"""

    @allure.story("Invalid credentials")
    def test_login_wrong_password(self, client):
        """Wrong credentials return 401."""
        res = client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword123",
        })
        assert res.status_code == 401

    @allure.story("Missing email field")
    def test_login_missing_email(self, client):
        res = client.post("/auth/login", json={"password": "Pass123"})
        assert res.status_code in (400, 422)

    @allure.story("Missing password field")
    def test_login_missing_password(self, client):
        res = client.post("/auth/login", json={"email": "test@example.com"})
        assert res.status_code in (400, 422)


@allure.feature("Authentication")
class TestForgotPassword:
    """UC-AUTH-04: Forgot / Reset Password"""

    @allure.story("Forgot password unknown email — no enumeration")
    def test_forgot_password_unknown_email(self, client, mock_resend):
        """Unknown email should not reveal user existence (200 or generic success)."""
        res = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})
        # Should not return 404 — no enumeration
        assert res.status_code not in (404,)

    @allure.story("Reset with wrong OTP")
    def test_reset_wrong_otp(self, client):
        res = client.post("/auth/reset-password", json={
            "email": f"{TEST_PREFIX}r@example.com",
            "otp": "000000",
            "new_password": "NewPass123!",
        })
        assert res.status_code in (400, 404)

    @allure.story("Reset missing fields")
    def test_reset_missing_fields(self, client):
        res = client.post("/auth/reset-password", json={"email": "x@example.com"})
        assert res.status_code in (400, 422)
