"""Supabase Auth dependencies for FastAPI routes."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from aim.infrastructure.config import get_settings
from aim.infrastructure.database.models.student import StudentORM

try:  # pragma: no cover - exercised when auth is enabled in deployment
    import jwt
    from jwt import PyJWKClient
    from jwt.exceptions import InvalidTokenError, PyJWKClientError
except ImportError:  # pragma: no cover - defensive packaging guard
    jwt = None
    PyJWKClient = None
    InvalidTokenError = Exception
    PyJWKClientError = Exception


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class SupabaseUser:
    user_id: str
    email: str | None
    role: str | None
    claims: dict[str, Any]


class SupabaseJWTVerifier:
    def __init__(
        self,
        supabase_url: str,
        audience: str,
        jwt_secret: str | None = None,
    ) -> None:
        if jwt is None:
            raise RuntimeError("PyJWT[crypto] is required for Supabase JWT verification.")
        self._issuer = supabase_url.rstrip("/") + "/auth/v1"
        self._audience = audience
        self._jwt_secret = jwt_secret
        self._jwks_client = (
            None
            if jwt_secret
            else PyJWKClient(self._issuer + "/.well-known/jwks.json")
        )

    def verify(self, token: str) -> SupabaseUser:
        try:
            if self._jwt_secret:
                claims = jwt.decode(
                    token,
                    self._jwt_secret,
                    algorithms=["HS256"],
                    audience=self._audience,
                    issuer=self._issuer,
                )
                return self._user_from_claims(claims)

            if self._jwks_client is None:
                raise PyJWKClientError("JWKS client is not configured.")
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256"],
                audience=self._audience,
                issuer=self._issuer,
            )
            return self._user_from_claims(claims)
        except (InvalidTokenError, PyJWKClientError) as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase access token.",
            ) from exc

    @staticmethod
    def _user_from_claims(claims: dict[str, Any]) -> SupabaseUser:
        subject = claims.get("sub")
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Supabase access token is missing a user id.",
            )
        return SupabaseUser(
            user_id=str(subject),
            email=claims.get("email"),
            role=claims.get("role"),
            claims=dict(claims),
        )


def _soft_decode_supabase_token(token: str) -> SupabaseUser | None:
    """Extract user identity from a JWT without cryptographic verification.

    Only used when SUPABASE_URL / SUPABASE_JWT_SECRET are not configured on
    the backend (pilot / dev mode where supabase_auth_required is False).
    The Supabase frontend has already authenticated the user; we trust the
    token payload to identify who they are.
    """
    if jwt is None:
        return None
    try:
        claims = jwt.decode(token, options={"verify_signature": False})
        subject = claims.get("sub")
        if not subject:
            return None
        return SupabaseUser(
            user_id=str(subject),
            email=claims.get("email"),
            role=claims.get("role"),
            claims=dict(claims),
        )
    except Exception:
        return None


def get_current_supabase_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> SupabaseUser | None:
    settings = get_settings()

    if credentials is None:
        if settings.supabase_auth_required:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing bearer token.",
            )
        return None

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme.",
        )

    if settings.supabase_url:
        return SupabaseJWTVerifier(
            settings.supabase_url,
            settings.supabase_jwt_audience,
            settings.supabase_jwt_secret,
        ).verify(credentials.credentials)

    # SUPABASE_URL not configured on backend.
    if settings.supabase_auth_required:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_URL is required when Supabase auth is enabled.",
        )

    # Pilot / dev mode: Supabase auth is handled by the frontend only.
    # Soft-decode the token to extract user identity without signature
    # verification so student linking and /students/me work correctly.
    return _soft_decode_supabase_token(credentials.credentials)


def require_student_access(
    *,
    student_id: int,
    db: Session,
    current_user: SupabaseUser | None,
) -> None:
    if current_user is None:
        return

    student = db.query(StudentORM).filter(StudentORM.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    if not student.auth_user_id or str(student.auth_user_id) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authenticated user does not match this student.",
        )


def auth_user_id_for_student_create(
    *,
    email: str,
    current_user: SupabaseUser | None,
) -> str | None:
    if current_user is None:
        return None

    if current_user.email and current_user.email.lower() != email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student email must match the authenticated user.",
        )
    return current_user.user_id
