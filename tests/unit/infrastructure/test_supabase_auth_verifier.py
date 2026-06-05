from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt

from aim.presentation.api.auth import SupabaseJWTVerifier


def test_supabase_verifier_supports_legacy_jwt_secret() -> None:
    secret = "backend-only-secret-with-at-least-32-bytes"
    issuer = "https://project.supabase.co/auth/v1"
    token = jwt.encode(
        {
            "sub": "11111111-1111-1111-1111-111111111111",
            "email": "student@test.com",
            "role": "authenticated",
            "aud": "authenticated",
            "iss": issuer,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        secret,
        algorithm="HS256",
    )

    user = SupabaseJWTVerifier(
        "https://project.supabase.co",
        "authenticated",
        jwt_secret=secret,
    ).verify(token)

    assert user.user_id == "11111111-1111-1111-1111-111111111111"
    assert user.email == "student@test.com"
    assert user.role == "authenticated"
