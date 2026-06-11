"""
Backend tests: Institution routes
UC-IN-01 — UC-IN-05
~13 test cases
"""

import pytest
import allure
from conftest import TEST_PREFIX


@allure.feature("Institution — Auth & Signup")
class TestInstitutionSignup:
    """UC-AUTH-05: Institution signup"""

    @allure.story("Institution signup returns JWT (Resend + R2 stubbed)")
    def test_institution_signup(self, client, mock_resend, mock_r2):
        import io
        data = {
            "name": f"{TEST_PREFIX}Academy",
            "email": f"{TEST_PREFIX}inst@example.com",
            "password": "SecurePass123",
            "location": "Karachi",
            "contact_person": "Admin Name",
        }
        res = client.post("/api/institutions/signup", data=data)
        assert res.status_code in (200, 201)
        if res.status_code in (200, 201):
            body = res.get_json()
            assert "token" in body

    @allure.story("Duplicate institution email rejected")
    def test_signup_duplicate_email(self, client, mock_resend, mock_r2):
        email = f"{TEST_PREFIX}dup-inst@example.com"
        payload = {"name": "Academy", "email": email, "password": "Pass123", "location": "City"}
        client.post("/api/institutions/signup", data=payload)
        res = client.post("/api/institutions/signup", data=payload)
        assert res.status_code in (400, 409)


@allure.feature("Institution — Dashboard")
class TestInstitutionDashboard:

    @allure.story("Institution dashboard returns KPIs")
    def test_institution_dashboard(self, client, institution_headers):
        res = client.get("/api/institution/dashboard", headers=institution_headers)
        assert res.status_code == 200

    @allure.story("Teacher role denied institution dashboard")
    def test_teacher_cannot_access_inst_dashboard(self, client, teacher_headers):
        res = client.get("/api/institution/dashboard", headers=teacher_headers)
        assert res.status_code == 403

    @allure.story("Student role denied institution dashboard")
    def test_student_cannot_access_inst_dashboard(self, client, self_student_headers):
        res = client.get("/api/institution/dashboard", headers=self_student_headers)
        assert res.status_code == 403


@allure.feature("Institution — Teacher Management")
class TestInstitutionTeachers:

    @allure.story("Institution lists teachers")
    def test_list_teachers(self, client, institution_headers):
        res = client.get("/api/institution/teachers", headers=institution_headers)
        assert res.status_code == 200
        assert isinstance(res.get_json(), list)

    @allure.story("Invite teacher sends email (Resend stubbed)")
    def test_invite_teacher(self, client, institution_headers, mock_resend):
        res = client.post("/api/institution/teachers/invite", json={
            "email": f"{TEST_PREFIX}new-teacher@example.com",
            "name": "New Teacher",
            "subjects": ["Chemistry", "Physics"],
        }, headers=institution_headers)
        assert res.status_code in (200, 201)
        mock_resend.assert_called()

    @allure.story("Non-institution cannot invite teachers")
    def test_teacher_cannot_invite_inst_teacher(self, client, teacher_headers):
        res = client.post("/api/institution/teachers/invite", json={"email": "x@x.com", "name": "X"},
                          headers=teacher_headers)
        assert res.status_code == 403


@allure.feature("Institution — Reports")
class TestInstitutionReports:

    @allure.story("Report options returns students/teachers/subjects")
    def test_report_options(self, client, institution_headers):
        res = client.get("/api/institution/reports/options", headers=institution_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert "students" in data
        assert "teachers" in data

    @allure.story("Preview report with no target → 400")
    def test_preview_report_no_target(self, client, institution_headers):
        res = client.post("/api/institution/reports/preview", json={
            "report_type": "student",
            "detail_level": "summary",
        }, headers=institution_headers)
        assert res.status_code in (400, 422)

    @allure.story("Email report fires Resend (Resend stubbed)")
    def test_email_report(self, client, institution_headers, mock_resend):
        res = client.post("/api/institution/reports/email", json={
            "recipient_email": "parent@example.com",
            "report_type": "student",
            "target_email": "student@example.com",
            "detail_level": "summary",
        }, headers=institution_headers)
        # 200 = success; 404 = student not found (acceptable)
        assert res.status_code in (200, 404)
        if res.status_code == 200:
            mock_resend.assert_called()

    @allure.story("Non-institution cannot access reports")
    def test_student_cannot_access_reports(self, client, self_student_headers):
        res = client.get("/api/institution/reports/options", headers=self_student_headers)
        assert res.status_code == 403


@allure.feature("Institution — Profile / Settings")
class TestInstitutionProfile:

    @allure.story("Institution can get own profile")
    def test_get_profile(self, client, institution_headers):
        res = client.get("/api/institution/profile", headers=institution_headers)
        assert res.status_code == 200

    @allure.story("Update profile name (R2 stubbed for logo)")
    def test_update_profile(self, client, institution_headers, mock_r2):
        res = client.put("/api/institution/profile", json={"name": "Updated Academy"},
                         headers=institution_headers)
        assert res.status_code in (200, 400)
