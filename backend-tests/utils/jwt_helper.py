"""
JWT mint helper — generate test tokens without hitting /auth/login.
Token shape matches what Flask backend issues (see app/utils/user_guard.py).
"""

import os
import time
import jwt as pyjwt
from typing import Optional


def mint_jwt(
    email: str,
    role: str,
    student_type: Optional[str] = None,
    institution_name: Optional[str] = None,
    logo_url: Optional[str] = None,
    onboarding_completed: bool = True,
    ttl_seconds: int = 3600,
) -> str:
    secret = os.environ.get("JWT_SECRET_KEY", "test-secret-key")
    now = int(time.time())
    payload = {
        "sub": email,
        "email": email,
        "role": role,
        "roles": [role],
        "onboarding_completed": onboarding_completed,
        "iat": now,
        "exp": now + ttl_seconds,
    }
    if student_type:
        payload["student_type"] = student_type
    if institution_name:
        payload["institution_name"] = institution_name
    if logo_url:
        payload["logo_url"] = logo_url
    return pyjwt.encode(payload, secret, algorithm="HS256")


def auth_header(email: str, role: str, **kwargs) -> dict:
    token = mint_jwt(email, role, **kwargs)
    return {"Authorization": f"Bearer {token}"}
